import { createContext } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import "./bi-character-context.css";
import { Campaign } from "../../campaigns/campaign";
import { BiCampaignContext } from "../../campaigns/components/bi-campaign-context";
import { Route } from "../../utils/route";
import { ssrConsume, ssrProvide } from "../../utils/ssr-context";
import { Character, ICharacter } from "../character";

@customElement("bi-character-context")
export class BiCharacterContext extends LitElement {
  static context = createContext<Character | undefined>("character");

  @ssrProvide({ context: BiCharacterContext.context })
  @property({
    type: Object,
    hasChanged(
      value: ICharacter | undefined,
      oldValue: ICharacter | undefined,
    ) {
      return value?._rev !== oldValue?._rev;
    },
  })
  character?: Character;

  @ssrConsume({ context: BiCampaignContext.context })
  @property({ attribute: false })
  campaign?: Campaign;

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.#updateCharacterFromUrl();
  }

  async #updateCharacterFromUrl() {
    console.log("matched route:", Route.matchLocation());
    // TODO: fill in this.character based on route,
  }

  render() {
    return html`<slot></slot>`;
  }
}
