import { DBSchema, IDBPDatabase, openDB, StoreNames } from "idb";
import { BlackIronApp } from "./black-iron-app";
import { Campaign, CampaignSchema } from "./campaigns/campaign";
import { AbstractSyncable, ISyncable, SyncableConflictError, SyncableSchema } from "./sync";

export type BlackIronDBSchema = DBSchema & SyncableSchema & CampaignSchema;

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
    if (!ret.pid) {
      ret.pid = crypto.randomUUID();
    }
    if (!ret._rev || bumpRev) {
      ret._rev = crypto.randomUUID();
      ret._revisions = [ret._rev, ...(ret._revisions || [])];
    }
    await this.#idb.put(storeName, ret);
    return ret;
  }

  async uploadSyncable(syncable: AbstractSyncable) {
    if (!this.app.userId) {
      // Skip uploading if we're not logged in.
      return;
    }
    const url = new URL(window.location.href);
    url.pathname = syncable.baseRoute;
    const res = await this.app.fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: syncable.toSyncable() }),
    });
    if (!res.ok) {
      if (res.status === 409) {
        throw new SyncableConflictError();
      } else {
        throw new Error("Failed to upload syncable entity");
      }
    }
  }

  async getRemote(syncable: AbstractSyncable) {
    const url = new URL(window.location.href);
    url.pathname = syncable.route;
    const res = await this.app.fetch(url);
    if (!res.ok) {
      throw new Error("Failed to fetch remote entity");
    }
    // TODO(@zkat): validate this!
    return (await res.json()) as ISyncable;
  }

  async sync<Name extends StoreNames<BlackIronDBSchema>>(
    storeName: Name,
    remote?: AbstractSyncable,
    local?: AbstractSyncable,
  ) {
    try {
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
    } catch (e) {
      if (
        (e instanceof DOMException
          // @ts-expect-error - DOMError is deprecated, but it's what Safari
          // throws, because fuck Safari.
          || (window.DOMError && e instanceof DOMError))
        // @ts-expect-error - DOMError is deprecated, but it's what Safari
        // throws, because fuck Safari.
        && e.name === "ConstraintError"
      ) {
        if (!remote) {
          throw new Error(
            "This should never happen? Why is there a constraint error if there's no remote data?",
          );
        }
        // NB(@zkat): We can't just save the remote version, because our
        // _local_ db has some constraint error (like a unique index
        // violation). Each entity will have to deal with this in its own way.

        // let's let someone else deal with the conflict.
        throw new SyncableConflictError();
      } else if (e instanceof SyncableConflictError) {
        if (!local) {
          throw new Error(
            "This should never happen? Why is there a conflict if there's no local data?",
          );
        }
        await this.saveSyncable(
          storeName,
          {
            ...local,
            _conflict: remote || (await this.getRemote(local)),
          },
          false,
        );
      } else {
        throw e;
      }
    }
  }
}
