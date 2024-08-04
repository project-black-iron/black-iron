import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("bi-example")
export class BiExample extends LitElement {
  static styles = css`
  :host {
    color: var(--background-color, green);
  }
  `;

  @property()
  text?: string;

  render() {
    return html`
      <div class="example">
        <h1>Example Component</h1>
        <p>This is an example component with text ${this.text}.</p>
      </div>
    `;
  }
}
