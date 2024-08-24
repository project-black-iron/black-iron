// Campaign schema, class, and database definitions.

import { IDBPDatabase } from "idb";
import { AbstractSyncable, BlackIronDBSchema, ISyncable } from "../db";

export interface CampaignSchema {
  campaigns: {
    key: string;
    value: ICampaign;
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
  userId: string;
  roles: CampaignRole[];
}

export class Campaign extends AbstractSyncable implements ICampaign {
  name: string;
  slug: string;
  description: string;
  memberships: CampaignMembership[];

  static dbUpgrade(db: IDBPDatabase<BlackIronDBSchema>) {
    db.createObjectStore("campaigns", { keyPath: "id" });
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
      && JSON.stringify(this.memberships) === JSON.stringify(other.memberships)
    );
  }

  merge(other: ICampaign) {
    if (!this.eq(other)) {
      // TODO: make this an actual class.
      throw new Error("Conflict");
    }
    return new Campaign(this);
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
