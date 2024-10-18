# Changelog

## [0.5.5](https://github.com/eslint/config-inspector/compare/v0.5.4...v0.5.5) (2024-10-18)


### chore

* release-please-mark ([33d48ce](https://github.com/eslint/config-inspector/commit/33d48cecb75c822b8e0fb541b510fa01cbcd3ca1))


### Features

* label non-existent rule as invalid ([#96](https://github.com/eslint/config-inspector/issues/96)) ([a872bd5](https://github.com/eslint/config-inspector/commit/a872bd5b79f8e8f25afdb0f7190dcac1f045ef7a))

## [0.5.4](https://github.com/eslint/config-inspector/compare/v0.5.3...v0.5.4) (2024-08-19)


### chore

* release-please-mark ([cf98452](https://github.com/eslint/config-inspector/commit/cf98452b0599f8e0f465e9477aaa8a35d1cad47e))


### Features

* improved errors when config can not be found ([#85](https://github.com/eslint/config-inspector/issues/85)) ([748590e](https://github.com/eslint/config-inspector/commit/748590e95b6ac61f4bdb266ff34d620a009dae63))


### Bug Fixes

* improved check of whether ignore is global ([#84](https://github.com/eslint/config-inspector/issues/84)) ([7e66113](https://github.com/eslint/config-inspector/commit/7e661138bc37be0e2dada78f02a2c2531cb18e1d))

## [0.5.3](https://github.com/eslint/config-inspector/compare/v0.5.2...v0.5.3) (2024-08-15)


### chore

* release-please-mark ([7720a12](https://github.com/eslint/config-inspector/commit/7720a12e9dbc911d922dfcd6f933add666120fa2))


### Features

* cache web fonts locally, close [#79](https://github.com/eslint/config-inspector/issues/79) ([0fbd05e](https://github.com/eslint/config-inspector/commit/0fbd05e2aa86dbdb24f070116f44aeb5f78b7c05))


### Bug Fixes

* `nth` formatting for values above 20 ([#83](https://github.com/eslint/config-inspector/issues/83)) ([1c0ecf1](https://github.com/eslint/config-inspector/commit/1c0ecf195bb18a41a97367ee03d916331806cfb5))
* disable tsconfig resolution on config loading, close [#52](https://github.com/eslint/config-inspector/issues/52) ([27c2372](https://github.com/eslint/config-inspector/commit/27c2372f6816a0c1e6886fcb3bf19986d193a388))
* label of "Rules" -&gt; "Configs" on file group ([#77](https://github.com/eslint/config-inspector/issues/77)) ([0f0b1b8](https://github.com/eslint/config-inspector/commit/0f0b1b839411a836d639cf6577ecfa86d6cd49b0))

## [0.5.2](https://github.com/eslint/config-inspector/compare/v0.5.1...v0.5.2) (2024-07-17)


### Bug Fixes

* disable font ligatures for monospace fonts, close [#73](https://github.com/eslint/config-inspector/issues/73) ([ce55bc4](https://github.com/eslint/config-inspector/commit/ce55bc4b530d82832e269caa8f887cb4bc0fd081))
* move toggleRuleView to page rules ([#75](https://github.com/eslint/config-inspector/issues/75)) ([0fd797c](https://github.com/eslint/config-inspector/commit/0fd797c92861f6a9bc3219a866382532fd87b3ae))

## [0.5.1](https://github.com/eslint/config-inspector/compare/v0.5.0...v0.5.1) (2024-06-28)


### Bug Fixes

* correct condition on showing the rules list ([88d5719](https://github.com/eslint/config-inspector/commit/88d57190e52839afc99f6b1246abe188984a88ea))

## [0.5.0](https://github.com/eslint/config-inspector/compare/v0.4.12...v0.5.0) (2024-06-22)


### chore

* release-please-mark ([e32a302](https://github.com/eslint/config-inspector/commit/e32a3027ec2b5cb179e74d1eb932070cb500fe95))


### Bug Fixes

* use `@eslint/config-array` to resolve paths ([#69](https://github.com/eslint/config-inspector/issues/69)) ([ca6070e](https://github.com/eslint/config-inspector/commit/ca6070e86bd6a5aa6f11cf1d9fc9bd0d9e956e97))

## [0.4.12](https://github.com/eslint/config-inspector/compare/v0.4.11...v0.4.12) (2024-06-21)


### Bug Fixes

* button font size ([8e34306](https://github.com/eslint/config-inspector/commit/8e343060e1b9d1aab0e60a50cc6b8e2a4a104dad))
* improve contrast on light mode ([919e774](https://github.com/eslint/config-inspector/commit/919e774fb2844a67aab5e6f9784aeb5e9f2d3f52))
* prepend eslint default configs ([#66](https://github.com/eslint/config-inspector/issues/66)) ([4ef77d9](https://github.com/eslint/config-inspector/commit/4ef77d92166544b8b09d3ca1dae3143210484efe))

## [0.4.11](https://github.com/eslint/config-inspector/compare/v0.4.10...v0.4.11) (2024-06-11)


### Bug Fixes

* alignment hostname ([#61](https://github.com/eslint/config-inspector/issues/61)) ([1546667](https://github.com/eslint/config-inspector/commit/15466676f58bc8f72ccc9e8b012eb589dc78bb39))
* Better handling for long config names ([#60](https://github.com/eslint/config-inspector/issues/60)) ([055a667](https://github.com/eslint/config-inspector/commit/055a667c75a7f015177c1a9cda76287c4b60fd0f))

## [0.4.10](https://github.com/eslint/config-inspector/compare/v0.4.9...v0.4.10) (2024-06-01)


### Bug Fixes

* use minimatch without `matchBase:true` ([#57](https://github.com/eslint/config-inspector/issues/57)) ([4a89c48](https://github.com/eslint/config-inspector/commit/4a89c48e7b72949733c004589151ce018c8faecc))

## [0.4.9](https://github.com/eslint/config-inspector/compare/v0.4.8...v0.4.9) (2024-06-01)


### Bug Fixes

* dev time endless ERROR [unhandledRejection] read ECONNRESET ([#50](https://github.com/eslint/config-inspector/issues/50)) ([dea7f77](https://github.com/eslint/config-inspector/commit/dea7f7754d10ac0518ae5d15bfcef9286862c83f))
* load `eslint` module from config file dir, close [#53](https://github.com/eslint/config-inspector/issues/53) ([770aded](https://github.com/eslint/config-inspector/commit/770aded1249d5e6c9b59b4d8743be16df101711b))

## [0.4.8](https://github.com/eslint/config-inspector/compare/v0.4.7...v0.4.8) (2024-05-02)


### Bug Fixes

* upgrade `bundle-require` ([78af88d](https://github.com/eslint/config-inspector/commit/78af88d81b500946fdeb3b84d221b598058ee9f2))


### Chores

* fix types ([d7c2967](https://github.com/eslint/config-inspector/commit/d7c2967847b0247ac4c7d8ca0a734799514d1bfa))
* update deps, fix [#47](https://github.com/eslint/config-inspector/issues/47) ([4d8c8d0](https://github.com/eslint/config-inspector/commit/4d8c8d05eec6eeadafa1f64f1d8c53b3bd1fb030))

## [0.4.7](https://github.com/eslint/config-inspector/compare/v0.4.6...v0.4.7) (2024-04-22)


### Bug Fixes

* patch bundle-require ([179bc64](https://github.com/eslint/config-inspector/commit/179bc643871c97e4c57e423ee94d5b52d8c3f675))


### Chores

* lint ([deae1a3](https://github.com/eslint/config-inspector/commit/deae1a3d46d4c96bdaf728b0b1f9270b3cc10554))
* update deps ([e3fcad5](https://github.com/eslint/config-inspector/commit/e3fcad5791d5b4f2f195b0c4e497aaab927973a3))

## [0.4.6](https://github.com/eslint/config-inspector/compare/v0.4.5...v0.4.6) (2024-04-12)


### Features

* support `--base` option in build, fix [#41](https://github.com/eslint/config-inspector/issues/41) ([1156bb5](https://github.com/eslint/config-inspector/commit/1156bb51b278540a7da33cb704adfe1fb496f285))


### Bug Fixes

* start watcher with `basePath` ([#39](https://github.com/eslint/config-inspector/issues/39)) ([e259020](https://github.com/eslint/config-inspector/commit/e2590201fef48329cc69301dfc0776e4d860b2d2))
* support only string globs ([c99f85e](https://github.com/eslint/config-inspector/commit/c99f85e07743e85593ff6ab03156515c216723c5))


### Chores

* cache Minimatch instance ([3bab7e8](https://github.com/eslint/config-inspector/commit/3bab7e8ae351f69c0b73b35abd29ab9607745129))
* release-please-mark ([53ce18b](https://github.com/eslint/config-inspector/commit/53ce18b3e2c644f81ad268dbf035305893d92a00))
* update deps ([a40fc38](https://github.com/eslint/config-inspector/commit/a40fc38c128441accbf3ce7032cfe9cde4ca80a4))

## [0.4.5](https://github.com/eslint/config-inspector/compare/v0.4.4...v0.4.5) (2024-04-09)


### Features

* shift code hue to match more with the theme ([9442360](https://github.com/eslint/config-inspector/commit/944236044a5d654bbc94c68bddab5c71e6669f17))
* show options indicator ([dcd0071](https://github.com/eslint/config-inspector/commit/dcd00715238007a32de3fb044679a34a7b45a426))
* syntax highlight for globs ([d2a2d60](https://github.com/eslint/config-inspector/commit/d2a2d60679b3a35d21b3fb64da16037762063a88))


### Bug Fixes

* support single object config export, fix [#38](https://github.com/eslint/config-inspector/issues/38) ([feffffe](https://github.com/eslint/config-inspector/commit/feffffe774c64c9e1bdbf8fdf80f957c2267c0c3))


### Chores

* clean up ([01d6fc2](https://github.com/eslint/config-inspector/commit/01d6fc23d7972d6d926a820a1c2abbfbd7716105))
* upgrade shiki ([a8e36ee](https://github.com/eslint/config-inspector/commit/a8e36ee2739a9d936431fa71bcaa044b944c0c35))

## [0.4.4](https://github.com/eslint/config-inspector/compare/v0.4.3...v0.4.4) (2024-04-09)


### Bug Fixes

* configs auto complete enter key, close [#35](https://github.com/eslint/config-inspector/issues/35) ([328ede6](https://github.com/eslint/config-inspector/commit/328ede639c752f8590f308f3b62c31a1f501486c))
* configs search result ([ab6e72a](https://github.com/eslint/config-inspector/commit/ab6e72aaf8801040c86066b7fe828401c29929d2))
* improve file groups ui ([5051244](https://github.com/eslint/config-inspector/commit/50512440326abe78f0461edaa082098c4ab2fac1))

## [0.4.3](https://github.com/eslint/config-inspector/compare/v0.4.2...v0.4.3) (2024-04-08)


### Bug Fixes

* file search specific toggle ([92269db](https://github.com/eslint/config-inspector/commit/92269dbb948644f28694faa25439dda1435318bb))

## [0.4.2](https://github.com/eslint/config-inspector/compare/v0.4.1...v0.4.2) (2024-04-08)


### Features

* improve files globbing display ([abab4f6](https://github.com/eslint/config-inspector/commit/abab4f657079030ab8f3f14a47daeac608f15446))
* show loading indicator ([23c6135](https://github.com/eslint/config-inspector/commit/23c61359775eafecfd2990f542097ba9f030a712))


### Bug Fixes

* hide detail marker on safari ([#29](https://github.com/eslint/config-inspector/issues/29)) ([ad66b94](https://github.com/eslint/config-inspector/commit/ad66b940eacc788c24031d892fc8779dfdd07407))
* improve cli output ([e27cb99](https://github.com/eslint/config-inspector/commit/e27cb99ac066c46377022f4c5d07050eff6aa277))
* improve ui contrast ([f56903a](https://github.com/eslint/config-inspector/commit/f56903a8ba08b55b08f9df943f312c767cebdfe0))
* improve ui for globs ([2299639](https://github.com/eslint/config-inspector/commit/2299639645e1e846070d638b7b40536e78b111d7))
* port fallback ([31bb86c](https://github.com/eslint/config-inspector/commit/31bb86cf234b5729c9f2bfd77fb3ed625b614fac))
* support dynamic base url, fix [#33](https://github.com/eslint/config-inspector/issues/33) ([7e8e8bf](https://github.com/eslint/config-inspector/commit/7e8e8bf936da424fbf927023972343dcea57e1b7))
* support port range fallback ([c979872](https://github.com/eslint/config-inspector/commit/c979872f8a0902100b46390641db5199a84cadde))


### Documentation

* Fix typos on CHANGELOG.md ([#32](https://github.com/eslint/config-inspector/issues/32)) ([b00151c](https://github.com/eslint/config-inspector/commit/b00151c60cdbc86d40de4abe066ed8ca98fc324a))


### Chores

* fix import path ([15b650f](https://github.com/eslint/config-inspector/commit/15b650f7bbd8028ff79032c6dc15fdd7b4b2cfeb))
* move shared logics ([a9f1198](https://github.com/eslint/config-inspector/commit/a9f11983a2d912f1b867da6279099f95a7652bf9))
* release-please-mark ([0c2b0bc](https://github.com/eslint/config-inspector/commit/0c2b0bca06078086fa5388b12d4aeee229fb9756))
* update deps ([bbda483](https://github.com/eslint/config-inspector/commit/bbda48353093ad89ea735cb659c3f002806ec64f))
* use `h3` to create server ([#30](https://github.com/eslint/config-inspector/issues/30)) ([695e693](https://github.com/eslint/config-inspector/commit/695e6932dfd78c597b9825929571064d4b61df76))

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
