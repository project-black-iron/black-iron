import { Channel } from "phoenix";
import { BlackIronApp } from "../black-iron-app";
import { Campaign, ICampaign } from "./campaign";

export class CampaignManager {
  channel?: Channel;
  activeCampaign?: Campaign;

  constructor(public app: BlackIronApp) {
    if (app.socket) {
      this.joinSyncChannel();
    }
  }

  joinSyncChannel() {
    if (!this.app.userId) {
      return;
    }
    this.channel = this.app.socket?.channel(
      "campaign_sync:" + this.app.userId,
      {},
    );
    this.channel
      ?.join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });
  }

  /**
   * Synchronizes local campaign state with a remote server, updating local
   * offline database state and uploading any differences back to the server.
   *
   * @param remoteCampaigns - If present, interpreted as the most recent
   * remote campaign state. New remote data will not be requested.
   */
  async syncCampaigns(remoteCampaigns?: ICampaign[]) {
    if (!remoteCampaigns) {
      // try {
      //   console.log("Fetchin campaigns from server:", remoteCampaigns);
      //   // TODO(@zkat): Still need JSON I guess :<
      //   const res = await this.app.fetch("/api/campaigns");
      //   if (res.ok) {
      //     remoteCampaigns = await res.json();
      //   } else {
      //     console.error("Failed to fetch remote campaigns, skipping sync", res);
      //     return;
      //   }
      // } catch (e) {
      //   console.error("Failed to fetch remote campaigns, skipping sync", e);
      //   return;
      // }
    }
    const conflicts: ICampaign[] = [];
    const allKeys: Set<string> = new Set();
    const remotes = new Map(
      (remoteCampaigns ?? []).map((c) => {
        allKeys.add(c.pid);
        return [c.pid, c];
      }),
    );
    const locals = new Map(
      (await this.listCampaigns()).map((c) => {
        allKeys.add(c.pid);
        return [c.pid, c];
      }),
    );
    await Promise.all(
      Array.from(allKeys).map(async (key) => {
        const remote = remotes.get(key);
        const local = locals.get(key);
        if (!remote && local && !local.memberships.length) {
          // Don't sync offline campaigns that aren't associated with any account.
          return;
        }
        return await this.app.db.sync(
          "campaigns",
          remote && new Campaign(remote),
          local,
        );
      }),
    );
    return conflicts;
  }

  async getCampaign(id: string) {
    const cdata = id ? await this.app.db.get("campaigns", id) : undefined;
    return cdata ? new Campaign(cdata) : undefined;
  }

  async saveCampaign(campaign: ICampaign) {
    return this.app.db.saveSyncable("campaigns", campaign);
  }

  async listCampaigns() {
    const campaigns = (await this.app.db.getAll("campaigns"))
      .filter((cdata) => {
        return (
          // Return both offline-only and online campaigns for the current
          // account.
          !cdata.memberships.length
          || cdata.memberships.find((m) => m.user_id === this.app.userId)
        );
      })
      .map((cdata) => new Campaign(cdata));
    campaigns.sort((a, b) => (a.name > b.name ? 1 : -1));
    return campaigns;
  }

  async mapCampaigns<T>(
    mode: IDBTransactionMode,
    callback: (campaign: Campaign) => T,
  ) {
    const txn = await this.app.db.transaction("campaigns", mode);
    let cursor = await txn.store.openCursor();
    const vals: T[] = [];
    while (cursor) {
      vals.push(callback(new Campaign(cursor.value)));
      cursor = await cursor.continue();
    }
    await txn.done;
    return vals;
  }
}
