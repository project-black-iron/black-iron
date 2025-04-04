import { consume, Context, ContextConsumer, createContext } from "@lit/context";
import { html, isServer, LitElement, PropertyValues, render } from "lit";
import { customElement, property, queryAssignedElements, state } from "lit/decorators.js";
import { BlackIronApp } from "../black-iron-app";
import { DataValidationError, IEntityInstance } from "../entity";
import { formDataToObject } from "../utils/form-data";
import { BiAppContext } from "./bi-app-context";

@customElement("bi-entity-form")
export class BiEntityForm<
  TEnt extends IEntityInstance<TData>,
  TData,
> extends LitElement {
  @consume({ context: BiAppContext.context, subscribe: true })
  @property({ attribute: false })
  app?: BlackIronApp;

  @property()
  context?: string;

  @property({ type: Boolean })
  live?: boolean;

  @state()
  consumer?: ContextConsumer<
    Context<unknown, TEnt | Error | undefined>,
    BiEntityForm<TEnt, TData>
  >;

  @queryAssignedElements({ slot: "form-error" })
  errorTemplate!: Array<HTMLTemplateElement>;

  constructor() {
    super();
    this.addEventListener("submit", async (e: Event) => {
      e.preventDefault();
      // We disable the submit event here because we're gonna go entirely off
      // change events, if we're in `live` mode.
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
    const newEnt = formDataToObject(form);
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
        render(html`${e.toString()}`, errorContainer);
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

  #updateForm(entity: TEnt) {
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
