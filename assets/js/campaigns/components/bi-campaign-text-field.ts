import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ssrConsume } from "../../utils/ssr-context";
import { ICampaign } from "../campaign";
import { BiCampaignContext } from "./bi-campaign-context";

@customElement("bi-campaign-text-field")
export class BiCampaignTextField extends LitElement {
  static styles = css`
  `;

  @ssrConsume({ context: BiCampaignContext.context })
  campaign?: ICampaign;
  
  @property()
  text?: string;
  
  @property()
  field?: keyof ICampaign;
  
  willUpdate(changed: Map<string, string | ICampaign>) {
    if (changed.has("campaign") && this.field) {
      this.text = "" + this.campaign?.[this.field];
    } 
  }

  render() {
    return html`
      <span title=${`Campaign ${this.field || "text field"}`}>
        ${this.text}
      </span>
    `;
  }
}
