// Campaign schema, class, and database definitions.

import { IDBPDatabase, StoreNames } from "idb";
import { convert } from "url-slug";
import * as v from "valibot";
import { BlackIronApp } from "../black-iron-app";
import { BlackIronDBSchema } from "../db";
import { AbstractEntity, entitySchema } from "../entity";
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

const campaignMembershipSchema = v.object({
  user_pid: v.string(),
  roles: v.array(v.enum(CampaignRole)),
});

const campaignDataSchema = v.object({
  name: v.string(),
  description: v.string(),
  memberships: v.array(campaignMembershipSchema),
});

const campaignSchema = entitySchema.extend({
  data: campaignDataSchema,
});

export type ICampaignData = v.InferOutput<typeof campaignDataSchema>;
export type ICampaignMembership = v.InferOutput<typeof campaignMembershipSchema>;
export type ICampaign = v.InferOutput<typeof campaignSchema>;

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

  get schema() {
    return campaignSchema;
  }

  get storeName(): StoreNames<BlackIronDBSchema> {
    return "campaigns";
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
    const campaign = new Campaign({ ...this, ...other }, this.app);
    campaign.bumpRev();
    return campaign;
  }
}
