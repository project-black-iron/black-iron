import { BlackIronApp } from "../black-iron-app";
import { Campaign, ICampaign, ICampaignMembership } from "./campaign";

export class CampaignManager {
  constructor(public app: BlackIronApp) {}

  async get(pid: string) {
    const cdata = await this.app.db.get("campaigns", pid);
    return cdata ? new Campaign(cdata, this.app) : undefined;
  }

  async getAll() {
    const campaigns = (await this.app.db.getAll("campaigns"))
      .filter((cdata) => {
        return (
          // Return both offline-only and online campaigns for the current
          // account.
          !cdata.data.memberships.length
          || cdata.data.memberships.find(
            (m: ICampaignMembership) => m.user_pid === this.app.userPid,
          )
        );
      })
      .map((cdata) => new Campaign(cdata, this.app));

    return campaigns;
  }

  async sync(remote?: ICampaign, local?: ICampaign) {
    return this.app.db.syncEntity(
      "campaigns",
      remote && new Campaign(remote, this.app),
      local && new Campaign(local, this.app),
    );
  }

  async syncAll(remotes?: ICampaign[], locals?: ICampaign[]) {
    return this.app.db.syncEntities(
      "campaigns",
      (data: ICampaign) => new Campaign(data, this.app),
      remotes,
      locals,
      (remote?: ICampaign, local?: ICampaign) =>
        // Don't sync offline campaigns that aren't associated with any account.
        !!(remote || (local && !local.data.memberships.length)),
    );
  }
}
