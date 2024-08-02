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

- [Lit](https://lit.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- Plain old HTML + CSS (only preprocessing for CSS is bundling/minification)

### Concepts

Black Iron does is really two "apps" in a trenchcoat:

- The "site", which is where you can browse through published campaigns,
  manage your account/settings, view published campaign stats/comments, etc.
  This also has the home page which is the entry point to the entire site.
- The "app", which is the offline-first _game_ part of the site. This is where
  you actually play your campaigns.

Both of these have somewhat different considerations.

The site does not need very much dynamic content, and is largely rendered
server-side through Phoenix's HEEx templates. Dynamic content is usually
handled through [`htmx`](https://htmx.org/), or through a (small!) sprinkle of
JS/TS. The site is supposed to be lightweight and fast, and these things are
prioritized. As such, there's a separate entry point for the site section's
JavaScript, which only loads the very minimum client-side code needed, even if
it might use a few lit components.

The app side, on the other hand, is a heavier client-side application that's
meant to work fully offline and sync either live, or occasionally. This is
where most of the Lit components live, and where most of the client-side TS
exists. This is also where the game logic lives, although the server might do
some validation on sync, and where all the game state is stores (in
IndexedDB).

#### PWA/Offline-first

Black Iron is also meant to be a PWA, and as such, uses service workers to
cache as much as possible.

For the "app" side, this means the "shell" for _all_ game pages is cached, and
only the game-specific content is loaded dynamically. Essentially, the entire
game is "installed" on the user's device when they first visit the app.

For the "site" side, only a subset of the site is cached, including the
"shells" for some key pages that might have dynamic content. Everything else
is requested as usual from the server.

When offline, trying to visit pages that aren't already cached will send you
to a "you are offline" page, no matter what URL you try to visit.

#### Navigation

All navigation in Black Iron is done through standard browser navigation. That
is, Black iron is an "MPA", not an "SPA". This means that we get to keep all
the benefits of a traditional website, like deep linking, and the back button
just working, without having to load (and manage) additional JavaScript.

Even the "app" side is an "MPA": it's broken up into multiple "shell" pages,
each of which loads the game-specific content dynamically. Changing things
like which campaign is currently active is done through URL query params
(`/campaigns?campaign_id=12345`).

Because of all this, we generate as much html/css as possible server-side. All
pages are partitioned/sectioned according to what can be served statically (we
use standard `Phoenix` templating for this), what needs to be offline-ready
(we use client-side `lit` components for this), and what is best served
dynamically from a server while offline (we use `htmx` for this).

Dynamically loading sections of a page is something called a [streams
architecture](https://developer.chrome.com/docs/workbox/faster-multipage-applications-with-streams),
and it's designed to make sure the parts of the webpage that matter most
render as fast as possible, and that devices aren't overloaded with JS runtime
code.

#### JS Considerations

We use TypeScript for all client-side code, and Lit for all components.
Components should be small and focused, preferring to use server-side
rendering whenever possible. This might even involve occasionally working off
server-rendered `<template>` tags.

As a general rule, we operate on "the less JavaScript, the better".
Dependencies should be few and far between, preferring to use built-in browser
features whenever possible. If a dependency is needed, it should be small and
focused, and not introduce a lot of overhead. Obviously, some things in
offline apps are just going to bring in some bulk and that's ok, but whenever
we have a choice between two things, code size should be a significant
consideration in their evaluation.

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
  - `js/` - JS/TS files (should probably be renamed to `src/`)
    - `components/` - Lit components
    - `app.ts` - entry point for the app side (the game, the offline-first part)
    - `site.ts` - entry point for the site side (the entry point and rest of the site)
    - `service-worker.ts` - service worker implementation for the whole app
    - `black-iron-app.ts` - main app class for game state/coordination.
      Basically a god object.
    - Other files are pulled in by one of these.
- `config/` - Configuration files
  - Different configs for dev, prod, and test envs.
  - `config.exs` - common config
  - `runtime.exs` - more prod config
- `lib/` - Elixir source code
  - `black_iron/` - core business logic. No web stuff here.
  - `black_iron_web/` - all web stuff here. Uses `black_iron` for business logic.
- `priv/` - miscellaneous things
  - `gettext/` - this is where our (server-side) i18n stuff lives
  - `repo/` - migrations, seeds, etc
  - `static/` - static files. JS and CSS are compiled into here (but .gitignored)
