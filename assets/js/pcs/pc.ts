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

const pcDataSchema = z.object({
  campaign_pid: z.string(),
  name: z.string().max(15, "Name must be 15 characters or less."),
  alias: z.string().nullish(),
  portrait: z.string().nullish(),
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
