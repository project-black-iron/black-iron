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
  _campaign_pid?: string;

  @ssrProvide({ context: BiCampaignContext.context })
  @property({ attribute: false })
  campaign?: Campaign;

  async willUpdate(changed: PropertyValues<this>) {
    if (changed.has("_campaign_pid") || changed.has("app")) {
      if (this._campaign_pid) {
        this.campaign = this._campaign_pid == null
          ? undefined
          : await this.app?.campaigns.get(this._campaign_pid);
      }
    }
    if (
      changed.has("campaign")
      && changed.get("campaign")?.pid !== this.campaign?.pid
    ) {
      this._campaign_pid = this.campaign?.pid;
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
