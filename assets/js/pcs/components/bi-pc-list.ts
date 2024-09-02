import { css, html, isServer, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { BlackIronApp } from "../../black-iron-app";
import { Campaign } from "../../campaigns/campaign";
import { BiCampaignContext } from "../../campaigns/components/bi-campaign-context";
import { BiAppContext } from "../../components/bi-app-context";
import { hasEntityChanged } from "../../entity";
import { ssrConsume } from "../../utils/ssr-context";
import { IPC, PC } from "../pc";

@customElement("bi-pc-list")
export class BiPCList extends LitElement {
  static styles = css``;

  @property({ attribute: false })
  @ssrConsume({ context: BiAppContext.context, subscribe: true })
  app?: BlackIronApp;

  @property({ attribute: false })
  @ssrConsume({ context: BiCampaignContext.context })
  campaign?: Campaign;

  @property({
    type: Array,
    attribute: "pcs",
    hasChanged: hasEntityChanged,
  })
  pcs?: IPC[];

  @state()
  conflicted: IPC[] = [];

  willUpdate(changed: Map<string | number | symbol, unknown>) {
    if (!isServer) {
      if (
        changed.has("pcs")
        || changed.has("campaign")
        || changed.has("app")
      ) {
        // Fire and forget: we'll be eventually consistent here.
        this.#syncPCData();
      }
    }
  }

  async #setFromLocalPCs() {
    const pcs = await this.campaign?.pcs.getAll();
    pcs?.sort((a, b) => (a.data.name > b.data.name ? 1 : -1));
    if (pcs) {
      this.pcs = pcs;
    }
  }

  async #syncPCData() {
    try {
      await this.campaign?.pcs.syncAll(this.pcs);
    } catch (e) {
      console.error("Failed to sync PCs", e);
    }
    await this.#setFromLocalPCs();
  }

  render() {
    // TODO(@zkat): only show campaigns for the current account, if we're logged in.
    return html`<ul>
        ${
      !this.campaign
        ? null
        : this.pcs
          ?.filter((c) => !c.deleted_at)
          .map(
            (pc) =>
              this.campaign && html`<li>
                <a href=${new PC(pc, this.campaign).route}>
                  <article>
                    <header>
                      <h3>${pc.data.name}</h3>
                    </header>
                  </article>
                </a>
              </li>`,
          )
    }
      </ul>
      <slot></slot>`;
  }
}
