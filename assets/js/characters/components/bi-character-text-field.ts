import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ssrConsume } from "../../utils/ssr-context";
import { BiCharacterContext } from "./bi-character-context";
import { ICharacter } from "../character";

@customElement("bi-character-text-field")
export class BiCharacterTextField extends LitElement {
  static styles = css`
  `;

  @ssrConsume({ context: BiCharacterContext.context })
  character?: ICharacter;
  
  @property()
  text?: string;
  
  @property()
  field?: keyof ICharacter;
  
  willUpdate(changed: Map<string, string | ICharacter>) {
    if (changed.has("character") && this.field) {
      this.text = "" + this.character?.[this.field] ;
    } 
  }

  render() {
    return html`
      <span title=${`Character ${this.field || "text field"}`}>
        ${this.text}
      </span>
    `;
  }
}
