import { Context, ContextConsumer, createContext } from "@lit/context";
import { html, isServer, LitElement, PropertyValues } from "lit";
import { customElement, property, queryAssignedElements, state } from "lit/decorators.js";
import { BlackIronApp } from "../black-iron-app";
import { AbstractEntity, DataValidationError, IEntity } from "../entity";
import { formDataToObject } from "../utils/form-data";
import { ssrConsume } from "../utils/ssr-context";
import { BiAppContext } from "./bi-app-context";

@customElement("bi-entity-form")
export class BiEntityForm extends LitElement {
  @ssrConsume({ context: BiAppContext.context, subscribe: true })
  @property({ attribute: false })
  app?: BlackIronApp;

  @property()
  context?: string;

  @property({ type: Boolean })
  live?: boolean;

  @state()
  consumer?: ContextConsumer<
    Context<unknown, AbstractEntity | Error | undefined>,
    BiEntityForm
  >;

  @queryAssignedElements({ slot: "form-error" })
  errorTemplate!: Array<HTMLTemplateElement>;

  constructor() {
    super();
    // We disable the submit event here because we're gonna go entirely off change events.
    this.addEventListener("submit", async (e: Event) => {
      e.preventDefault();
      if (this.live) {
        return;
      }
      await this.#updateEntity(e.target as HTMLFormElement);
    });
    this.addEventListener("change", async (e: Event) => {
      if (!this.live) {
        return;
      }
      const target = e.target as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement;
      if (target.form) {
        await this.#updateEntity(target.form);
      }
    });
  }

  async #updateEntity(form: HTMLFormElement) {
    // eslint-disable-next-line
    const newEnt = formDataToObject<IEntity<any>>(form);
    if (!newEnt) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("saveentity", {
        bubbles: true,
        composed: true,
        detail: { target: this, entity: newEnt },
      }),
    );
  }

  #setError(e: Error) {
    const errorContainer = this.querySelector(".entity-form-error") as
      | HTMLElement
      | undefined;
    const errTpl = this.errorTemplate?.[0];
    if (errorContainer && errTpl) {
      errorContainer.innerHTML = "";
      errorContainer.append(errTpl.content.cloneNode(true));
      if (e instanceof DataValidationError) {
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
            } else {
              console.error("validation for unknown field:", path, message);
            }
          }
        }
      } else {
        // TODO(@zkat): we can do better, I think.
        errorContainer.innerHTML = e.toString();
      }
    }
  }

  #resetErrors() {
    const errorContainer = this.querySelector(".entity-form-error") as
      | HTMLElement
      | undefined;
    if (errorContainer) {
      errorContainer.innerHTML = "";
    }
    for (const errorsEl of this.querySelectorAll("label > .errors")) {
      errorsEl.innerHTML = "";
    }
  }

  #updateForm(entity: AbstractEntity) {
    this.#resetErrors();
    const formData = entity.toFormData();
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
            if (value instanceof Error) {
              this.#setError(value);
            } else {
              this.#updateForm(value);
            }
          }
        },
      });
    }
  }

  render() {
    return html`<slot name="form-error"></slot><slot></slot>`;
  }
}
