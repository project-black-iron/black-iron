import { BlackIronApp } from "../black-iron-app";
import { Campaign } from "../campaigns/campaign";
import { IPC, PC } from "./pc";

export class PCManager {
  app?: BlackIronApp;
  constructor(public campaign: Campaign) {
    this.app = campaign.app;
  }

  async get(pid: string) {
    const data = await this.app?.db.get("pcs", pid);
    return data ? new PC(data, this.campaign) : undefined;
  }

  async getAll() {
    return (await this.app?.db.getAll("pcs") ?? []).filter((pc) => pc.data.campaign_pid === this.campaign.pid).map(
      (data) => new PC(data, this.campaign),
    );
  }

  async sync(remote?: IPC, local?: IPC) {
    return this.app?.db.syncEntity(
      "pcs",
      remote && new PC(remote, this.campaign),
      local && new PC(local, this.campaign),
    );
  }

  async syncAll(remotes?: IPC[], locals?: IPC[]) {
    return this.app?.db.syncEntities(
      "pcs",
      (data: IPC) => new PC(data, this.campaign),
      remotes,
      locals,
    );
  }
}
