// Campaign schema, class, and database definitions.

import { IDBPDatabase } from "idb";
import { convert } from "url-slug";
import { BlackIronDBSchema } from "../db";
import { AbstractSyncable, ISyncable, SyncableConflictError } from "../sync";

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
  description: string;
  memberships: CampaignMembership[];
}

export interface CampaignMembership {
  user_id: string;
  roles: CampaignRole[];
}

export class Campaign extends AbstractSyncable implements ICampaign {
  name: string;
  description: string;
  memberships: CampaignMembership[];

  static dbUpgrade(db: IDBPDatabase<BlackIronDBSchema>) {
    db.createObjectStore("campaigns", {
      keyPath: "pid",
    });
  }

  get baseRoute() {
    return "/play/campaigns";
  }

  get route() {
    return `${this.baseRoute}/${this.pid}/${convert(this.name)}`;
  }

  constructor(data: ICampaign) {
    super(data);
    this.name = data.name;
    this.description = data.description;
    this.memberships = data.memberships;
  }

  eq(other: ICampaign) {
    return (
      super.eq(other)
      && this.name === other.name
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
      description: this.description,
      memberships: this.memberships,
    };
  }
}
