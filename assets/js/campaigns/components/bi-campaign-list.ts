import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { CampaignData } from "../campaign";
import { consume } from "@lit/context";
import { BiAppContext } from "../../components/bi-app-context";
import { BlackIronApp } from "../../black-iron-app";

@customElement("bi-campaign-list")
export class BiCampaignList extends LitElement {
  static styles = css`
    :host {
    }
  `;

  @property({ attribute: false })
  @consume({ context: BiAppContext.context, subscribe: true })
  app?: BlackIronApp;

  @property({ type: Array })
  campaigns?: CampaignData[];

  willUpdate(changed: Map<string | number | symbol, unknown>) {
    if (changed.has("campaigns") || changed.has("app")) {
      // Fire and forget: we'll be eventually consisent, here.
      this.app?.campaignManager.syncCampaigns(this.campaigns);
    }
  }

  render() {
    return html`<ul>
      ${this.campaigns?.map(
        (campaign) =>
          html`<li>
            <a href="/campaigns/${campaign.slug}">
              <article>
                <header>
                  <h3>${campaign.name}</h3>
                </header>
                <p>${campaign.description}</p>
              </article>
            </a>
          </li>`,
      )}
    </ul>`;
  }
}
