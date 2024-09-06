export class AjaxIt extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("submit", this.#handleSubmit);
    this.addEventListener("click", this.#handleClick);
  }

  #handleSubmit(e: SubmitEvent) {
    const form = e.target as HTMLFormElement;
    if (form.parentElement !== this) return;
    e.preventDefault();
    const beforeEv = new CustomEvent("ajax-it:beforeRequest", {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    form.dispatchEvent(beforeEv);
    if (beforeEv.defaultPrevented) {
      return;
    }
    const data = new FormData(form);
    form.dispatchEvent(new CustomEvent("ajax-it:beforeSend", { bubbles: true, composed: true }));
    const action = (e.submitter as HTMLButtonElement | null)?.formAction || form.action;
    (async () => {
      try {
        const res = await fetch(action, {
          method: form.method || "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Ajax-It": "true",
          },
          body: new URLSearchParams(data as unknown as Record<string, string>),
        });
        if (!res.ok) {
          throw new Error("request failed");
        }
        form.dispatchEvent(new CustomEvent("ajax-it:afterRequest", { bubbles: true, composed: true }));
        const text = await res.text();
        this.#injectReplacements(text, new URL(res.url).hash);
      } catch {
        form.dispatchEvent(new CustomEvent("ajax-it:requestFailed", { bubbles: true, composed: true }));
      }
    })();
  }

  #handleClick(e: MouseEvent) {
    const anchor = e.target as HTMLAnchorElement;
    if (anchor.tagName !== "A" || anchor.parentElement !== this) return;
    e.preventDefault();
    anchor.dispatchEvent(new CustomEvent("ajax-it:beforeRequest", { bubbles: true, composed: true }));
    anchor.dispatchEvent(new CustomEvent("ajax-it:beforeSend", { bubbles: true, composed: true }));
    (async () => {
      try {
        const res = await fetch(anchor.href, {
          method: "GET",
          headers: {
            "Ajax-It": "true",
          },
        });
        if (!res.ok) {
          throw new Error("request failed");
        }
        anchor.dispatchEvent(new CustomEvent("ajax-it:afterRequest", { bubbles: true, composed: true }));
        const text = await res.text();
        this.#injectReplacements(text, new URL(res.url).hash);
      } catch {
        anchor.dispatchEvent(new CustomEvent("ajax-it:requestFailed", { bubbles: true, composed: true }));
      }
    })();
  }

  #injectReplacements(html: string, hash: string) {
    setTimeout(() => {
      const div = document.createElement("div");
      div.innerHTML = html;
      const mainTargetConsumed = !!hash && !!div.querySelector(
        hash,
      );
      const elements = [...div.querySelectorAll("[id]") ?? []];
      for (const element of elements.reverse()) {
        // If we have a parent that's already going to replace us, don't bother,
        // it will be dragged in when we replace the ancestor.
        const parentWithID = element.parentElement?.closest("[id]");
        if (parentWithID && document.getElementById(parentWithID.id)) {
          continue;
        }
        document.getElementById(element.id)?.replaceWith(element);
      }
      if (mainTargetConsumed) return;
      if (hash) {
        document
          .querySelector(hash)
          ?.replaceWith(...div.childNodes || []);
      }
    });
  }
}
customElements.define("ajax-it", AjaxIt);
