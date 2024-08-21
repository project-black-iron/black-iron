import { DBSchema, IDBPDatabase, openDB, StoreNames } from "idb";
import { CampaignSchema, campaignsDbUpgrade } from "./campaigns/campaign";

export interface SyncableData {
  id: string;
  _rev: string;
  _revisions: string[];
  deleted_at: string | null;
}

export class SyncableClass {
  id: string;
  _rev: string;
  _revisions: string[];
  deleted_at: string | null;

  constructor(data: SyncableData) {
    this.id = data.id;
    this._rev = data._rev;
    this._revisions = data._revisions;
    this.deleted_at = data.deleted_at;
  }
}

type BlackIronDBSchema = DBSchema & CampaignSchema;

const DB_NAME = "black-iron";
const DB_VERSION = 1;

export class BlackIronDB {
  #idb: Promise<IDBPDatabase<BlackIronDBSchema>> = this.#openDB();

  #openDB() {
    return openDB<BlackIronDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        campaignsDbUpgrade(db);
      },
    });
  }

  async get<Name extends StoreNames<BlackIronDBSchema>>(
    storeName: Name,
    query: string | IDBKeyRange,
  ) {
    return (await this.#idb).get(storeName, query);
  }

  async transaction<Name extends StoreNames<BlackIronDBSchema>>(storeName: Name, mode: IDBTransactionMode) {
    return (await this.#idb).transaction(storeName, mode);
  }

  async put<Name extends StoreNames<BlackIronDBSchema>>(
    storeName: Name,
    value: BlackIronDBSchema[Name]["value"],
    key?: BlackIronDBSchema[Name]["key"],
  ) {
    return (await this.#idb).put(storeName, value, key);
  }

  async delete<Name extends StoreNames<BlackIronDBSchema>>(storeName: Name, key: BlackIronDBSchema[Name]["key"]) {
    return (await this.#idb).delete(storeName, key);
  }
}
