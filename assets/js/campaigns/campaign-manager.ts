import { Channel } from "phoenix";
import { BlackIronApp } from "../black-iron-app";
import { Campaign, CampaignData } from "./campaign";

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
  async syncCampaigns(remoteCampaigns?: CampaignData[]) {
    console.log("Syncing campaigns:", remoteCampaigns);
    if (!remoteCampaigns) {
      try {
        console.log("Fetchin campaigns from server:", remoteCampaigns);
        const res = await this.app.fetch("/api/campaigns");
        if (res.ok) {
          remoteCampaigns = await res.json();
        } else {
          console.error("Failed to fetch remote campaigns, skipping sync", res);
          return;
        }
      } catch (e) {
        console.error("Failed to fetch remote campaigns, skipping sync", e);
        return;
      }
    }
    if (remoteCampaigns) {
      const allKeys: Set<string> = new Set();
      const remotes = new Map(
        remoteCampaigns.map((c) => {
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
      for (const key of allKeys) {
        const remote = remotes.get(key);
        const local = locals.get(key);
        if (remote && local) {
          if (remote._rev !== local._rev) {
            console.log("Need to merge/sync campaigns", key);
            if (remote._revisions.includes(local._rev)) {
              console.log("We can fast-forward local data");
            } else if (local._revisions.includes(remote._rev)) {
              console.log("We can fast-forward remote data");
            } else {
              console.log(
                "Both were modified. Try to merge, otherwise ask player to resolve conflict.",
              );
            }
          }
        } else if (remote) {
          console.log("Adding campaign to local db", key);
        } else if (local) {
          console.log("Uploading campaign to remote", key);
        } else {
          throw new Error("Unreachable");
        }
      }
    }
  }

  async getCampaign(id?: string) {
    const cdata = id ? await this.app.db.get("campaigns", id) : undefined;
    return cdata ? new Campaign(cdata) : undefined;
  }

  async listCampaigns() {
    const txn = await this.app.db.transaction("campaigns", "readonly");
    const campaigns = await txn.store.getAll("campaigns");
    return campaigns.map((cdata) => new Campaign(cdata));
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
