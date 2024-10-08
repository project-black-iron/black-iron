import { css, html, isServer, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

export enum Theme {
  Dark = "dark",
  Light = "light",
}

const THEME_STORAGE_KEY = "bi-theme";

@customElement("bi-theme-picker")
export class BiThemePicker extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-flow: column nowrap;
      & label {
        height: 1.5rem;
      }
    }
  `;

  @property()
  theme?: Theme = this.storageTheme();

  systemTheme() {
    return isServer
      ? Theme.Light
      : matchMedia("(prefers-color-scheme: dark)").matches
      ? Theme.Dark
      : Theme.Light;
  }

  storageTheme() {
    return isServer
      ? undefined
      : (localStorage.getItem(THEME_STORAGE_KEY) as Theme);
  }

  reload() {}

  notifySidebar(): void {
    const iframe = document.querySelector(".sidebar > iframe") as HTMLIFrameElement | null;
    iframe?.contentWindow?.postMessage("reloadTheme", window.location.origin);
  }

  willUpdate(changedProps: Map<string, unknown>) {
    if (changedProps.has("theme")) {
      const themeLink = document.getElementById("theme");
      if (themeLink && themeLink instanceof HTMLLinkElement) {
        if (!this.theme) {
          localStorage.removeItem(THEME_STORAGE_KEY);
        } else {
          localStorage.setItem(THEME_STORAGE_KEY, this.theme);
        }
        themeLink.href = `/assets/css/theme-${this.theme || this.systemTheme()}.css`;
      }
      this.notifySidebar();
    }
  }

  render() {
    return html`<label
        ><input
          @click=${() => (this.theme = Theme.Light)}
          name="theme"
          type="radio"
          value=${Theme.Light}
          .checked=${this.storageTheme() === Theme.Light}
          ?checked=${this.storageTheme() === Theme.Light}
        />
        Light
      </label>
      <label>
        <input
          @click=${() => (this.theme = Theme.Dark)}
          name="theme"
          type="radio"
          value=${Theme.Dark}
          .checked=${this.storageTheme() === Theme.Dark}
          ?checked=${this.storageTheme() === Theme.Dark}
        />
        Dark
      </label>
      <label>
        <input
          @click=${() => (this.theme = undefined)}
          name="theme"
          type="radio"
          value=${this.systemTheme()}
          .checked=${this.storageTheme() == null}
          ?checked=${this.storageTheme() == null}
        />
        System
      </label>`;
  }
}
