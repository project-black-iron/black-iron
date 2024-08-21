import { createContext, provide } from "@lit/context";
import { html, isServer, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { BlackIronApp } from "../black-iron-app";

/**
 * Sets up a `BlackIronApp` in the context to be consumed by any descendants.
 *
 * From consumers, you can then do:
 * ```typescript
 * @ssrConsume({context: blackIronAppContext, subscribe: true})
 * blackIronApp?: BlackIronApp;
 * ```
 *
 * And you'll have the latest available BlackIronApp, if the user_token ever changes.
 *
 * @usage `<bi-app-context-provider usertoken="<%= assigns[:user_token] %>">Rest of your app here</bi-app-context-provider>`
 */
@customElement("bi-app-context")
export class BiAppContext extends LitElement {
  static context = createContext<BlackIronApp | undefined>("blackIronApp");

  @property({ attribute: "user-token" })
  userToken?: string;

  @provide({ context: BiAppContext.context })
  @property({ attribute: false })
  blackIronApp?: BlackIronApp;

  update(changedProps: Map<string, unknown>) {
    super.update(changedProps);
    console.log("update:", changedProps);
    if (changedProps.has("userToken")) {
      this.blackIronApp = new BlackIronApp(this.userToken);
    }
  }

  constructor() {
    super();
    if (!isServer) {
      this.blackIronApp = new BlackIronApp(this.userToken);
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
