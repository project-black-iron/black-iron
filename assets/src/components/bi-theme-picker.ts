import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

export enum Theme {
  Dark = "dark",
  Light = "light",
}

@customElement("bi-theme-picker")
export class BiThemePicker extends LitElement {
  @property()
  theme: Theme = (localStorage.getItem("bi-theme") as Theme) || this.#preferredTheme();

  #preferredTheme() {
    return matchMedia("(prefers-color-scheme: dark)").matches
      ? Theme.Dark
      : Theme.Light;
  }

  setTheme(theme: Theme, save?: boolean) {
    if (save) {
      localStorage.setItem("bi-theme", theme);
    }
    this.theme = theme;
  }

  update(changedProps: Map<string, unknown>) {
    super.update(changedProps);
    if (changedProps.has("theme")) {
      const themeLink = document.getElementById("theme");
      if (themeLink && themeLink instanceof HTMLLinkElement) {
        themeLink.href = `/assets/css/theme-${this.theme}.css`;
      }
    }
  }

  render() {
    return html`<label
        >Light
        <input
          @click=${() => this.setTheme(Theme.Light, true)}
          name="theme"
          type="radio"
          value=${Theme.Light}
          .checked=${this.theme === Theme.Light}
          ?checked=${this.theme === Theme.Light}
        />
      </label>
      <label>
        Dark
        <input
          @click=${() => this.setTheme(Theme.Dark, true)}
          name="theme"
          type="radio"
          value=${Theme.Dark}
          .checked=${this.theme === Theme.Dark}
          ?checked=${this.theme === Theme.Dark}
        />
      </label>
      <button
        type="button"
        @click=${() => {
      window.localStorage.removeItem("bi-theme");
      this.setTheme(this.#preferredTheme());
    }}
      >
        Reset
      </button>`;
  }
}
