import { css, html, isServer, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { BlackIronApp } from "../../black-iron-app";
import { BiAppContext } from "../../components/bi-app-context";
import { ssrConsume } from "../../utils/ssr-context";
import { CampaignData } from "../campaign";

@customElement("bi-campaign-list")
export class BiCampaignList extends LitElement {
  static styles = css`
    :host {
      & ul {
        list-style: none;
        padding: 0;
        display: flex;
        flex-flow: column nowrap;
      }
    }
  `;

  @property({ attribute: false })
  @ssrConsume({ context: BiAppContext.context, subscribe: true })
  app?: BlackIronApp;

  // We have two Campaign lists here: One for the attribute, and another for
  // our actual internal state.

  // This is the attribute one, which is what we usually get from the server.
  @property({
    type: Array,
    attribute: "campaigns",
    hasChanged(
      newVal: CampaignData[] | undefined,
      oldVal: CampaignData[] | undefined,
    ) {
      if ((newVal?.length ?? 0) !== (oldVal?.length ?? 0)) {
        return true;
      }
      for (let i = 0; i < (newVal?.length ?? 0); i++) {
        if (newVal?.[i]?.id !== oldVal?.[i]?.id) {
          return true;
        } else if (newVal?.[i]?._rev !== oldVal?.[i]?._rev) {
          return true;
        }
      }
      return false;
    },
  })
  campaigns?: CampaignData[];

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    if (!isServer) {
      this.app?.campaignManager.joinSyncChannel();
    }
    this.#syncCampaignData();
  }

  willUpdate(changed: Map<string | number | symbol, unknown>) {
    if (changed.has("app") && !isServer) {
      this.app?.campaignManager.joinSyncChannel();
    }
    if (changed.has("_campaignData") || changed.has("app")) {
      // Fire and forget: we'll be eventually consistent here.
      this.#syncCampaignData();
    }
  }

  async #syncCampaignData(data?: CampaignData[]) {
    await this.app?.campaignManager.syncCampaigns(data);
    // Assigning to _campaignData is idempotent, so we can do it even though
    // `#syncCampaignData` is called on update.
    this.campaigns = await this.app?.campaignManager.listCampaigns();
  }

  render() {
    return html`<ul>
      ${this.campaigns
        ?.filter((c) => !c.deleted_at)
        .map(
          (campaign) =>
            html`<li>
              <a href="/play/campaigns/${campaign.slug}">
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
