import { consume, createContext, provide } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import "./bi-character-sheet.css";
import { BlackIronCampaign } from "../../campaigns/campaign";
import { BiCampaignContext } from "../../campaigns/components/bi-campaign-context";
import { Character } from "../character";

@customElement("bi-character-sheet")
export class BiCharacterSheet extends LitElement {
  static context = createContext<Character | undefined>("character");

  // TODO(@zkat): maybe allow character ID to be passed in?
  @provide({ context: BiCharacterSheet.context })
  @property({ attribute: false })
  character?: Character;

  @consume({ context: BiCampaignContext.context })
  @property({ attribute: false })
  campaign?: BlackIronCampaign;

  render() {
    return html`${
      this.character
        ? html`<slot name="sheet"></slot>`
        : html`<slot name="placeholder"></slot>`
    }`;
  }
}
