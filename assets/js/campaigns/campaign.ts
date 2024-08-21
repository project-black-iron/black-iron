// Campaign schema, class, and database definitions.

import { DBSchema, IDBPDatabase } from "idb";
import { SyncableClass, SyncableData } from "../db";

export interface CampaignSchema {
  campaigns: {
    key: string;
    value: CampaignData;
  };
}

export enum CampaignRole {
  Player = "player",
  Guide = "guide",
  Owner = "owner",
}

export interface CampaignData extends SyncableData {
  name: string;
  slug: string;
  description: string;
  // TODO(@zkat): would be nice if the server just sent us an object instead of an
  // array...
  memberships: CampaignMembership[];
}

export interface CampaignMembership {
  username: string;
  roles: CampaignRole[];
}

export class Campaign extends SyncableClass implements CampaignData {
  name: string;
  slug: string;
  description: string;
  memberships: CampaignMembership[];

  constructor(public data: CampaignData) {
    super(data);
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.memberships = data.memberships;
  }
}

export function campaignsDbUpgrade(
  db: IDBPDatabase<DBSchema & CampaignSchema>,
) {
  db.createObjectStore("campaigns", { keyPath: "id" });
}
