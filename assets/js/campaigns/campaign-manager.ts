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
    this.channel = this.app.socket?.channel(
      "campaign_list_sync:" + this.app.username,
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
    console.log("Syncing campaigns:", remoteCampaigns);
    if (!remoteCampaigns) {
      console.log("No remote campaigns to sync");
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
    const allKeys: Set<string> = new Set();
    const remotes = new Map(
      (remoteCampaigns ?? []).map((c) => {
        allKeys.add(c.id);
        return [c.id, c];
      }),
    );
    const locals = new Map(
      (await this.listCampaigns()).map((c) => {
        allKeys.add(c.id);
        return [c.id, c];
      }),
    );
    await Promise.all(
      Array.from(allKeys).map((key) => {
        const remote = remotes.get(key);
        const local = locals.get(key);
        return this.app.db.sync(remote && new Campaign(remote), local);
      }),
    );
  }

  async getCampaign(id: string) {
    const cdata = id ? await this.app.db.get("campaigns", id) : undefined;
    return cdata ? new Campaign(cdata) : undefined;
  }

  async listCampaigns() {
    return (await this.app.db.getAll("campaigns")).map(
      (cdata) => new Campaign(cdata),
    );
  }

  async mapCampaigns(
    mode: IDBTransactionMode,
    callback: (campaign: Campaign) => void,
  ) {
    const txn = await this.app.db.transaction("campaigns", mode);
    let cursor = await txn.store.openCursor();
    while (cursor) {
      callback(new Campaign(cursor.value));
      cursor = await cursor.continue();
    }
    await txn.done;
  }
}
