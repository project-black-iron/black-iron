import { Context, ContextConsumer, createContext } from "@lit/context";
import { html, isServer, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BlackIronApp } from "../black-iron-app";
import { AbstractEntity, DataValidationError } from "../entity";
import { IPC } from "../pcs/pc";
import { formDataToObject } from "../utils/form-data";
import { ssrConsume } from "../utils/ssr-context";
import { BiAppContext } from "./bi-app-context";

@customElement("bi-synced-form")
export class BiSyncedForm extends LitElement {
  @ssrConsume({ context: BiAppContext.context, subscribe: true })
  @property({ attribute: false })
  app?: BlackIronApp;

  @property()
  context?: string;

  @state()
  consumer?: ContextConsumer<
    Context<unknown, AbstractEntity | undefined>,
    BiSyncedForm
  >;

  constructor() {
    super();
    this.addEventListener("change", async (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      const newEnt = target.form && formDataToObject<IPC>(target.form);
      if (newEnt && this.consumer?.value && this.app) {
        try {
          const newEntity = this.consumer.value.merge(newEnt);
          console.log("new entity:", newEntity);
          await this.app.db.syncEntity(newEntity.storeName, newEntity);
          await this.app.db.syncEntity(newEntity.storeName, undefined, newEntity);
        } catch (e) {
          if (e instanceof DataValidationError) {
            console.log("TODO: add error messages to fields below");
          } else {
            throw e;
          }
        }
      }
    });
    // We disable the submit event here because we're gonna go entirely off change events.
    this.addEventListener("submit", (e: Event) => e.preventDefault());
  }
  willUpdate(changedProps: Map<string, unknown>) {
    if (!isServer && changedProps.has("context")) {
      // console.log("New context:", this.context);
      this.consumer = new ContextConsumer(this, {
        context: createContext(this.context),
        subscribe: true,
      });
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
