import { css, html, isServer, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

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
        gap: 0.5rem;
        flex-flow: column nowrap;
        & li {
          margin: 0;
          padding: 0;
          border: 1px solid var(--border-color, #ccc);
          border-radius: var(--border-radius, 10px);
          & a {
            text-decoration: none;
            color: inherit;
            display: block;
            padding: 1em;
            & article {
              & header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                & h3 {
                  margin: 0;
                  font-size: 1.5em;
                }
              }
            }
          }
        }
      }
      & .conflict {
        color: var(--text-error, red);
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

  @state()
  conflicted: ICampaign[] = [];

  constructor() {
    super();
    this.addEventListener("htmx:beforeRequest", async (e: Event) => {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      // TODO(@zkat): validate this! TODO(@zkat): Maybe do this in two stages?
      // do an `htmx:beforeRequest` that will cancel the request if the
      // validation fails?
      const campaign: ICampaign = {
        id: formData.get("data[id]") as string,
        name: formData.get("data[name]") as string,
        slug: formData.get("data[slug]") as string,
        description: formData.get("data[description]") as string,
        memberships: [],
      };
      await this.app?.campaignManager.saveCampaign(campaign);
      await this.#setFromLocalCampaigns();
    });
    this.addEventListener("htmx:afterRequest", (e: Event) => {
      const form = e.target as HTMLFormElement;
      form.reset();
    });
  }

  willUpdate(changed: Map<string | number | symbol, unknown>) {
    if (!isServer) {
      if (changed.has("app") && !isServer) {
        this.app?.campaignManager.joinSyncChannel();
      }
      if (changed.has("campaigns") || changed.has("app")) {
        // Fire and forget: we'll be eventually consistent here.
        this.#syncCampaignData();
      }
    }
  }

  async #setFromLocalCampaigns() {
    const campaigns = await this.app?.campaignManager.listCampaigns();
    campaigns?.sort((a, b) => (a.name > b.name ? 1 : -1));
    if (campaigns) {
      this.campaigns = campaigns;
    }
  }

  async #syncCampaignData() {
    try {
      this.conflicted =
        (await this.app?.campaignManager.syncCampaigns(this.campaigns)) ?? [];
    } catch (e) {
      console.error("Failed to sync campaigns", e);
    }
    await this.#setFromLocalCampaigns();
  }

  render() {
    // TODO(@zkat): only show campaigns for the current account, if we're logged in.
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
                    ${campaign._conflict
                      ? html`<p class="conflict">
                          HAS CONFLICT WITH REMOTE VERSION
                        </p>`
                      : ""}
                  </article>
                </a>
              </li>`,
          )}
        ${this.conflicted
          ?.filter((c) => !c.deleted_at)
          .map(
            (campaign) =>
              html`<li class="conflict">
                <article>
                  <header>
                    <h3>${campaign.name}</h3>
                  </header>
                  <p>${campaign.description}</p>
                  <p>
                    Unable to download campaign because a local one exists with
                    the same slug.
                    <a href="/play/campaigns/${campaign.slug}"
                      >Change its slug</a
                    >
                    to resolve the conflict.
                  </p>
                </article>
              </li>`,
          )}
      </ul>
      <slot></slot>`;
  }
}
