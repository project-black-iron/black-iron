import { BiEntityForm } from "../js/components/bi-entity-form";
import { IEntity } from "../js/entity";

interface CustomEventMap {
  "saveentity": CustomEvent<{ target: BiEntityForm; entity: IEntity<unknown> }>;
  "ajax-it:beforeRequest": CustomEvent;
  "ajax-it:beforeSend": CustomEvent;
  "ajax-it:afterRequest": CustomEvent;
  "ajax-it:requestFailed": CustomEvent;
}
declare global {
  interface Document {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
    ): void;
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): boolean;
  }
  interface HTMLElement {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: HTMLElement, ev: CustomEventMap[K]) => void,
    ): void;
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): boolean;
  }
}
export {}; // keep that for TS compiler.
