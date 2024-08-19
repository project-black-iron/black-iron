import { createContext } from "@lit/context";
import { html, LitElement, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { BlackIronApp } from "../../black-iron-app";
import { BiAppContext } from "../../components/bi-app-context";
import { ssrConsume, ssrProvide } from "../../utils/ssr-context";
import { Campaign } from "../campaign";

@customElement("bi-campaign-context")
export class BiCampaignContext extends LitElement {
  static context = createContext<Campaign | undefined>("campaign");
  @ssrConsume({ context: BiAppContext.context })
  @property({ attribute: false })
  app?: BlackIronApp;

  @property({ attribute: "campaign" })
  _campaignId?: string;

  @ssrProvide({ context: BiCampaignContext.context })
  @property({ attribute: false })
  campaign?: Campaign;


  async willUpdate(changed: PropertyValues<this>) {
    if (changed.has("_campaignId") || changed.has("app")) {
      if (this._campaignId) {
        console.log("loading campaign", this._campaignId);
        this.campaign = this._campaignId == null
          ? undefined
          : await this.app?.campaignManager.getCampaign(this._campaignId);
      }
    }
    if (
      changed.has("campaign")
      && changed.get("campaign")?.id !== this.campaign?.id
    ) {
      this._campaignId = this.campaign?.id;
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
