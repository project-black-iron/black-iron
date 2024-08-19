// Campaign schema, class, and database definitions.

import { DBSchema, IDBPDatabase } from "idb";
import { SyncableData } from "../db";

export interface CampaignSchema {
  campaigns: {
    key: string;
    value: CampaignData;
  };
}

export interface CampaignData extends SyncableData {
  name: string;
  slug: string;
  description: string;
  roles: string[];
}

export class Campaign implements CampaignData {
  id: string;
  _rev: string;
  _deleted: boolean;
  name: string;
  slug: string;
  description: string;
  roles: string[];

  constructor(
    public data: CampaignData,
  ) {
    this.id = data.id;
    this._rev = data._rev;
    this._deleted = data._deleted;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.roles = data.roles;
  }
}

export function campaignsDbUpgrade(db: IDBPDatabase<DBSchema & CampaignSchema>) {
  db.createObjectStore("campaigns", { keyPath: "id" });
}
