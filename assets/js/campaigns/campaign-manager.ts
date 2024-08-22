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

  async saveCampaign(campaign: FormData | CampaignData) {
    // TODO(@zkat): Validation
    if (campaign instanceof FormData) {
      campaign = Object.fromEntries(
        campaign.entries(),
      ) as unknown as CampaignData;
    }
    if (!campaign.id) {
      campaign.id = crypto.randomUUID();
    }
    await this.app?.db.put("campaigns", campaign);
  }

  async uploadCampaign(campaign: CampaignData) {
    if (!(campaign instanceof Campaign)) {
      campaign = new Campaign(campaign);
    }
    const url = new URL(window.location.href);
    url.pathname = "/play/campaigns"
    url.search = (campaign as Campaign).toParams().toString();
    // TODO(@zkat): csrf token
    const res = await this.app.fetch(url, {
      method: "POST",
    });
    if (!res.ok) {
      throw new Error("Failed to upload campaign");
    }
  }

  async syncCampaign(remote?: CampaignData, local?: CampaignData) {
    console.log("syncing campaign:", remote, local);
    if (remote && local) {
      if (remote._rev !== local._rev) {
        console.log("Need to merge/sync campaigns", remote.id, local.id);
        if (local._rev && remote._revisions?.includes(local._rev)) {
          console.log("fast-forward from remote campaign");
          await this.saveCampaign(remote);
        } else if (local._rev && local._revisions?.includes(remote._rev!)) {
          console.log("fast-forward from local campaign");
          await this.uploadCampaign(local);
        } else if (
          remote.slug === local.slug &&
          remote.name === local.name &&
          remote.description === local.description
        ) {
          // Both are effectively the same. Overwrite the local DB's copy of
          // the campaign to save the sync props.
          console.log("clobber local campaign because equal");
          await this.saveCampaign(remote);
        } else {
          console.log(
            "Both were modified. Try to merge, otherwise ask player to resolve conflict.",
          );
          if (remote.slug !== local.slug || remote.name !== local.name) {
            throw new Error("Conflict");
          }
          local.description = `${remote.description}\n\n${local.description}`;
          await this.uploadCampaign(local);
        }
      } else {
        console.log("_rev were both the same. Already synced");
      }
    } else if (remote) {
      console.log("saving remote campaign");
      await this.saveCampaign(remote);
    } else if (local) {
      console.log("uploading local campaign");
      await this.uploadCampaign(local);
    } else {
      throw new Error("Must give at least one campaign to sync.");
    }
  }

  /**
   * Synchronizes local campaign state with a remote server, updating local
   * offline database state and uploading any differences back to the server.
   *
   * @param remoteCampaigns - If present, interpreted as the most recent
   * remote campaign state. New remote data will not be requested.
   */
  async syncCampaigns(remoteCampaigns: CampaignData[] = []) {
    console.log("Syncing campaigns:", remoteCampaigns);
    if (!remoteCampaigns.length) {
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
    await Promise.all(
      Array.from(allKeys).map((key) => {
        const remote = remotes.get(key);
        const local = locals.get(key);
        return this.syncCampaign(remote, local);
      }),
    );
  }

  async getCampaign(id?: string) {
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
