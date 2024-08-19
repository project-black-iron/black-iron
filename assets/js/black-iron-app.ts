import { Socket } from "phoenix";

import { BlackIronDB } from "./db";
import { CampaignManager } from "./campaigns/campaign-manager";

export class BlackIronApp {
  // >> socket.enableDebug()
  // >> socket.enableLatencySim(1000)  // enabled for duration of browser session
  // >> socket.disableLatencySim()
  db: BlackIronDB = new BlackIronDB();
  campaignManager = new CampaignManager(this);
  socket?: Socket;
  #userToken?: string;
  username?: string;

  constructor(userToken?: string) {
    this.userToken = userToken;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = undefined;
  }

  connect() {
    this.socket = new Socket("/socket", {
      longPollFallbackMs: 2500,
      params: { token: this.#userToken },
    });
    this.socket.connect();
  }

  set userToken(userToken: string | undefined) {
    this.#userToken = userToken;
    this.disconnect();
    if (userToken) {
      // We don't do any syncing with the server unless the player is actually
      // logged in.
      this.connect();
    }
  }
}
