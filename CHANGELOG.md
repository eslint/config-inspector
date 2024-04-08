# Changelog

## [0.4.1](https://github.com/eslint/config-inspector/compare/v0.4.0...v0.4.1) (2024-04-05)


### Bug Fixes

* support eslint v9 as peerDeps ([ead64bd](https://github.com/eslint/config-inspector/commit/ead64bd632d46c11df079eda8e6dc3b5eb592607))

## [0.4.0](https://github.com/eslint/config-inspector/compare/v0.3.1...v0.4.0) (2024-04-05)


### Features

* add more filters ([ace554f](https://github.com/eslint/config-inspector/commit/ace554fb198694ae85fb99becab81ae70456a335))
* experimental `Files` tab, close [#24](https://github.com/eslint/config-inspector/issues/24) ([2595b46](https://github.com/eslint/config-inspector/commit/2595b464685061baf51b419fe831ea3b38ebeb33))
* improve files globs matching display ([fd35b20](https://github.com/eslint/config-inspector/commit/fd35b20742ca0f60991fd61a35a3aff16cac446e))
* improve how configures are resolved ([#26](https://github.com/eslint/config-inspector/issues/26)) ([264c58f](https://github.com/eslint/config-inspector/commit/264c58f7b3ea9107018d330ddf52b4e2f4570058))
* improve RWD ([e4739df](https://github.com/eslint/config-inspector/commit/e4739dfa56a1d09f037d184d279b80055ec7678d))


### Bug Fixes

* rules filter ([6cdfeca](https://github.com/eslint/config-inspector/commit/6cdfecab536bae6b39228a05268fb4e121d06811))
* tweak ui ([e5c7108](https://github.com/eslint/config-inspector/commit/e5c71081fc7bfaa8e91910fc8b8820815be442ed))


### Documentation

* mention static build ([509a1ae](https://github.com/eslint/config-inspector/commit/509a1ae3c661abdb4a0a89df7bc305746bab855a))
* update screenshot ([6c25668](https://github.com/eslint/config-inspector/commit/6c256689dbfc35c1cc1de6c5f6c1ee3dfa5aa3e8))


### Chores

* cleanup moot contents ([#23](https://github.com/eslint/config-inspector/issues/23)) ([03d4d77](https://github.com/eslint/config-inspector/commit/03d4d7749aa0124895643068b2b54222fd03d7a5))
* lazy load config items ([b42ee54](https://github.com/eslint/config-inspector/commit/b42ee54904537e2c35902e2d854bef99e7dd5541))
* lint ([21dcfce](https://github.com/eslint/config-inspector/commit/21dcfce709f98225499b59c717c5e27f224258cb))
* lint ([b8e9590](https://github.com/eslint/config-inspector/commit/b8e95900c2a7b3759fb8b466433f81f932d348b8))
* setup lint staged ([7b576fd](https://github.com/eslint/config-inspector/commit/7b576fdb7876cf1a0545c0ede39d3a0182bba599))
* update ([90e5d61](https://github.com/eslint/config-inspector/commit/90e5d6128f64d0e6a66a807d5741e98e69e53ea2))

## [0.3.1](https://github.com/eslint/config-inspector/compare/v0.3.0...v0.3.1) (2024-04-02)


### Bug Fixes

* build script ([079e5d4](https://github.com/eslint/config-inspector/commit/079e5d415707ffe5501ec26c1a2e0c978e8533b9))


### Documentation

* update icon url ([470cc3e](https://github.com/eslint/config-inspector/commit/470cc3e58940255548612b3b6870a7cadf9797eb))


### Chores

* register api endpoint before static host ([0b1360c](https://github.com/eslint/config-inspector/commit/0b1360ce5cbac0d3e26d23bda61c3ada5c944226))

## [0.3.0](https://github.com/eslint/config-inspector/compare/v0.2.1...v0.3.0) (2024-04-02)


### Features

* align better with ESLint's design system ([#16](https://github.com/eslint/config-inspector/issues/16)) ([f0f8392](https://github.com/eslint/config-inspector/commit/f0f839222339850afb8b8b6fe4fc153ce49785f6))
* improve ui and colors ([258c2b5](https://github.com/eslint/config-inspector/commit/258c2b50a2c1e1d28cc0378315a36231fb53df35))
* support `build` command for static hosting ([#17](https://github.com/eslint/config-inspector/issues/17)) ([6a3aaed](https://github.com/eslint/config-inspector/commit/6a3aaedc25ec1ddd6fe292aa4629b965a6a81856))
* use custom server host, reduce deps ([#20](https://github.com/eslint/config-inspector/issues/20)) ([ad59019](https://github.com/eslint/config-inspector/commit/ad590194311e6df8546c7bd1d158a3ada4e4ae4c))

## [0.2.1](https://github.com/eslint/config-inspector/compare/v0.2.0...v0.2.1) (2024-04-01)


### Chores

* fix ci permissions ([fab2ecc](https://github.com/eslint/config-inspector/commit/fab2ecc45531e7dbe0888ca8c56234b9a2484ce3))

## [0.2.0](https://github.com/eslint/config-inspector/compare/v0.1.0...v0.2.0) (2024-04-01)


### Features

* allow filter recommended rules, close [#6](https://github.com/eslint/config-inspector/issues/6) ([92748ef](https://github.com/eslint/config-inspector/commit/92748ef3955ed705a2f067bca03ade08cd5ba759))
* show recommended marker ([4164306](https://github.com/eslint/config-inspector/commit/4164306a97f59a798149a1fd39c36c20dfef5f15))
* use `bundle-require` instead of `jiti`, support top-level-await, fix [#11](https://github.com/eslint/config-inspector/issues/11) ([89534ef](https://github.com/eslint/config-inspector/commit/89534ef0ae9f2d04d784fa4309e935b16f3c86d7))


### Build Related

* reusing workflows in release-please workflow ✨ ([#10](https://github.com/eslint/config-inspector/issues/10)) ([778c406](https://github.com/eslint/config-inspector/commit/778c406005c38747c3593ee04f1cd5ebe696651b))


### Chores

* consistent imports path ([2408335](https://github.com/eslint/config-inspector/commit/2408335588f3c98633c46087b92c55db2deb8cee))
* fix typo, close [#7](https://github.com/eslint/config-inspector/issues/7) ([6b0fb0b](https://github.com/eslint/config-inspector/commit/6b0fb0b285aef1bbe8f5b6993c0b3aa4ca8ec089))
* update wording ([#8](https://github.com/eslint/config-inspector/issues/8)) ([e81adf2](https://github.com/eslint/config-inspector/commit/e81adf217356cea9a58d51f7220dcf11a9a027f9))

## [0.1.0](https://github.com/eslint/config-inspector/compare/v0.0.2...v0.1.0) (2024-03-29)


### Features

* support global install with cli name ([#4](https://github.com/eslint/config-inspector/issues/4)) ([8bcd0e9](https://github.com/eslint/config-inspector/commit/8bcd0e97681817ebd05f2d0717b2b70a0357485f))
* ui improvements ([854759a](https://github.com/eslint/config-inspector/commit/854759ab11f4622cd202b11cde21f957c24d1b50))


### Documentation

* update screenshot and docs ([da23b14](https://github.com/eslint/config-inspector/commit/da23b143a6d8d5ec15e80c022e7624b59f53c98e))


### Chores

* update contribution guide ([855e732](https://github.com/eslint/config-inspector/commit/855e732ae3ee8cc9c47f844b5c6b0eb3a44e5883))

## [0.0.2](https://github.com/eslint/config-inspector/compare/v0.0.1...v0.0.2) (2024-03-29)


### Chores

* use pnpm in ci ([6d78bed](https://github.com/eslint/config-inspector/commit/6d78bede86e8ab9714bc482027612461c76cee06))

## 0.0.1 (2024-03-29)


### Features

* migrate from `eslint-flat-config-viewer` ([#1](https://github.com/eslint/config-inspector/issues/1)) ([4acbd4f](https://github.com/eslint/config-inspector/commit/4acbd4f0a4206b3eddbe8f79f5c5320577c771ba))


### Chores

* release 0.0.1 ([f528193](https://github.com/eslint/config-inspector/commit/f528193c3e0174e045ff6b27d6630643a37d8fed))
