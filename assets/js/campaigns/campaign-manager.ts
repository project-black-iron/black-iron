import { Campaign, CampaignData } from "./campaign";
import { BlackIronApp } from "../black-iron-app";
import { Channel } from "phoenix";

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
    console.log("Syncing campaigns from server:", remoteCampaigns);
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
