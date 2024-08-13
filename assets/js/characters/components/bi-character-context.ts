import { createContext } from "@lit/context";
import { html, isServer, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import "./bi-character-context.css";
import { BlackIronCampaign } from "../../campaigns/campaign";
import { BiCampaignContext } from "../../campaigns/components/bi-campaign-context";
import { Route } from "../../utils/route";
import { ssrConsume, ssrProvide } from "../../utils/ssr-context";
import { Character } from "../character";

@customElement("bi-character-context")
export class BiCharacterContext extends LitElement {
  static context = createContext<Character | undefined>("character");

  // TODO(@zkat): maybe allow character ID to be passed in?
  @ssrProvide({ context: BiCharacterContext.context })
  @property({ attribute: false })
  character?: Character;

  @ssrConsume({ context: BiCampaignContext.context })
  @property({ attribute: false })
  campaign?: BlackIronCampaign;

  constructor() {
    super();
    if (!isServer) {
      this.#updateCampaignFromUrl();
    }
  }

  async #updateCampaignFromUrl() {
    console.log("matched route:", Route.matchLocation());
    // TODO: fill in this.character based on route.
  }

  render() {
    return html`<slot></slot>`;
  }
}
