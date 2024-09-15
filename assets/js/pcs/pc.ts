import { IDBPDatabase, StoreNames } from "idb";
import convert from "url-slug";
import { z } from "zod";
import { Campaign } from "../campaigns/campaign";
import { BlackIronDBSchema } from "../db";
import { AbstractEntity, entitySchema } from "../entity";

export interface PCSchema {
  pcs: {
    key: string;
    value: IPC;
  };
}

const pcDataSchema = z.object({
  campaign_pid: z.string(),
  name: z.string(),
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
  ) {
    super(data);
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
    const pc = new PC({ ...this, ...other }, this.campaign);
    pc.bumpRev();
    return pc;
  }
}
