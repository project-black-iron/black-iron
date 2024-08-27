import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ssrConsume } from "../../utils/ssr-context";
import { BiCharacterContext } from "./bi-character-context";
import { ICharacter } from "../character";

@customElement("bi-character-portrait")
export class BiCharacterPortrait extends LitElement {
  static styles = css`
      :host {
          & img {
              max-width: 10rem;
              display: block;
          }
      }
  `;

  @ssrConsume({ context: BiCharacterContext.context })
  character?: ICharacter;
  
  @property()
  src?: string;
  
  willUpdate(changed: Map<string, string | ICharacter>) {
    if (changed.has("character")) {
      this.src = this.character?.portrait;
    } 
  }

  render() {
    return html`
      <img src=${this.src} alt="Character portrait" />
    `;
  }
}
