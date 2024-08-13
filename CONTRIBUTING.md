# Contributing to Black Iron

## Table of Contents

- [Setting up](#setting-up)
  - [Prerequisites](#prerequisites)
- [Architecture](#architecture)

## Setting up

### Prerequisites

- [Elixir](https://elixir-lang.org/install.html) and Erlang (Typically auto-installs with Elixir)
  - [Check versions here](https://github.com/project-black-iron/black-iron/blob/main/.tool-versions)
- [Postgresql v13 or later](https://wiki.postgresql.org/wiki/Detailed_installation_guides) ATM the tests require a postgres/postgres user/password to run. Check [this doc](https://academind.com/tutorials/postgresql-start-stop-uninstall-upgrade-server#resetting-the-root-user-password  ) for info on how to reset your postgres password.
- [NodeJS](https://nodejs.org/en/download/)
- `inotify-tools` (Linux only) - Install through your preferred package manager
  - [Check versions here](https://github.com/project-black-iron/black-iron/blob/main/.tool-versions)
- If you're using VS Code:
  - [ElixirLS extension](https://marketplace.visualstudio.com/items?itemName=JakeBecker.elixir-ls)
  - [lit-plugin extension](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin)
  - [gettext extension](https://marketplace.visualstudio.com/items?itemName=mrorz.language-gettext)
  - [HTML CSS Support](https://marketplace.visualstudio.com/items?itemName=ecmel.vscode-html-css)
  - [Dprint Code Formatter](https://marketplace.visualstudio.com/items?itemName=dprint.dprint)

> Note: If postgresql installed via homebrew, make sure to run `/usr/local/opt/postgres/bin/createuser -s postgres`.

### Application setup

Just a couple more commands and we're all set:

* `mix local.hex` to install hex package manager
* `mix archive.install hex phx_new`

## Architecture

### Stack

#### Backend

- [Elixir](https://elixir-lang.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Phoenix](https://www.phoenixframework.org/) (no LiveView)

#### Frontend

- Plain old HTML + CSS (only preprocessing for CSS is bundling/minification)
- [Lit](https://lit.dev/) for dynamic components
- [TypeScript](https://www.typescriptlang.org/)

### Concepts

Black Iron does is really two "apps" in a trenchcoat:

- The "site", which is where you can browse through published campaigns,
  manage your account/settings, view published campaign stats/comments, etc.
  This also has the home page which is the entry point to the entire site.
- The "app", which is the offline-first _game_ part of the site. This is where
  you actually play your campaigns.

Both of these have somewhat different considerations.

The "site" does not need very much dynamic content, and is largely rendered
server-side through Phoenix's HEEx templates. Dynamic content is usually
handled through [`htmx`](https://htmx.org/), or through a (small!) sprinkle of
JS/TS. The site is supposed to be lightweight and fast, and these things are
prioritized. As such, there's a separate entry point for the site section's
JavaScript, which only loads the very minimum client-side code needed, even if
it might use a few lit components.

The "app" side, on the other hand, is a heavier client-side application that's
meant to work fully offline and sync either live, or occasionally, largely
through [`Phoenix Channels`](https://hexdocs.pm/phoenix/channels.html). This
is where most of the Lit components live, and where most of the client-side JS
exists. This is also where the game logic lives, although the server will do
some validation on sync, and where all the game state is stored (in
IndexedDB).

#### PWA/Offline-first

Black Iron is also meant to be a PWA, and as such, uses [Service
Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
to cache as much as possible.

For the "app" side, this means the "shells" for _all_ game pages are cached,
and game-specific content is loaded client side only when offline (see [JS
Considerations and SSR](#js-considerations-and-ssr)). Essentially, the entire
game is "installed" on the user's device when they first visit the app. For
dynamic pages, a "default" shell page is precached for offline use for each
page.

For the "site" side, only a subset of the site is cached, including the
"shells" for some key pages that might have dynamic content. Everything else
is requested as usual from the server.

When offline, trying to visit pages that aren't already cached will send you
to a "you are offline" page, no matter what URL you try to visit.

#### Navigation

All navigation in Black Iron is done through standard browser navigation. That
is, Black iron is an "MPA", not an "SPA". This way, we get to keep all the
benefits of a traditional website, like deep linking, and the back button just
working, without having to load (and manage) additional JavaScript.

Even the "app" side is an "MPA": it's broken up into multiple pages, each of
which loads the game-specific content dynamically. Changing things like which
campaign is currently active is done through the URL (e.g.
`/campaigns/my-cool-campaign/characters/bob`). When you're online, these pages
are largely generated server-side. When offline, a "default" shell is loaded,
and JS itself looks up data in indexeddb to try and fill in the contents.

We use the [View Transitions
API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API/Using)
to make the transition between pages as smooth as possible.

#### JS Considerations and SSR

We use TypeScript for all client-side code, and Lit for all client-side
components. Components should be small and focused, preferring to use
server-side components and rendering whenever possible.

We generate as much html/css as possible server-side, and try to keep our JS
payloads as small as possible. Server-side rendering, or SSR, is done in three
layers:

1. `Phoenix` controllers render a dynamic page with as much of the content in
   regular light DOM as possible. This content can be styled with our global
   CSS styles, and does not require JS to render/function.
   - This uses [`Phoenix HEEx templates and
   Components`](https://hexdocs.pm/phoenix/components.html).
   - Within these templates, we can insert `Lit` components for things that
   will absolutely need dynamic, client-side/JS behavior or will otherwise
   have to do something special to function while offline.
2. Once `Phoenix` renders these templates, they're passed through the
   [`Plug`](https://hexdocs.pm/plug/readme.html) system, which eventually
   invokes a `Lit` server-side renderer.
   - This renderer takes the template, loads all existing components, and
   pre-renders `Lit` components as far as server-side work will allow.
   - In components, this behavior can be controlled with
     [`isServer`](https://lit.dev/docs/api/misc/#isServer).
3. Finally, all this server-side-rendered content is sent to the client, and
   `Lit` components will be "hydrated" after all the other content and JS is
   loaded.

Additionally, for dynamic pages, there's an extra step: the client-side
Service Worker will request "shell" versions of these pages. All dynamic page
controllers should be able to handle these requests, and support returning
these "shell" pages without any dynamic content. These shells will later be
used by the client-side whenever the application is online, and the only way
to get game data is through `IndexedDB`. "Shell" pages are requested by having
their params set to `__paramName` (e.g. a route that looks like
`/campaigns/:campaign_id` would have a shell request like
`/campaigns/__campaign_id`). These shell pages are updated in the background
over time.

As a general rule, we operate on "the less JavaScript, the better".
Dependencies should be few and far between, preferring to use built-in browser
features whenever possible. If a dependency is needed, it should be small and
focused, and not introduce a lot of overhead. Obviously, some things in
offline apps are just going to bring in some bulk and that's ok, but whenever
we have a choice between two things, code size should be a significant
consideration in their evaluation.

To minimize JavasScript, we should err on the side of having components be
`Phoenix`-based, and only use `Lit` components when absolutely necessary: even
if they're server-side rendered, their JavaScript definitions still needs to
load/hydrate, and are still shipped as part of our `.js` bundles.

To see what kind of weight a dependency brings in, you can use
[BundlePhobia](https://bundlephobia.com).

### Folder Structure

- `assets/` - Frontend code
  - `css/` - CSS files
    - `components/` - CSS for (usually server-side) components
    - `app.css` - main css entrypoint
    - `theme-*.css` - variables for themes
    - `variables.css` - non-theme-specific variables
      - NOTE: While regular styles don't leak into shadow DOM, `--variables`
        do, so we can use this for things we need to have consistent styling
        for.
  - `js/` - JS/TS files
    - `components/` - Toplevel lit components
    - `app.ts` - entry point for the app side (the game, the offline-first part)
    - `site.ts` - entry point for the site side (the entry point and rest of the site)
    - `service-worker.ts` - service worker implementation for the whole app
    - `black-iron-app.ts` - main app class for game state/coordination.
      Basically a god object.
    - `lit-ssr.ts` - lit server-side renderer tool
    - Other files are pulled in by one of these.
- `config/` - Configuration files
  - Different configs for dev, prod, and test envs.
  - `config.exs` - common config
  - `runtime.exs` - more prod config
- `lib/` - Elixir source code
  - `black_iron/` - core business logic. No web stuff here. All modules are prefixed with `BlackIron`.
  - `black_iron_web/` - all web stuff here. Modules are prefixed with
    `BlackIronWeb`. Uses `BlackIron` for any business logic.
- `priv/` - miscellaneous things
  - `gettext/` - this is where our (server-side) i18n stuff lives
  - `repo/` - migrations, seeds, etc
  - `static/` - static files. JS and CSS are compiled into here (but .gitignored)
