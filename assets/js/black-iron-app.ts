import { Socket } from "phoenix";

import { CampaignManager } from "./campaigns/campaign-manager";
import { BlackIronDB } from "./db";

export class BlackIronApp {
  // >> socket.enableDebug()
  // >> socket.enableLatencySim(1000)  // enabled for duration of browser session
  // >> socket.disableLatencySim()
  campaignManager = new CampaignManager(this);
  socket?: Socket;
  #userToken?: string;

  static async createApp(
    userToken?: string,
    csrfToken?: string,
    userId?: string,
  ) {
    const app = new BlackIronApp(userToken, csrfToken, userId);
    const db = await BlackIronDB.openDB(app);
    app.db = db;
    return app;
  }

  db!: BlackIronDB;

  private constructor(
    userToken?: string,
    private csrfToken?: string,
    public userId?: string,
  ) {
    this.userToken = userToken;
  }

  async fetch(
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> {
    input = input instanceof Request ? input : new Request(input, init);
    if (this.#userToken) {
      input.headers.set("Authorization", `Bearer ${this.#userToken}`);
    }
    console.log("csrf token:", this.csrfToken);
    if (this.csrfToken) {
      input.headers.set("x-csrf-token", this.csrfToken);
    }
    return fetch(input);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = undefined;
  }

  connect() {
    this.socket = new Socket("/socket", {
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
