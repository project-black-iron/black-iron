// Campaign schema, class, and database definitions.

import { IDBPDatabase } from "idb";
import { convert } from "url-slug";
import { BlackIronDBSchema } from "../db";
import { AbstractEntity, EntityConflictError, IEntity } from "../entity";

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

export interface ICampaign extends IEntity {
  data: {
    name: string;
    description: string;
    memberships: CampaignMembership[];
  };
}

export interface CampaignMembership {
  user_id: string;
  roles: CampaignRole[];
}

export class Campaign extends AbstractEntity implements ICampaign {
  // NB(@zkat): initialized by AbstractEntity.
  data!: {
    name: string;
    description: string;
    memberships: CampaignMembership[];
  };

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

    function cmpMemberships(a: CampaignMembership[], b: CampaignMembership[]) {
      if (a.length !== b.length) {
        return false;
      }
      return a.every((membership) =>
        b.some((otherMembership) =>
          membership.user_id === otherMembership.user_id
          && membership.roles.length === otherMembership.roles.length
          && membership.roles.every((role) => otherMembership.roles.includes(role))
        )
      );
    }
  }

  merge(other: ICampaign) {
    const campaign = new Campaign(this);
    if (!this.eq(other)) {
      throw new EntityConflictError();
    }
    return campaign;
  }
}
