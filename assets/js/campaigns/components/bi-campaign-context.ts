import { Channel } from "phoenix";
import { consume, createContext, provide } from "@lit/context";
import { html, LitElement, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { BlackIronApp } from "../../black-iron-app";
import { BlackIronCampaign } from "../campaign";
import { blackIronAppContext } from "../../components/bi-app-context";

@customElement("bi-campaign-context")
export class BiCampaignContext extends LitElement {
  static context = createContext<BlackIronCampaign | undefined>("campaign");
  @consume({ context: blackIronAppContext })
  @property({ attribute: false })
  app?: BlackIronApp;

  @property({ attribute: "campaign" })
  _campaignId?: string;

  @provide({ context: BiCampaignContext.context })
  @property({ attribute: false })
  campaign?: BlackIronCampaign;

  channel?: Channel;

  async willUpdate(changed: PropertyValues<this>) {
    if (changed.has("_campaignId") || changed.has("app")) {
      if (this._campaignId) {
        console.log("loading campaign", this._campaignId);
        this.campaign =
          this._campaignId == null
            ? undefined
            : await this.app?.db.getCampaign(this._campaignId);
      }
      if (this.campaign) {
        this.channel = this.app?.socket?.channel(
          "campaign_sync:" + this._campaignId,
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
    if (
      changed.has("campaign") &&
      changed.get("campaign")?.id !== this.campaign?.id
    ) {
      this._campaignId = this.campaign?.id;
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}