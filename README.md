<img src="./public/favicon.svg" width="100" height="100"><br>

# ESLint Config Inspector

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

A visual tool to help you view and understand your [ESLint Flat configs](https://eslint.org/docs/latest/use/configure/configuration-files-new).

<img width="1199" alt="Screenshot" src="https://github.com/antfu/eslint-flat-config-viewer/assets/11247099/f386563a-c655-458e-a2c3-0af19ebec958">
<img width="1199" alt="Screenshot" src="https://github.com/antfu/eslint-flat-config-viewer/assets/11247099/44edeb05-02b3-4bca-8da6-768984e8d829">

## Usage

Change the directory to your project root that contains `eslint.config.js` and run:

```bash
npx @eslint/config-inspector
```

Goto http://localhost:7777/ to view your ESLint config. Whenever you update your ESLint config, the page will be updated automatically.

---

Or play it in your browser:

[![](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/eslint/config-inspector)

## License

[Apache-2.0](./LICENSE) License

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@eslint/config-inspector?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@eslint/config-inspector
[npm-downloads-src]: https://img.shields.io/npm/dm/@eslint/config-inspector?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@eslint/config-inspector
