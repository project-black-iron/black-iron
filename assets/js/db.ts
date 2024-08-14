import { DBSchema, IDBPDatabase, openDB } from "idb";
import { Campaign, CampaignSchema } from "./campaigns/campaign";

type BlackIronDBSchema = DBSchema & CampaignSchema;

const DB_NAME = "black-iron";
const DB_VERSION = 1;

export class BlackIronDB {
  idb: Promise<IDBPDatabase<BlackIronDBSchema>> = this.openDB();

  async init() {
    const db = await this.idb;
    db.close();
    this.idb = this.openDB();
    return this.idb;
  }

  openDB() {
    return openDB<BlackIronDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore("campaigns", { keyPath: "id" });
      },
    });
  }

  async ready() {
    if (!this.idb) {
      await this.init();
    }
    return this.idb;
  }

  async getCampaign(id: string) {
    const data = await (await this.idb).get("campaigns", id);
    if (data) {
      return new Campaign(data);
    }
  }

  async listCampaigns() {
    const tx = (await this.idb).transaction("campaigns");
    if (!tx) {
      return [];
    }
    return (await tx.store.getAll("campaigns")).map(
      (data) => new Campaign(data),
    );
  }
}
