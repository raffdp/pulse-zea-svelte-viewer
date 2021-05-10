# Zea Template

## Features

- Built on top of [Svelte](https://svelte.dev/), a radical new approach to building user interfaces.
- Includes the latest stable versions of the Zea tools: [Zea Engine](https://docs.zea.live/zea-engine/), [Zea UI](https://web-components.zea.live/), [Zea UX](https://docs.zea.live/zea-ux/), and [Zea Collab](https://docs.zea.live/zea-collab/).
- Supports [SSR](https://en.wikipedia.org/wiki/Server-side_scripting).

## Prerequisites

To get this template working, you're going to need [Node.js](https://nodejs.org/en/download/) (preferably the latest LTS version).

## Getting Started

Our recommended way to clone this template is by using [degit](https://github.com/Rich-Harris/degit), a project scaffolding tool.

1. Run this command on your terminal:

```bash
npx degit zeainc/zea-template-collab#main my-awesome-app
```

2. The above command will create the `my-awesome-app` directory for you. Go into it:

```bash
cd my-awesome-app
```

3. Install the project's dependencies by running:

```bash
npm install
```

4. Start a development server by running:

```bash
npm run dev
```

5. Use your browser to go to: http://localhost:5000/

6. Build something awesome.

### npm scripts

| Syntax        | Description                                                      |
| ------------- | ---------------------------------------------------------------- |
| `build`       | Build a bundled app with SSR + prerendering and dynamic imports  |
| `dev`         | Development (port 5000)                                          |
| `dev:dynamic` | Development with dynamic imports                                 |
| `dev:nollup`  | Development with crazy fast rebuilds (port 5000)                 |
| `serve`       | Run after a build to preview. Serves SPA on 5000 and SSR on 5005 |

## Issues?

File it on Github: https://github.com/ZeaInc/zea-template-collab

Start a discussion: https://github.com/ZeaInc/zea-template-collab/discussions
