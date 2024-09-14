import { IDBPDatabase, StoreNames } from "idb";
import convert from "url-slug";
import { Campaign } from "../campaigns/campaign";
import { BlackIronDBSchema } from "../db";
import { AbstractEntity, IEntity } from "../entity";

export interface PCSchema {
  pcs: {
    key: string;
    value: IPC;
  };
}

export interface IPCData {
  campaign_pid: string;
  name: string;
  alias?: string;
  portrait?: string;
}

export interface IPC extends IEntity<IPCData> {
  data: IPCData;
}

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
