import { IDBPDatabase, StoreNames } from "idb";
import convert from "url-slug";
import { z } from "zod";
import { Campaign } from "../campaigns/campaign";
import { BlackIronDBSchema } from "../db";
import { AbstractEntity, entitySchema } from "../entity";
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

const pcDataSchema = z.object({
  campaign_pid: z.string(),
  alias: z.string().nullish(),
  name: z.string(),
  description: z.string(),
  pronouns: z.string(),
  initiative: z.nativeEnum(Initiative),
  portrait: z.string().nullish(),
  xp_added: z.coerce.number().nonnegative(),
  xp_spent: z.coerce.number().nonnegative(),
});

const pcSchema = entitySchema.extend({
  data: pcDataSchema,
});

export type IPCData = z.infer<typeof pcDataSchema>;

export type IPC = z.infer<typeof pcSchema>;

export class PC extends AbstractEntity implements IPC {
  // NB(@zkat): Assigned by AbstractEntity's constructor
  data!: IPCData;

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

  static dbUpgrade(db: IDBPDatabase<BlackIronDBSchema>) {
    db.createObjectStore("pcs", {
      keyPath: "pid",
    });
  }

  get schema() {
    return pcSchema;
  }

  get storeName(): StoreNames<BlackIronDBSchema> {
    return "pcs";
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
    return super.eq(other);
    // TODO(@zkat): fill this in
  }

  merge(other: IPC) {
    return new PC(mergeDeep(this, other), this.campaign, true);
  }
}
