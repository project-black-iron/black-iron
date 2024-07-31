import { DBSchema, IDBPDatabase, openDB } from "idb";
import { BlackIronCampaignSchema } from "./campaigns/campaign.ts";

type BlackIronDBSchema = DBSchema & BlackIronCampaignSchema

const DB_NAME = "black-iron";
const DB_VERSION = 1;

export class BlackIronDB {
  idb?: IDBPDatabase<BlackIronDBSchema>;

  async init() {
    if (this.idb) {
      this.idb.close();
    }
    this.idb = await openDB(DB_NAME, DB_VERSION);
    return this.idb;
  }

  async ready() {
    if (!this.idb) {
      await this.init();
    }
    return this.idb;
  }
}
