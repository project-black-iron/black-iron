import { Context, ContextConsumer, createContext } from "@lit/context";
import { html, isServer, LitElement, PropertyValues } from "lit";
import { customElement, property, queryAssignedElements, state } from "lit/decorators.js";
import { BlackIronApp } from "../black-iron-app";
import { AbstractEntity, DataValidationError, IEntity } from "../entity";
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

  @queryAssignedElements({ slot: "form-error" })
  errorTemplate!: Array<HTMLTemplateElement>;

  constructor() {
    super();
    // We disable the submit event here because we're gonna go entirely off change events.
    this.addEventListener("submit", (e: Event) => e.preventDefault());
    this.addEventListener("change", async (e: Event) => {
      const target = e.target as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement;
      // eslint-disable-next-line
      const newEnt = target.form && formDataToObject<IEntity<any>>(target.form);
      if (newEnt && this.consumer?.value && this.app) {
        try {
          const newEntity = this.consumer.value.merge(newEnt);
          await this.app.db.syncEntity(newEntity.storeName, newEntity);
          await this.app.db.syncEntity(
            newEntity.storeName,
            undefined,
            newEntity,
          );
          this.#resetErrors();
        } catch (e) {
          if (e instanceof DataValidationError) {
            this.#setError(e);
          } else {
            throw e;
          }
        }
      }
    });
  }

  #setError(e: DataValidationError) {
    const errorContainer = this.querySelector(".synced-form-error") as HTMLElement | undefined;
    const errTpl = this.errorTemplate?.[0];
    if (errorContainer && errTpl) {
      errorContainer.innerHTML = "";
      errorContainer.append(errTpl.content.cloneNode(true));
      for (const input of this.querySelectorAll("input, select, textarea")) {
        const name = input.getAttribute("name");
        const errorsEl = input.parentElement?.querySelector(".errors");
        if (!name || !errorsEl) {
          continue;
        }
        for (const { path, message } of e.errors) {
          if (path === name) {
            const errorEl = document.createElement("p");
            errorEl.textContent = message;
            errorsEl.append(errorEl);
          }
        }
      }
    }
  }

  #resetErrors() {
    const errorContainer = this.querySelector(".synced-form-error") as HTMLElement | undefined;
    if (errorContainer) {
      errorContainer.innerHTML = "";
    }
    for (const errorsEl of this.querySelectorAll("label > .errors")) {
      errorsEl.innerHTML = "";
    }
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
          if (value) {
            this.#updateForm(value.toFormData());
          }
        },
      });
    }
  }

  render() {
    return html`<slot name="form-error"></slot><slot></slot>`;
  }
}
