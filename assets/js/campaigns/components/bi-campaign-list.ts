import { css, html, isServer, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { BlackIronApp } from "../../black-iron-app";
import { BiAppContext } from "../../components/bi-app-context";
import { hasEntityChanged } from "../../entity";
import { genPid } from "../../utils/pid";
import { ssrConsume } from "../../utils/ssr-context";
import { Campaign, CampaignRole, ICampaign } from "../campaign";

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
          &:has(.offline) {
            opacity: 0.5;
          }
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
    hasChanged: hasEntityChanged,
  })
  campaigns?: ICampaign[];

  @state()
  conflicted: ICampaign[] = [];

  constructor() {
    super();
    this.addEventListener("htmx:beforeRequest", async (e: Event) => {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      // TODO(@zkat): validate this! htmx:beforeRequest can cancel requests (if validation fails).
      const campaign: ICampaign = {
        pid: formData.get("entity[pid]") as string,
        data: {
          name: formData.get("entity[data][name]") as string,
          description: formData.get("entity[data][description]") as string,
          memberships: this.app?.userPid
            ? [
              {
                user_pid: this.app.userPid,
                roles: [CampaignRole.Owner],
              },
            ]
            : [],
        },
      };
      await this.app?.campaigns.sync(campaign);
      await this.#setFromLocalCampaigns();
    });
    this.addEventListener("htmx:beforeSend", (e: Event) => {
      const form = e.target as HTMLFormElement;
      const input = form.querySelector(
        "input[name='entity[pid]']",
      ) as HTMLInputElement;
      // Generate a new pid for the next campaign, in case we're in offline
      // mode (online, htmx will swap in a new pid for us).
      input.value = genPid();
      form.reset();
    });
  }

  willUpdate(changed: Map<string | number | symbol, unknown>) {
    if (!isServer) {
      if (changed.has("campaigns") || changed.has("app")) {
        // Fire and forget: we'll be eventually consistent here.
        this.#syncCampaignData();
      }
    }
  }

  async #setFromLocalCampaigns() {
    const campaigns = await this.app?.campaigns.getAll();
    campaigns?.sort((a, b) => (a.data.name > b.data.name ? 1 : -1));
    if (campaigns) {
      this.campaigns = campaigns;
    }
  }

  async #syncCampaignData() {
    try {
      await this.app?.campaigns.syncAll(this.campaigns);
    } catch (e) {
      console.error("Failed to sync campaigns", e);
    }
    await this.#setFromLocalCampaigns();
  }

  async #addToAccount(e: MouseEvent, campaign: ICampaign) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.app?.userPid) {
      return;
    }
    const newC: ICampaign = {
      ...campaign,
      data: {
        ...campaign.data,
        memberships: [
          {
            user_pid: this.app.userPid,
            roles: [CampaignRole.Owner],
          },
        ],
      },
    };
    await this.app?.campaigns.sync(newC);
    await this.#syncCampaignData();
  }

  render() {
    // TODO(@zkat): only show campaigns for the current account, if we're logged in.
    return html`<ul>
        ${
      this.campaigns
        ?.filter((c) => !c.deleted_at)
        .map(
          (campaign) =>
            this.app && html`<li>
                <a href=${new Campaign(campaign, this.app).route}>
                  <article>
                    <header>
                      <h3>${campaign.data.name}</h3>
                    </header>
                    <p>${campaign.data.description}</p>
                    ${
              !campaign.data.memberships.length
                ? html`<p class="offline">
                          This campaign is only available locally and not
                          associated with any account. It is not saved on the
                          server.
                          ${
                  this.app?.userPid
                    ? html`<button
                                type="button"
                                @click=${(e: MouseEvent) => this.#addToAccount(e, campaign)}
                              >
                                Add to current account
                              </button>`
                    : ""
                }
                        </p>`
                : ""
            }
                    ${
              campaign.conflict
                ? html`<p class="conflict">
                          HAS CONFLICT WITH REMOTE VERSION
                        </p> `
                : ""
            }
                  </article>
                </a>
              </li>`,
        )
    }
      </ul>
      <slot></slot>`;
  }
}
