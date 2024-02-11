# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [4.0.11](https://github.com/beauraines/node-helpers/compare/v4.0.10...v4.0.11) (2024-02-11)


### Bug Fixes

* **deps:** bump azure-devops-node-api from 12.3.0 to 12.4.0 ([c644f74](https://github.com/beauraines/node-helpers/commit/c644f7476d4d6a00057a3988e87cfa176e09fdd7))

### [4.0.10](https://github.com/beauraines/node-helpers/compare/v4.0.9...v4.0.10) (2024-01-13)


### Bug Fixes

* **deps:** bump azure-devops-node-api from 12.1.0 to 12.3.0 ([7b76801](https://github.com/beauraines/node-helpers/commit/7b76801c103e5bf6622bc2f702fd62f4d61fc70e))

### [4.0.9](https://github.com/beauraines/node-helpers/compare/v4.0.8...v4.0.9) (2024-01-06)


### Bug Fixes

* **deps:** bump sqlite3 from 5.1.6 to 5.1.7 ([b89b8ab](https://github.com/beauraines/node-helpers/commit/b89b8ab442b76c5f2df558c7d5b696b1db12cd62))

### [4.0.8](https://github.com/beauraines/node-helpers/compare/v4.0.4...v4.0.8) (2023-12-29)


### Bug Fixes

* **deps:** bump @azure/storage-blob from 12.14.0 to 12.15.0 ([3253e14](https://github.com/beauraines/node-helpers/commit/3253e14673cf645abcb0c964576bd7046b97fd29))
* **deps:** bump @azure/storage-blob from 12.15.0 to 12.16.0 ([5a058ce](https://github.com/beauraines/node-helpers/commit/5a058ce3baffd1bd79fe434ebd082ccba7fed667))
* **deps:** bump @azure/storage-blob from 12.16.0 to 12.17.0 ([8d17b3c](https://github.com/beauraines/node-helpers/commit/8d17b3ce1ef1e19f3ba804c6a391c279dcd13b86))
* **deps:** bump @azure/storage-queue from 12.13.0 to 12.14.0 ([317a87c](https://github.com/beauraines/node-helpers/commit/317a87c2fed24f3180b080a3fe0f1986fc886c64))
* **deps:** bump @azure/storage-queue from 12.14.0 to 12.15.0 ([1480375](https://github.com/beauraines/node-helpers/commit/14803753cee6c9b21eb4912d9ea08f772fcbee68))
* **deps:** bump @azure/storage-queue from 12.15.0 to 12.16.0 ([883fee4](https://github.com/beauraines/node-helpers/commit/883fee4bc959e1e02ea14e44a43d1cfaa2b40bea))
* **deps:** bump dayjs from 1.11.9 to 1.11.10 ([69be1aa](https://github.com/beauraines/node-helpers/commit/69be1aace097f6d6e244874315e65d2429353ee1))
* **deps:** bump node-fetch from 2.6.12 to 2.7.0 ([727c31c](https://github.com/beauraines/node-helpers/commit/727c31c4d789797f37b07af98b5aa00f77fe10f4))
* **deps:** bump sqlite from 4.2.1 to 5.0.1 ([#54](https://github.com/beauraines/node-helpers/issues/54)) ([1066aec](https://github.com/beauraines/node-helpers/commit/1066aec108fe771c268e76975fb0151bf5f1ef40))
* **deps:** bump sqlite from 5.0.1 to 5.1.1 ([30f2b0e](https://github.com/beauraines/node-helpers/commit/30f2b0ef9687d20ef2a58778a43ba43251901a91))

### [4.0.4](https://github.com/beauraines/node-helpers/compare/v4.0.1...v4.0.4) (2023-07-16)


### Bug Fixes

* **deps:** bump dayjs from 1.11.8 to 1.11.9 ([#50](https://github.com/beauraines/node-helpers/issues/50)) ([90fb2eb](https://github.com/beauraines/node-helpers/commit/90fb2ebf926cd81eef91ce0d50056bf69b085698))
* **deps:** bump semver from 5.7.1 to 5.7.2 ([#53](https://github.com/beauraines/node-helpers/issues/53)) ([64bda58](https://github.com/beauraines/node-helpers/commit/64bda585aa5e39b1d61c6a3cc6f749bb41575c02))

### [4.0.1](https://github.com/beauraines/node-helpers/compare/v4.0.0...v4.0.1) (2023-07-08)


### Bug Fixes

* **config:** creating config will not overwrite exisitng configuratio file ([#52](https://github.com/beauraines/node-helpers/issues/52)) ([bad664c](https://github.com/beauraines/node-helpers/commit/bad664c6bf59c5de7404f5b9113951c2fc107c99))

## [4.0.0](https://github.com/beauraines/node-helpers/compare/v2.7.1...v4.0.0) (2023-07-02)


### ⚠ BREAKING CHANGES

* **azure:** - `generateBlobSignedUrl` is now asynchronous and must be called with `await`

Updates unit test to run async

### Features

* adds download blob from azure helper ([08a1571](https://github.com/beauraines/node-helpers/commit/08a1571ab18b9eeeb1273e05b5abed95a7300457))
* **azure:** adds list blob command ([#42](https://github.com/beauraines/node-helpers/issues/42)) ([e60219b](https://github.com/beauraines/node-helpers/commit/e60219bf75acea70defde417a07219a1508b7c61))
* **azure:** new getBlob function ([876716b](https://github.com/beauraines/node-helpers/commit/876716b8256b090a2eadf45c1d03b097362b2eb2))
* **helper:** adds file write helper ([9e727e9](https://github.com/beauraines/node-helpers/commit/9e727e9ffe51525d2a73fa66ea933c1804304729))


### Bug Fixes

* **deps:** bump azure-devops-node-api from 12.0.0 to 12.1.0 ([#37](https://github.com/beauraines/node-helpers/issues/37)) ([b71396d](https://github.com/beauraines/node-helpers/commit/b71396d28d089a1f8919ad53363a4759f61b1e52))
* **deps:** bump node-fetch from 2.6.11 to 2.6.12 ([786f458](https://github.com/beauraines/node-helpers/commit/786f458fbf0c03fd9462ab67db558c5646afb62e))
* **deps:** bump xml2js and @azure/core-http ([#46](https://github.com/beauraines/node-helpers/issues/46)) ([83b0c60](https://github.com/beauraines/node-helpers/commit/83b0c6077e70120a7e24519f7a03740578236969))
* increment version number ([c42e3ae](https://github.com/beauraines/node-helpers/commit/c42e3aebf1373b8820b18ced1b88617bbfe69da6))


* **azure:** migrates remaining methods to @azure/storage blob ([#45](https://github.com/beauraines/node-helpers/issues/45)) ([0b11af0](https://github.com/beauraines/node-helpers/commit/0b11af00b2fb11b3e99a6190fd7848cd7563901c))

### [2.7.1](https://github.com/beauraines/node-helpers/compare/v2.7.0...v2.7.1) (2023-06-14)

## [2.7.0](https://github.com/beauraines/node-helpers/compare/v2.6.1...v2.7.0) (2023-06-14)


### Features

* exports new ADO module ([6dbc0d9](https://github.com/beauraines/node-helpers/commit/6dbc0d966ed4daefaaa8c3ed8e0cdf9368a78d87))

### [2.6.1](https://github.com/beauraines/node-helpers/compare/v2.6.0...v2.6.1) (2023-06-14)

## [2.6.0](https://github.com/beauraines/node-helpers/compare/v2.5.2...v2.6.0) (2023-06-14)


### Features

* Adds Azure DevOps helpers ([#36](https://github.com/beauraines/node-helpers/issues/36)) ([3bf0658](https://github.com/beauraines/node-helpers/commit/3bf065851e2ebbeb17de4d010a8e5e25323f8ecf))

### [2.5.2](https://github.com/beauraines/node-helpers/compare/v2.5.0...v2.5.2) (2023-06-03)

## [2.5.0](https://github.com/beauraines/node-helpers/compare/v2.4.3...v2.5.0) (2023-06-03)


### Features

* new config module ([#32](https://github.com/beauraines/node-helpers/issues/32)) ([514df50](https://github.com/beauraines/node-helpers/commit/514df509ca33527a8b18e5efe43d1b772963e879))
* supports cross OS file paths ([#33](https://github.com/beauraines/node-helpers/issues/33)) ([27f5e27](https://github.com/beauraines/node-helpers/commit/27f5e27d02408bff07220c3e82bd90186023b324)), closes [#24](https://github.com/beauraines/node-helpers/issues/24)


### Bug Fixes

* adds export of new config module ([#34](https://github.com/beauraines/node-helpers/issues/34)) ([81c7a27](https://github.com/beauraines/node-helpers/commit/81c7a27696da3d9a0b6fb3a215418185c9b1d153))
* **deps:** bump @azure/storage-queue from 12.12.0 to 12.13.0 ([45acd3d](https://github.com/beauraines/node-helpers/commit/45acd3d808ab064c1dbc4b492a013c7b60ebf5b2))
* **deps:** bump dayjs from 1.11.7 to 1.11.8 ([2208985](https://github.com/beauraines/node-helpers/commit/22089855cd90758273bac28fa1d8669d21f661b5))
* **deps:** bump node-fetch from 2.6.9 to 2.6.11 ([d9fbed2](https://github.com/beauraines/node-helpers/commit/d9fbed2e6ade418caada9cc68f6ac05ba4d3159d))
* **deps:** bump sqlite from 4.1.2 to 4.2.0 ([5634e40](https://github.com/beauraines/node-helpers/commit/5634e400a0dea024a40a890da639a167df01cf25))
* **deps:** bump sqlite from 4.2.0 to 4.2.1 ([61b6533](https://github.com/beauraines/node-helpers/commit/61b6533d95c456114de9d8ca01dd30be204af2f9))

### [2.4.3](https://github.com/beauraines/node-helpers/compare/v2.4.0...v2.4.3) (2023-03-06)


### Bug Fixes

* adds missing dayjs dependency for azure storage queues ([094a2ed](https://github.com/beauraines/node-helpers/commit/094a2ed5d7c12f365c8712f13731b905d530e914))

## [2.4.0](https://github.com/beauraines/node-helpers/compare/v2.3.1...v2.4.0) (2023-03-05)

### [2.3.1](https://github.com/beauraines/node-helpers/compare/v2.2.0...v2.3.1) (2023-03-02)

## [2.2.0](https://github.com/beauraines/node-helpers/compare/v1.1.0...v2.2.0) (2023-03-02)


### Features

* Adds sparkline helper ([#6](https://github.com/beauraines/node-helpers/issues/6)) ([74accc3](https://github.com/beauraines/node-helpers/commit/74accc3ef2731809987210f39e45d1fd1c71e6ba))
