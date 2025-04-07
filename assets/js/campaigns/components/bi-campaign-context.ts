import { consume, createContext, provide } from "@lit/context";
import { html, LitElement, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { BlackIronApp } from "../../black-iron-app";
import { BiAppContext } from "../../components/bi-app-context";
import { Route } from "../../utils/route";
import { Campaign, ICampaign } from "../campaign";

@customElement("bi-campaign-context")
export class BiCampaignContext extends LitElement {
  static context = createContext<Campaign | undefined>("campaign");

  @consume({ context: BiAppContext.context, subscribe: true })
  @property({ attribute: false })
  app?: BlackIronApp;

  @property(Campaign.propOpts("campaign"))
  _icampaign?: ICampaign;

  @provide({ context: BiCampaignContext.context })
  @property({ attribute: false })
  campaign?: Campaign;

  async #sync() {
    if (this._icampaign) {
      await this.app?.campaigns.sync(this._icampaign);
      this.campaign = await this.app?.campaigns.get(this._icampaign.pid);
    }
  }

  async #setFromRoute() {
    const pid = Route.matchLocation()?.campaign_pid;
    if (pid) {
      this.campaign = await this.app?.campaigns.get(pid);
    }
  }

  async willUpdate(changed: PropertyValues<this>) {
    if (changed.has("_icampaign") || changed.has("app")) {
      if (this._icampaign && this.app) {
        this.#sync();
      } else if (this.app) {
        this.#setFromRoute();
      }
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
