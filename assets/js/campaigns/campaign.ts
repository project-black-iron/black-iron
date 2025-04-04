// Campaign schema, class, and database definitions.
import { convert } from "url-slug";
import * as v from "valibot";
import { BlackIronApp } from "../black-iron-app";
import { entity, IEntity } from "../entity";
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

export type ICampaignMembership = v.InferOutput<
  typeof campaignMembershipSchema
>;
export type ICampaignData = v.InferOutput<typeof campaignDataSchema>;
export type ICampaign = IEntity<ICampaignData>;

export class Campaign extends entity("campaigns", campaignDataSchema) {
  pcs: PCManager;

  constructor(
    data: ICampaign,
    public app?: BlackIronApp,
  ) {
    super(data);
    this.pcs = new PCManager(this);
  }

  readonly baseRoute = "/play/campaigns";
  
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
  }

  merge(other: ICampaign) {
    const campaign = new Campaign(
      { ...this, ...other },
      this.app,
    ) as unknown as this;
    campaign.bumpRev();
    return campaign;
  }
}

function cmpMemberships(
  a: ICampaignMembership[],
  b: ICampaignMembership[],
) {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((membership) =>
    b.some(
      (otherMembership) =>
        membership.user_pid === otherMembership.user_pid
        && membership.roles.length === otherMembership.roles.length
        && membership.roles.every((role) => otherMembership.roles.includes(role)),
    )
  );
}
