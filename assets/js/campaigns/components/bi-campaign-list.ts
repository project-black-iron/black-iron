import { css, html, isServer, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { BlackIronApp } from "../../black-iron-app";
import { BiAppContext } from "../../components/bi-app-context";
import { ssrConsume } from "../../utils/ssr-context";
import { ICampaign } from "../campaign";

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

  @property({
    type: Array,
    attribute: "campaigns",
    hasChanged(
      newVal: ICampaign[] | undefined,
      oldVal: ICampaign[] | undefined,
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
  campaigns?: ICampaign[];

  constructor() {
    super();
    this.addEventListener("htmx:beforeSend", (e: Event) => {
      console.log("TODO: create offline campaign first.");
      (e.target as HTMLFormElement).reset();
    });
  }

  willUpdate(changed: Map<string | number | symbol, unknown>) {
    if (changed.has("app") && !isServer) {
      this.app?.campaignManager.joinSyncChannel();
    }
    if (changed.has("campaigns") || changed.has("app")) {
      // Fire and forget: we'll be eventually consistent here.
      this.#syncCampaignData();
    }
  }

  async #syncCampaignData() {
    await this.app?.campaignManager.syncCampaigns(this.campaigns);
    const campaigns = await this.app?.campaignManager.listCampaigns();
    campaigns?.sort((a, b) => (a.name > b.name ? 1 : -1));
    if (campaigns) {
      this.campaigns = campaigns;
    }
  }

  render() {
    return html`<ul>
        ${
      this.campaigns
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
        )
    }
      </ul>
      <slot></slot>`;
  }
}
