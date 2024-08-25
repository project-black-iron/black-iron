// Campaign schema, class, and database definitions.

import { IDBPDatabase } from "idb";
import { BlackIronDBSchema } from "../db";
import { AbstractSyncable, ISyncable, SyncableConflictError } from "../sync";

export interface CampaignSchema {
  campaigns: {
    key: string;
    value: ICampaign;
    indexes: { slug: string };
  };
}

export enum CampaignRole {
  Player = "player",
  Guide = "guide",
  Owner = "owner",
}

export interface ICampaign extends ISyncable {
  name: string;
  slug: string;
  description: string;
  memberships: CampaignMembership[];
}

export interface CampaignMembership {
  user_id: string;
  roles: CampaignRole[];
}

export class Campaign extends AbstractSyncable implements ICampaign {
  name: string;
  slug: string;
  description: string;
  memberships: CampaignMembership[];

  static dbUpgrade(db: IDBPDatabase<BlackIronDBSchema>) {
    const store = db.createObjectStore("campaigns", { keyPath: "id" });
    store.createIndex("slug", "slug", { unique: true });
  }

  get route() {
    return "/play/campaigns";
  }

  constructor(public data: ICampaign) {
    super(data);
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.memberships = data.memberships;
  }

  eq(other: ICampaign) {
    return (
      super.eq(other)
      && this.name === other.name
      && this.slug === other.slug
      && this.description === other.description
      // TODO(@zkat): this is technically incorrect because key and membership
      // order might be different.
      && JSON.stringify(this.memberships) === JSON.stringify(other.memberships)
    );
  }

  merge(other: ICampaign) {
    const campaign = new Campaign(this);
    if (!this.eq(other)) {
      throw new SyncableConflictError();
    }
    return campaign;
  }

  toSyncable() {
    return {
      ...super.toSyncable(),
      name: this.name,
      slug: this.slug,
      description: this.description,
      memberships: this.memberships,
    };
  }
}
