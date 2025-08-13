<img src="./public/favicon.svg" width="100" height="100"><br>

# ESLint Config Inspector

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

A visual tool for inspecting and understanding your [ESLint flat configs](https://eslint.org/docs/latest/use/configure/configuration-files-new).

<img width="1252" alt="Screenshot 1" src="https://github.com/eslint/config-inspector/assets/11247099/d6551d44-445e-4f22-9d8e-ccb8042a6226">
<img width="1362" alt="Screenshot 2" src="https://github.com/eslint/config-inspector/assets/11247099/d74a057a-f674-4a8d-977f-d9b6a3cde949">

## Usage

Go to the project root that contains `eslint.config.js` and run:

```bash
npx @eslint/config-inspector@latest
```

Visit http://localhost:7777/ to view and play with your ESLint config. Changes to the config file will be updated automatically.

Run `npx @eslint/config-inspector --help` to see all the CLI options available.

### Online Preview

Or play it right in your browser now:

[![](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/eslint/config-inspector)

### Static Build

It is also possible to build a static web app for your ESLint config:

```bash
npx @eslint/config-inspector build
```

This will generate a Single-Page Application (SPA) under `.eslint-config-inspector`, with the snapshot of the current ESLint config. You can deploy it somewhere, or use it for comparison etc.

Run `npx @eslint/config-inspector build --help` to see all the CLI options available.

## Contributing

We operate under the [ESLint Contributor Guidelines](http://eslint.org/docs/developer-guide/contributing), so please be sure to read them before contributing. If you're not sure where to dig in, check out the [issues](https://github.com/eslint/config-inspector/issues).

### Development

This project uses the following stack:

- [pnpm](https://pnpm.io/) for package management
- [Nuxt](https://nuxt.com/) & [Vue](https://vuejs.org) for the app
  - APIs are served under `server/api` powered by [Nitro](https://nitro.unjs.io/)
- [UnoCSS](https://unocss.dev/) for styling
  - With [attributify mode](https://unocss.dev/presets/attributify) enabled
- Use [ESLint](https://eslint.org/) for linting and formatting

To start the development server:

- Install dependencies via `pnpm install` (we highly recommend you to [enable `corepack enable`](https://nodejs.org/api/corepack.html) first)
- Run `pnpm dev` to start the development server at http://localhost:3000

To test the production build:

- Run `pnpm build` to build the app
- Run `pnpm start` to start the production server at http://localhost:7777

## License

[Apache-2.0](./LICENSE) License

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@eslint/config-inspector?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@eslint/config-inspector
[npm-downloads-src]: https://img.shields.io/npm/dm/@eslint/config-inspector?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@eslint/config-inspector
