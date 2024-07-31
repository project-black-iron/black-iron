import { Channel, Socket } from "phoenix";
import { BlackIronDB } from "./db.ts";
import { BlackIronCampaign } from "./campaigns/campaign.ts";


export class BlackIronApp {
  // >> socket.enableDebug()
  // >> socket.enableLatencySim(1000)  // enabled for duration of browser session
  // >> socket.disableLatencySim()
  socket?: Socket;
  db: BlackIronDB = new BlackIronDB();
  activeCampaign?: BlackIronCampaign;
  currentChannel?: Channel;

  constructor(private userToken: string) {}

  connect() {
    this.socket = new Socket("/socket", {
      longPollFallbackMs: 2500,
      params: { token: this.userToken },
    });
    this.socket.connect();
  }

  // update(changedProps: Map<string, unknown>) {
  //   super.update(changedProps);
  //   if (changedProps.has("campaignId") && this.campaignId) {
  //     this.connectCampaignSync(this.campaignId);
  //   }
  // }

  connectCampaignSync(id: string) {
    if (!this.socket) {
      this.connect();
    }
    if (this.currentChannel) {
      this.currentChannel.leave();
    }
    this.currentChannel = this.socket!.channel("campaign_sync:" + id, {});
    this.currentChannel
      .join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });
  }
}
