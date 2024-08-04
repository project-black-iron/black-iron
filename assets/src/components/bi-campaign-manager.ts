import { consume, createContext, provide } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { Channel } from "phoenix";
import { BlackIronApp } from "../black-iron-app";
import { BlackIronCampaign } from "../campaigns/campaign";
import { blackIronAppContext } from "./bi-app-context-provider";

export const campaignContext = createContext<BlackIronCampaign | undefined>(
  "campaign",
);

@customElement("bi-campaign-manager")
export class BiCampaignManager extends LitElement {
  static styles = css``;

  @consume({ context: blackIronAppContext })
  @property({ attribute: false })
  app?: BlackIronApp;

  @property({ reflect: true })
  campaignId?: string;

  @provide({ context: campaignContext })
  @property({ attribute: false })
  campaign?: BlackIronCampaign;

  channel?: Channel;

  update(changedProps: Map<string, unknown>) {
    super.update(changedProps);
    if (changedProps.has("campaignId")) {
      (async () => {
        if (this.app && this.campaignId) {
          this.campaign = await this.app.db.getCampaign(this.campaignId);
        } else {
          this.campaign = undefined;
        }
      })();
    }
    if (changedProps.has("app") && this.app) {
      if (this.campaignId) {
        this.channel = this.app.socket?.channel(
          "campaign_sync:" + this.campaignId,
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
      } else {
        this.channel?.leave();
      }
    }
  }

  render() {
    return html``;
  }
}
