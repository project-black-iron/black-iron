import { Channel, Socket } from "phoenix";

import { BlackIronCampaign } from "./campaigns/campaign";
import { BlackIronDB } from "./db";

export class BlackIronApp {
  // >> socket.enableDebug()
  // >> socket.enableLatencySim(1000)  // enabled for duration of browser session
  // >> socket.disableLatencySim()
  socket?: Socket;
  db: BlackIronDB = new BlackIronDB();
  _activeCampaign?: BlackIronCampaign;
  currentChannel?: Channel;

  constructor(private userToken: string) {}

  connect() {
    this.socket = new Socket("/socket", {
      longPollFallbackMs: 2500,
      params: { token: this.userToken },
    });
    this.socket.connect();
  }

  async changeCampaign(id?: string) {
    this.activeCampaign = id ? await this.db.getCampaign(id) : undefined;
  }

  get activeCampaign() {
    return this._activeCampaign;
  }
  set activeCampaign(campaign: BlackIronCampaign | undefined) {
    this._activeCampaign = campaign;
    if (campaign) {
      this.connectCampaignSync(campaign.id);
    }
  }

  connectCampaignSync(id: string) {
    if (!this.socket) {
      this.connect();
    }
    if (this.currentChannel) {
      this.currentChannel.leave();
    }
    this.currentChannel = this.socket!.channel("campaign_sync:" + id, {});
    this.currentChannel
      .join();
  }
}
