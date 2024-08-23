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
  _storeName: StoreNames<BlackIronDBSchema>;
  _route: string;
}

export abstract class AbstractSyncable implements ISyncable {
  id: string;
  _rev?: string;
  _revisions?: string[];
  deleted_at?: string;
  _storeName: StoreNames<BlackIronDBSchema> = "abstract" as StoreNames<BlackIronDBSchema>;
  _route: string = "/";

  constructor(data: ISyncable) {
    this.id = data.id;
    this._rev = data._rev;
    this._revisions = data._revisions;
    this.deleted_at = data.deleted_at;
  }

  eq(other: ISyncable): boolean {
    return this === other;
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
    return await this.#idb.getAll(storeName);
  }

  async transaction<Name extends StoreNames<BlackIronDBSchema>>(
    storeName: Name,
    mode: IDBTransactionMode,
  ) {
    return await this.#idb.transaction(storeName, mode);
  }

  async put<Name extends StoreNames<BlackIronDBSchema>>(
    value: BlackIronDBSchema[Name]["value"],
    key?: BlackIronDBSchema[Name]["key"],
  ) {
    return await this.#idb.put(value._storeName, value, key);
  }

  async delete<Name extends StoreNames<BlackIronDBSchema>>(
    storeName: Name,
    key: BlackIronDBSchema[Name]["key"],
  ) {
    return await this.#idb.delete(storeName, key);
  }

  async saveSyncable<Name extends StoreNames<BlackIronDBSchema>>(
    syncable: BlackIronDBSchema[Name]["value"],
  ) {
    if (!syncable.id) {
      syncable.id = crypto.randomUUID();
    }
    await this.#idb.put(syncable._storeName, syncable);
  }

  async uploadSyncable(syncable: AbstractSyncable) {
    const url = new URL(window.location.href);
    url.pathname = syncable._route;
    url.search = syncable.toParams().toString();
    const res = await this.app.fetch(url, {
      method: "POST",
    });
    if (!res.ok) {
      throw new Error("Failed to upload campaign");
    }
  }

  async sync(remote?: AbstractSyncable, local?: AbstractSyncable) {
    if (remote && local) {
      if (remote._rev !== local._rev) {
        if (local._rev && remote._revisions?.includes(local._rev)) {
          await this.saveSyncable(remote);
        } else if (local._rev && local._revisions?.includes(remote._rev!)) {
          await this.uploadSyncable(local);
        } else if (remote.eq(local)) {
          // Both are effectively the same. Overwrite the local DB's copy of
          // the campaign to save the sync props.
          await this.saveSyncable(remote);
        } else {
          await this.uploadSyncable(local.merge(remote));
        }
      } else {
        // _revs were both the same. Already synced
      }
    } else if (remote) {
      await this.saveSyncable(remote);
    } else if (local) {
      await this.uploadSyncable(local);
    } else {
      throw new Error("Must give at least one campaign to sync.");
    }
  }

  async mapCampaigns(
    mode: IDBTransactionMode,
    callback: (campaign: Campaign) => void,
  ) {
    const txn = await this.app.db.transaction("campaigns", mode);
    let cursor = await txn.store.openCursor();
    while (cursor) {
      callback(new Campaign(cursor.value));
      cursor = await cursor.continue();
    }
    await txn.done;
  }
}
