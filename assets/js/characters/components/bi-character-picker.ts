import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("bi-character-picker")
export class BiCharacterPicker extends LitElement {
  static styles = css`
  `;

  @property()
  text?: string;

  render() {
    return html`

    `;
  }
}

