// Campaign schema, class, and database definitions.

import { IDBPDatabase } from "idb";
import { convert } from "url-slug";
import { BlackIronApp } from "../black-iron-app";
import { BlackIronDBSchema } from "../db";
import { AbstractEntity, EntityConflictError, IEntity } from "../entity";
import { PCManager } from "../pcs/pc-manager";

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

export interface ICampaignData {
  name: string;
  description: string;
  memberships: ICampaignMembership[];
}

export interface ICampaign extends IEntity<ICampaignData> {
  data: ICampaignData;
}

export interface ICampaignMembership {
  user_pid: string;
  roles: CampaignRole[];
}

export class Campaign extends AbstractEntity implements ICampaign {
  // NB(@zkat): Assigned by AbstractEntity's constructor
  data!: ICampaignData;
  pcs: PCManager;

  constructor(data: ICampaign, public app?: BlackIronApp) {
    super(data);
    this.pcs = new PCManager(this);
  }

  static dbUpgrade(db: IDBPDatabase<BlackIronDBSchema>) {
    db.createObjectStore("campaigns", {
      keyPath: "pid",
    });
  }

  get baseRoute() {
    return "/play/campaigns";
  }

  get route() {
    return `${this.baseRoute}/${this.pid}/${convert(this.data.name)}`;
  }

  eq(other: ICampaign) {
    return (
      super.eq(other)
      && this.data.name === other.data.name
      && this.data.description === other.data.description
      && cmpMemberships(this.data.memberships, other.data.memberships)
    );

    function cmpMemberships(a: ICampaignMembership[], b: ICampaignMembership[]) {
      if (a.length !== b.length) {
        return false;
      }
      return a.every((membership) =>
        b.some((otherMembership) =>
          membership.user_pid === otherMembership.user_pid
          && membership.roles.length === otherMembership.roles.length
          && membership.roles.every((role) => otherMembership.roles.includes(role))
        )
      );
    }
  }

  merge(other: ICampaign) {
    const campaign = new Campaign(this, this.app);
    if (!this.eq(other)) {
      throw new EntityConflictError();
    }
    return campaign;
  }
}
