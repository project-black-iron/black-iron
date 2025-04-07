import { consume, createContext, provide } from "@lit/context";
import { html, LitElement, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import "./bi-pc-context.css";
import { BlackIronApp } from "../../black-iron-app";
import { Campaign } from "../../campaigns/campaign";
import { BiCampaignContext } from "../../campaigns/components/bi-campaign-context";
import { BiAppContext } from "../../components/bi-app-context";
import { Route } from "../../utils/route";
import { IPC, PC } from "../pc";

const ctx = createContext<PC | Error | undefined>("pc");

@customElement("bi-pc-context")
export class BiPCContext extends LitElement {
  static context = ctx;

  @consume({ context: BiAppContext.context, subscribe: true })
  @property({ attribute: false })
  app?: BlackIronApp;

  @property(PC.propOpts("pc"))
  _ipc?: IPC;

  @provide({ context: BiPCContext.context })
  @property({ attribute: false })
  pc?: PC | Error;

  @consume({ context: BiCampaignContext.context, subscribe: true })
  @property({ attribute: false })
  campaign?: Campaign;

  async #setFromRoute() {
    const match = Route.matchLocation();
    const pcPid = match?.pc_pid;
    if (pcPid) {
      this.pc = await this.campaign?.pcs.get(pcPid);
    }
  }

  async #sync() {
    if (this._ipc) {
      await this.campaign?.pcs.sync(this._ipc);
      this.pc = await this.campaign?.pcs.get(this._ipc.pid);
    }
  }

  constructor() {
    super();
    this.addEventListener("saveentity", async (e: CustomEvent) => {
      if (this.campaign && this.app) {
        try {
          const pc = new PC(e.detail.entity, this.campaign);
          await this.app.db.syncEntity(PC.storeName, pc);
          await this.app.db.syncEntity(PC.storeName, undefined, pc);
          this.pc = pc;
        } catch (e) {
          if (e instanceof Error) {
            this.pc = e;
          } else {
            throw e;
          }
        }
      } else {
        e.preventDefault();
      }
    });
  }

  async willUpdate(changed: PropertyValues<this>) {
    if (changed.has("_ipc") || changed.has("campaign") || changed.has("app")) {
      if (this._ipc && this.app) {
        this.#sync();
      } else if (this.app) {
        this.#setFromRoute();
      }
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
