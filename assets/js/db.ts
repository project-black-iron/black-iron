import { DBSchema, IDBPDatabase, openDB, StoreNames } from "idb";
import { BlackIronApp } from "./black-iron-app";
import { Campaign, CampaignSchema } from "./campaigns/campaign";

export type BlackIronDBSchema = DBSchema & SyncableSchema & CampaignSchema;

export interface SyncableSchema {
  _abstract: {
    key: string;
    value: ISyncable;
  };
}

export interface ISyncable {
  id: string;
  _rev?: string;
  _revisions?: string[];
  deleted_at?: string;
}

export abstract class AbstractSyncable implements ISyncable {
  get route() {
    return "/";
  }

  id: string;
  _rev?: string;
  _revisions?: string[];
  deleted_at?: string;

  constructor(data: ISyncable) {
    this.id = data.id;
    this._rev = data._rev;
    this._revisions = data._revisions;
    this.deleted_at = data.deleted_at;
  }

  eq(other: ISyncable): boolean {
    return this.id === other.id && this.deleted_at === other.deleted_at;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  merge(other: ISyncable): AbstractSyncable {
    throw new Error("Not implemented");
  }

  toParams(): URLSearchParams {
    return new URLSearchParams({});
  }
}

const DB_NAME = "black-iron";
const DB_VERSION = 1;

export class BlackIronDB {
  static async openDB(app: BlackIronApp) {
    return new BlackIronDB(app, await BlackIronDB.#openDB());
  }
  private constructor(
    private app: BlackIronApp,
    db: IDBPDatabase<BlackIronDBSchema>,
  ) {
    this.#idb = db;
  }

  #idb: IDBPDatabase<BlackIronDBSchema>;

  static #openDB() {
    return openDB<BlackIronDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        Campaign.dbUpgrade(db);
      },
    });
  }

  async get<Name extends StoreNames<BlackIronDBSchema>>(
    storeName: Name,
    query: string | IDBKeyRange,
  ) {
    return this.#idb.get(storeName, query);
  }

  async getAll<Name extends StoreNames<BlackIronDBSchema>>(storeName: Name) {
    return this.#idb.getAll(storeName);
  }

  async transaction<Name extends StoreNames<BlackIronDBSchema>>(
    storeName: Name,
    mode: IDBTransactionMode,
  ) {
    return this.#idb.transaction(storeName, mode);
  }

  async put<Name extends StoreNames<BlackIronDBSchema>>(
    storeName: Name,
    value: BlackIronDBSchema[Name]["value"],
    key?: BlackIronDBSchema[Name]["key"],
  ) {
    return this.#idb.put(storeName, value, key);
  }

  async delete<Name extends StoreNames<BlackIronDBSchema>>(
    storeName: Name,
    key: BlackIronDBSchema[Name]["key"],
  ) {
    return this.#idb.delete(storeName, key);
  }

  async saveSyncable<
    Name extends StoreNames<BlackIronDBSchema>,
    T extends BlackIronDBSchema[Name]["value"],
  >(storeName: Name, syncable: T, bumpRev: boolean = true): Promise<T> {
    const ret = { ...syncable }; // TODO(@zkat): deep clone?
    if (!ret.id) {
      ret.id = crypto.randomUUID();
    }
    if (!ret._rev || bumpRev) {
      ret._rev = crypto.randomUUID();
      if (!ret._revisions) {
        ret._revisions = [];
      }
      ret._revisions.unshift(ret._rev);
    }
    await this.#idb.put(storeName, ret);
    return ret;
  }

  async uploadSyncable(syncable: AbstractSyncable) {
    const url = new URL(window.location.href);
    url.pathname = syncable.route;
    url.search = syncable.toParams().toString();
    const res = await this.app.fetch(url, {
      method: "POST",
    });
    if (!res.ok) {
      if (res.status === 409) {
        // TODO(@zkat): fetch the remote version and add it as a `_conflict`
        throw new Error("Conflict");
      } else {
        throw new Error("Failed to upload syncable entity");
      }
    }
  }

  async sync<Name extends StoreNames<BlackIronDBSchema>>(
    storeName: Name,
    remote?: AbstractSyncable,
    local?: AbstractSyncable,
  ) {
    if (remote && local) {
      if (remote._rev !== local._rev) {
        if (local._rev && remote._revisions?.includes(local._rev)) {
          // Remote has local version. Fast-forward local and save.
          await this.saveSyncable(storeName, remote, false);
        } else if (local._rev && local._revisions?.includes(remote._rev!)) {
          // Local has remote version. Fast-forward remote by uploading.
          await this.uploadSyncable(local);
        } else if (remote.eq(local)) {
          // Both are effectively the same. Overwrite the local DB's copy of
          // the syncable to save the remote sync props.
          await this.saveSyncable(storeName, remote, false);
        } else {
          await this.uploadSyncable(local.merge(remote));
        }
      } else {
        // _revs were both the same. Already synced
      }
    } else if (remote) {
      await this.saveSyncable(storeName, remote, false);
    } else if (local) {
      await this.uploadSyncable(local);
    } else {
      throw new Error("Must give at least one syncable to sync.");
    }
  }
}
