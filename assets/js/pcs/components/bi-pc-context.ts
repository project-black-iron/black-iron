import { createContext } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import "./bi-pc-context.css";
import { Campaign } from "../../campaigns/campaign";
import { BiCampaignContext } from "../../campaigns/components/bi-campaign-context";
import { Route } from "../../utils/route";
import { ssrConsume, ssrProvide } from "../../utils/ssr-context";
import { IPC, PC } from "../pc";

@customElement("bi-pc-context")
export class BiPCContext extends LitElement {
  static context = createContext<PC | undefined>("pc");

  @ssrProvide({ context: BiPCContext.context })
  @property({
    type: Object,
    hasChanged(
      value: IPC | undefined,
      oldValue: IPC | undefined,
    ) {
      return value?.rev !== oldValue?.rev;
    },
  })
  pc?: PC;

  @ssrConsume({ context: BiCampaignContext.context })
  @property({ attribute: false })
  campaign?: Campaign;

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.#updatePCFromUrl();
  }

  async #updatePCFromUrl() {
    console.log("matched route:", Route.matchLocation());
    // TODO: fill in thisIEntity<T>.pc based on route,
  }

  render() {
    return html`<slot></slot>`;
  }
}
