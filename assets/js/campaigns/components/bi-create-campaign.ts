import { html, isServer, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BiAppContext } from "../../components/bi-app-context";
import { BlackIronApp } from "../../black-iron-app";
import { consume } from "@lit/context";

@customElement("bi-create-campaign")
export class BiCreateCampaign extends LitElement {
  // static styles = css`
  // :host {
  // }
  // `;

  @consume({ context: BiAppContext.context, subscribe: true })
  @property({ attribute: false })
  app?: BlackIronApp;

  constructor() {
    super();
    if (!isServer) {
      this.addEventListener("submit", async (e: SubmitEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("app:", this.app);
        if (e.target && this.app) {
          const data = new FormData(e.target as HTMLFormElement, e.submitter);
          const url = new URL((e.target as HTMLFormElement).action);
          url.pathname = "/api" + url.pathname;
          url.search = new URLSearchParams(
            data as unknown as Record<string, string>,
          ).toString();
          try {
            const res = await this.app.fetch(url, {
              method: (e.target as HTMLFormElement).method || "POST",
            });
            if (res.ok) {
              console.log("Campaign created", await res.json());
            } else {
              console.error("Failed to create campaign", res);
            }
          } catch (e) {
            console.error("Failed to create campaign", e);
          }
        }
      });
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
