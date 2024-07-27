import { Socket } from "phoenix";

export class BlackIronApp {
  // >> socket.enableDebug()
  // >> socket.enableLatencySim(1000)  // enabled for duration of browser session
  // >> socket.disableLatencySim()
  socket?: Socket;

  constructor(private userToken: string) {}

  connect() {
    this.socket = new Socket("/socket", {
      longPollFallbackMs: 2500,
      params: { token: this.userToken },
    });
    this.socket.connect();
  }

  joinCampaign(id: string) {
    if (!this.socket) {
      this.connect();
    }
    this.socket!.channel("campaign_sync:" + id, {})
      .join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });
  }
}
