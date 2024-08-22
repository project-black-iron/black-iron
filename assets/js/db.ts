import { DBSchema, IDBPDatabase, openDB, StoreNames } from "idb";
import { CampaignSchema, campaignsDbUpgrade } from "./campaigns/campaign";

export interface SyncableData {
  id: string;
  _rev?: string;
  _revisions?: string[];
  deleted_at?: string;
}

export class SyncableClass {
  id: string;
  _rev?: string;
  _revisions?: string[];
  deleted_at?: string;

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
  static async openDB() {
    return new BlackIronDB(await BlackIronDB.#openDB());
  }
  private constructor(db: IDBPDatabase<BlackIronDBSchema>) {
    this.#idb = db;
  }

  #idb: IDBPDatabase<BlackIronDBSchema>;

  static #openDB() {
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
    storeName: Name,
    value: BlackIronDBSchema[Name]["value"],
    key?: BlackIronDBSchema[Name]["key"],
  ) {
    return await this.#idb.put(storeName, value, key);
  }

  async delete<Name extends StoreNames<BlackIronDBSchema>>(
    storeName: Name,
    key: BlackIronDBSchema[Name]["key"],
  ) {
    return await this.#idb.delete(storeName, key);
  }
}
