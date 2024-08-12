import { createContext } from "@lit/context";
import { html, isServer, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import "./bi-character-sheet.css";
import { BlackIronCampaign } from "../../campaigns/campaign";
import { BiCampaignContext } from "../../campaigns/components/bi-campaign-context";
import { Route } from "../../utils/route";
import { ssrConsume, ssrProvide } from "../../utils/ssr-context";
import { Character } from "../character";

@customElement("bi-character-sheet")
export class BiCharacterSheet extends LitElement {
  static context = createContext<Character | undefined>("character");

  // TODO(@zkat): maybe allow character ID to be passed in?
  @ssrProvide({ context: BiCharacterSheet.context })
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
    const route = document.head
      .querySelector("meta[name=page-route]")
      ?.getAttribute("content");
    if (route) {
      const match = new Route(route).match(window.location.pathname);
      console.log(match);
    }
  }

  render() {
    return html`${
      this.character
        ? html`<slot name="sheet"></slot>`
        : html`<slot name="placeholder"></slot>`
    }`;
  }
}
