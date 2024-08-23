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
  username: string;
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

  constructor(public data: ICampaign) {
    super(data);
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.memberships = data.memberships;
  }

  eq(other: ICampaign) {
    return (
      this.name === other.name
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

  toParams() {
    const params = new URLSearchParams({
      "campaign[id]": this.id,
      "campaign[name]": this.name,
      "campaign[slug]": this.slug,
      "campaign[description]": this.description,
    });
    // TODO: sync memberships too
    if (this._rev) {
      params.set("campaign[_rev]", this._rev);
    }
    if (this._revisions) {
      this._revisions.forEach((rev, i) => {
        params.set(`campaigns[_revisions][${i}]`, rev);
      });
    }
    return params;
  }
}
