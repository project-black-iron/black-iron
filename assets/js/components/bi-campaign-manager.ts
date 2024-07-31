import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";

import { blackIronAppContext } from "./bi-app-context-provider.ts";
import { BlackIronApp } from "../black-iron-app.ts";
import { Channel } from "phoenix";

@customElement("bi-campaign-manager")
export class BiCampaignManager extends LitElement {
  static styles = css``;

  @consume({ context: blackIronAppContext })
  @property({ attribute: false })
  app?: BlackIronApp;

  @property()
  campaignId?: string;

  currentChannel?: Channel;


  render() {
    return html``;
  }
}
