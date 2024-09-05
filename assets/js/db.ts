import { DBSchema, IDBPDatabase, openDB, StoreNames } from "idb";
import { BlackIronApp } from "./black-iron-app";
import { Campaign, CampaignSchema } from "./campaigns/campaign";
import { AbstractEntity, EntityConflictError, EntitySchema, IEntity } from "./entity";
import { PCSchema } from "./pcs/pc";
import { genPid } from "./utils/pid";

export type BlackIronDBSchema = DBSchema & EntitySchema & CampaignSchema & PCSchema;

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

  async #saveEntity<
    Name extends StoreNames<BlackIronDBSchema>,
    T extends BlackIronDBSchema[Name]["value"],
  >(storeName: Name, entity: T, bumpRev: boolean = true): Promise<T> {
    // No need to deep clone. We don't modify deeply.
    const ret: T = {
      pid: entity.pid || genPid(),
      rev: entity.rev,
      revisions: entity.revisions,
      conflict: entity.conflict,
      deleted_at: entity.deleted_at,
      data: entity.data,
    } as unknown as T; // Sorry.
    if (!ret.rev || bumpRev) {
      ret.rev = crypto.randomUUID();
      ret.revisions = [ret.rev, ...(ret.revisions || [])];
    }
    await this.#idb.put(storeName, ret);
    return ret;
  }

  async #uploadEntity(entity: AbstractEntity) {
    if (!this.app.userPid) {
      // Skip uploading if we're not logged in.
      return;
    }
    const url = new URL(window.location.href);
    url.pathname = entity.baseRoute;
    const res = await this.app.fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: entity.toEntity() }),
    });
    if (!res.ok) {
      if (res.status === 409) {
        throw new EntityConflictError();
      } else {
        throw new Error("Failed to upload entity entity");
      }
    }
  }

  async #getRemote(entity: AbstractEntity) {
    const url = new URL(window.location.href);
    url.pathname = entity.route;
    const res = await this.app.fetch(url);
    if (!res.ok) {
      throw new Error("Failed to fetch remote entity");
    }
    // TODO(@zkat): validate this!
    return (await res.json()) as IEntity<unknown>;
  }

  async syncEntity<Name extends StoreNames<BlackIronDBSchema>>(
    storeName: Name,
    remote?: AbstractEntity,
    local?: AbstractEntity,
  ): Promise<void> {
    try {
      if (remote && local) {
        if (remote.rev !== local.rev) {
          if (local.rev && remote.revisions?.includes(local.rev)) {
            // Remote has local version. Fast-forward local and save.
            await this.#saveEntity(storeName, remote, false);
          } else if (local.rev && local.revisions?.includes(remote.rev!)) {
            // Local has remote version. Fast-forward remote by uploading.
            await this.#uploadEntity(local);
          } else if (remote.eq(local)) {
            // Both are effectively the same. Overwrite the local DB's copy of
            // the entity to save the remote sync props.
            await this.#saveEntity(storeName, remote, false);
          } else {
            await this.#uploadEntity(local.merge(remote));
          }
        } else {
          // revs were both the same. Already synced
        }
      } else if (remote) {
        await this.#saveEntity(storeName, remote, false);
      } else if (local) {
        await this.#uploadEntity(local);
      } else {
        throw new Error("Must give at least one entity to sync.");
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
        throw new EntityConflictError();
      } else if (e instanceof EntityConflictError) {
        if (!local) {
          throw new Error(
            "This should never happen? Why is there a conflict if there's no local data?",
          );
        }
        await this.#saveEntity(
          storeName,
          {
            ...local,
            conflict: remote || (await this.#getRemote(local)),
          },
          false,
        );
      } else {
        throw e;
      }
    }
  }

  async syncEntities<Name extends StoreNames<BlackIronDBSchema>, Entype extends BlackIronDBSchema[Name]["value"]>(
    storeName: Name,
    factory: (data: Entype) => AbstractEntity,
    remoteEntities?: Entype[],
    localEntities?: Entype[],
    filter?: (remote?: Entype, local?: Entype) => boolean,
  ) {
    const allKeys: Set<string> = new Set();
    const remotes = new Map(
      (remoteEntities ?? []).map((c) => {
        allKeys.add(c.pid);
        return [c.pid, c];
      }),
    );
    const locals = new Map(
      (localEntities ?? []).map((c) => {
        allKeys.add(c.pid);
        return [c.pid, c];
      }),
    );
    await Promise.all(
      Array.from(allKeys).map(async (key) => {
        const remote = remotes.get(key);
        const local = locals.get(key);
        if (filter && !filter(remote, local)) {
          return;
        }
        return await this.app.db.syncEntity(
          storeName,
          remote && factory(remote),
          local && factory(local),
        );
      }),
    );
  }
}
