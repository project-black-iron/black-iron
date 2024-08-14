import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { CampaignData } from "../campaign";

@customElement("bi-campaign-list")
export class BiCampaignList extends LitElement {
  static styles = css`
    :host {
    }
  `;

  @property({ type: Array })
  campaigns?: CampaignData[];

  render() {
    return html`
      <ul>
        ${
      this.campaigns?.map(
        (campaign) =>
          html`<li>
              <article>
                <header>
                  <h3>
                    <a href="/campaigns/${campaign.slug}">${campaign.name}</a>
                  </h3>
                </header>
                <p>${campaign.description}</p>
              </article>
            </li>`,
      )
    }
      </ul>
    `;
  }
}
