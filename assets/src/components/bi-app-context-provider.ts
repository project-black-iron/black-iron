import { createContext } from "@lit/context";
import { provide } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { BlackIronApp } from "../black-iron-app";

export const blackIronAppContext = createContext<BlackIronApp | undefined>(
  "blackIronApp",
);

/**
 * Sets up a `BlackIronApp` in the context to be consumed by any descendants.
 *
 * From consumers, you can then do:
 * ```typescript
 * @consume({context: blackIronAppContext, subscribe: true})
 * blackIronApp?: BlackIronApp;
 * ```
 *
 * And you'll have the latest available BlackIronApp, if the user_token ever changes.
 *
 * @usage `<bi-app-context-provider usertoken="<%= assigns[:user_token] %>">Rest of your app here</bi-app-context-provider>`
 */
@customElement("bi-app-context-provider")
export class BiAppContextProvider extends LitElement {
  @property()
  userToken?: string;

  @provide({ context: blackIronAppContext })
  @property({ attribute: false })
  blackIronApp?: BlackIronApp;

  @property()
  campaignId?: string;

  update(changedProps: Map<string, unknown>) {
    super.update(changedProps);
    if (changedProps.has("userToken") && typeof this.userToken === "string") {
      this.blackIronApp = new BlackIronApp(this.userToken);
    }
    if (changedProps.has("campaignId") && this.blackIronApp) {
      this.blackIronApp.changeCampaign(this.campaignId);
    }
  }

  constructor() {
    super();
    if (this.userToken) {
      this.blackIronApp = new BlackIronApp(this.userToken);
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
