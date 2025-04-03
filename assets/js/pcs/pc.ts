import { IDBPDatabase, StoreNames } from "idb";
import convert from "url-slug";
import * as v from "valibot";
import { Campaign } from "../campaigns/campaign";
import { BlackIronDBSchema } from "../db";
import { Entity, IEntity } from "../entity";
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

export class PC extends Entity<IPCData> implements IPC {
  static schema = Entity.makeSchema(pcDataSchema);

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
    return PC.schema;
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
    return new PC(
      mergeDeep(this, other),
      this.campaign,
      true,
    ) as unknown as this;
  }
}
