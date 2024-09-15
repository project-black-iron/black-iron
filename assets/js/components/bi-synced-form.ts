import { Context, ContextConsumer, createContext } from "@lit/context";
import { html, isServer, LitElement, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BlackIronApp } from "../black-iron-app";
import { AbstractEntity, DataValidationError } from "../entity";
import { IPC } from "../pcs/pc";
import { formDataToObject, objectToFormData } from "../utils/form-data";
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
      const target = e.target as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement;
      const newEnt = target.form && formDataToObject<IPC>(target.form);
      if (newEnt && this.consumer?.value && this.app) {
        try {
          const newEntity = this.consumer.value.merge(newEnt);
          await this.app.db.syncEntity(newEntity.storeName, newEntity);
          await this.app.db.syncEntity(
            newEntity.storeName,
            undefined,
            newEntity,
          );
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

  #updateForm(formData: FormData) {
    for (const [key, value] of formData.entries()) {
      if (typeof value !== "string") {
        // We don't deal with files right now
        continue;
      }
      for (const el of this.querySelectorAll(`[name="${key}"]`)) {
        if (el instanceof HTMLInputElement) {
          if (el.type === "radio" || el.type === "checkbox") {
            el.checked = el.value === value;
          } else {
            el.value = value;
          }
        } else if (el instanceof HTMLSelectElement) {
          el.value = value;
          for (const child of el.querySelectorAll("option")) {
            child.selected = child.value === value;
          }
        } else if (el instanceof HTMLTextAreaElement) {
          el.value = value;
        }
      }
    }
  }

  willUpdate(changedProps: PropertyValues<this>) {
    if (!isServer && changedProps.has("context")) {
      this.consumer = new ContextConsumer(this, {
        context: createContext(this.context),
        subscribe: true,
        callback: (value) => {
          this.#updateForm(objectToFormData(value));
        },
      });
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
