import convert from "url-slug";
import * as v from "valibot";

import { Campaign } from "../campaigns/campaign";
import { entity, IEntity } from "../entity";
import { mergeDeep } from "../utils/merge-deep";

export interface PCSchema {
  pcs: {
    key: string;
    value: IPC;
  };
}

export enum Initiative {
  OutOfCombat = "out-of-combat",
  HasInitiative = "has-initiative",
  NoInitiative = "no-initiative",
}

const pcDataSchema = v.object({
  campaign_pid: v.string(),
  alias: v.nullish(v.string()),
  name: v.string(),
  description: v.string(),
  pronouns: v.string(),
  initiative: v.enum(Initiative),
  portrait: v.nullish(v.string()),
  xp_added: v.pipe(
    v.unknown(),
    v.transform(Number),
    v.integer(),
    v.minValue(0),
  ),
  xp_spent: v.pipe(
    v.unknown(),
    v.transform(Number),
    v.integer(),
    v.minValue(0),
  ),
});

export type IPCData = v.InferOutput<typeof pcDataSchema>;

export type IPC = IEntity<IPCData>;

export class PC extends entity("pcs", pcDataSchema) {
  constructor(
    data: IPC,
    public campaign: Campaign,
    bumpRev?: boolean,
  ) {
    super(data);
    if (bumpRev) {
      this.bumpRev();
    }
  }

  get baseRoute() {
    return `/play/campaigns/${this.campaign ? this.campaign.pid : this.data.campaign_pid}/${
      convert(
        this.campaign.data.name,
      )
    }/pcs`;
  }

  get route() {
    return `${this.baseRoute}/${this.pid}/${convert(this.data.name)}`;
  }

  eq(other: IPC) {
    // TODO(@zkat): fill this in
    return super.eq(other);
  }

  merge(other: IPC) {
    return new PC(
      mergeDeep(this, other),
      this.campaign,
      true,
    ) as unknown as this;
  }
}
