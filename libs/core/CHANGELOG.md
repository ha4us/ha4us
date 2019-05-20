# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.1](https://github.com/ha4us/ha4us/compare/@ha4us/core@1.0.0...@ha4us/core@1.0.1) (2019-05-20)

**Note:** Version bump only for package @ha4us/core





# [1.0.0](https://github.com/ha4us/ha4us/compare/@ha4us/core@1.0.0-beta.3...@ha4us/core@1.0.0) (2019-05-16)


### Features

* **telegram:** login by user property - new Ha4usUser Feature properties ([5bd4c11](https://github.com/ha4us/ha4us/commit/5bd4c11))





# [1.0.0-beta.3](https://github.com/ha4us/ha4us/compare/@ha4us/core@1.0.0-beta.2...@ha4us/core@1.0.0-beta.3) (2019-05-11)


### Bug Fixes

* linting and fixing whole repo ([0d18c49](https://github.com/ha4us/ha4us/commit/0d18c49))
* linting and fixing whole repo ([a397c49](https://github.com/ha4us/ha4us/commit/a397c49))
* **test:** moved test to top level + incorporated all necessary fixes ([1df0789](https://github.com/ha4us/ha4us/commit/1df0789))





# [1.0.0-beta.2](https://github.com/ha4us/ha4us/compare/@ha4us/core@1.0.0-beta.1...@ha4us/core@1.0.0-beta.2) (2019-05-08)

**Note:** Version bump only for package @ha4us/core





# [1.0.0-beta.1](https://github.com/ha4us/ha4us/compare/@ha4us/core@1.0.0-beta.0...@ha4us/core@1.0.0-beta.1) (2019-05-08)

**Note:** Version bump only for package @ha4us/core





# 1.0.0-beta.0 (2019-05-07)


### Code Refactoring

* **ha4us:** splitted ha4us module in @ha4us/core and @ha4us/adapter 0ed8175


### BREAKING CHANGES

* **ha4us:** the split is breaking since the old module is not available anymore





## [0.28.2](/compare/ha4us@0.28.1...ha4us@0.28.2) (2019-05-07)

**Note:** Version bump only for package ha4us





## 0.28.1 (2019-05-07)

**Note:** Version bump only for package ha4us





# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.28.0"></a>
# [0.28.0](https://github.com/ha4us/ha4us/compare/v0.27.0...v0.28.0) (2019-04-01)


### Features

* **db-media.service:** added posting of binary data in buffer (for fritzbox carddav) ([18da543](https://github.com/ha4us/ha4us/commit/18da543))



<a name="0.27.0"></a>
# [0.27.0](https://github.com/ha4us/ha4us/compare/v0.26.2...v0.27.0) (2019-02-20)


### Features

* **Ha4usObject:** BREAKING! Changed object model. Renamed name to label and format to template and ([7f511fd](https://github.com/ha4us/ha4us/commit/7f511fd))



<a name="0.26.2"></a>
## [0.26.2](https://github.com/ha4us/ha4us/compare/v0.26.1...v0.26.2) (2019-02-18)


### Bug Fixes

* **matcher:** not escaping the pattern for subscription ([4be7360](https://github.com/ha4us/ha4us/commit/4be7360))



<a name="0.26.1"></a>
## [0.26.1](https://github.com/ha4us/ha4us/compare/v0.26.0...v0.26.1) (2019-02-13)


### Bug Fixes

* **matcher:** added handling of null values (=empty string) ([d8457e4](https://github.com/ha4us/ha4us/commit/d8457e4))
* **matcher:** escaping not valid regex characters ([f54d0f8](https://github.com/ha4us/ha4us/commit/f54d0f8))



<a name="0.26.0"></a>
# [0.26.0](https://github.com/ha4us/ha4us/compare/v0.25.0...v0.26.0) (2019-02-04)


### Bug Fixes

* **dbmediaservice:** errorhandling corrected for db media import, since observable was stopped after ([c9d029a](https://github.com/ha4us/ha4us/commit/c9d029a))


### Features

* **media.service:** new method for getting base64 encoded image from url (for sonos cover art) ([1f683c9](https://github.com/ha4us/ha4us/commit/1f683c9))
* **state.service:** new method to emit a retained status without history (old, lc) information ([268487c](https://github.com/ha4us/ha4us/commit/268487c))



<a name="0.25.0"></a>
# [0.25.0](https://github.com/ha4us/ha4us/compare/v0.24.0...v0.25.0) (2019-01-27)


### Features

* **helper template function:** changed to new delimiter ${} %{} and <% > ([e6b6802](https://github.com/ha4us/ha4us/commit/e6b6802))



<a name="0.24.0"></a>
# [0.24.0](https://github.com/ha4us/ha4us/compare/v0.23.0...v0.24.0) (2019-01-22)


### Bug Fixes

* **arguments:** remove test user from mqtt url ([05dc562](https://github.com/ha4us/ha4us/commit/05dc562))


### Features

* **ha4usobject:** added image property ([a704927](https://github.com/ha4us/ha4us/commit/a704927))
* **helper:** new groupBy helper ([5c79a3a](https://github.com/ha4us/ha4us/commit/5c79a3a))
* **helpers:** new helper groupby ([e8353fc](https://github.com/ha4us/ha4us/commit/e8353fc))
* **template:** enabled javascript interpolation with {% %} ([eeedecc](https://github.com/ha4us/ha4us/commit/eeedecc))



<a name="0.23.0"></a>
# [0.23.0](https://github.com/ha4us/ha4us/compare/v0.22.0...v0.23.0) (2018-11-21)


### Features

* **mqtt.client:** added a reconnect and changed client property to protected ([1de52ad](https://github.com/ha4us/ha4us/commit/1de52ad))



<a name="0.22.0"></a>
# [0.22.0](https://github.com/ha4us/ha4us/compare/v0.21.0...v0.22.0) (2018-11-15)


### Features

* **templates:** new templating function based on lodash templates ([7779bf3](https://github.com/ha4us/ha4us/commit/7779bf3))



<a name="0.21.0"></a>
# [0.21.0](https://github.com/ha4us/ha4us/compare/v0.20.2...v0.21.0) (2018-10-16)


### Bug Fixes

* **adapter:** fixed problems if no $states is imported ([eb07b8c](https://github.com/ha4us/ha4us/commit/eb07b8c))
* **state.adapter:** caching was not working if the first time a status is emitted - empty cache ([77ea0de](https://github.com/ha4us/ha4us/commit/77ea0de))
* **state.service:** remove password from logging ([389da15](https://github.com/ha4us/ha4us/commit/389da15))


### Features

* **adapter:** added a status and added some logging information ([4402995](https://github.com/ha4us/ha4us/commit/4402995))



<a name="0.20.2"></a>
## [0.20.2](https://github.com/ha4us/ha4us/compare/v0.20.1...v0.20.2) (2018-10-05)


### Bug Fixes

* **ha4usmessage:** ts as string instead of number ([331e66f](https://github.com/ha4us/ha4us/commit/331e66f))



<a name="0.20.1"></a>
## [0.20.1](https://github.com/ha4us/ha4us/compare/v0.20.0...v0.20.1) (2018-09-28)


### Bug Fixes

* **object.service:** a wrong linereturn prevented install method to really install - damn ([7771400](https://github.com/ha4us/ha4us/commit/7771400))



<a name="0.20.0"></a>
# [0.20.0](https://github.com/ha4us/ha4us/compare/v0.19.3...v0.20.0) (2018-09-27)


### Bug Fixes

* **ha4usobject:** change definition (can were all false instead of boolean) ([2a53aad](https://github.com/ha4us/ha4us/commit/2a53aad))
* **mqttutil:** prevent that a $ in the middle is replace by domain ([3f72eab](https://github.com/ha4us/ha4us/commit/3f72eab))


### Features

* **diverse:** update cache handling in stateservice and move all lodash imports to helper in core ([c43d374](https://github.com/ha4us/ha4us/commit/c43d374))



<a name="0.19.3"></a>
## [0.19.3](https://github.com/ha4us/ha4us/compare/v0.19.2...v0.19.3) (2018-09-27)


### Bug Fixes

* **adapter:** added media service to index ([55f7b6d](https://github.com/ha4us/ha4us/commit/55f7b6d))
* **mqttutil:** fixed parameter ([5f1d536](https://github.com/ha4us/ha4us/commit/5f1d536))



<a name="0.19.2"></a>
## [0.19.2](https://github.com/ha4us/ha4us/compare/v0.19.1...v0.19.2) (2018-09-26)


### Bug Fixes

* **adapter:** added argument factory ([b51a634](https://github.com/ha4us/ha4us/commit/b51a634))



<a name="0.19.1"></a>
## [0.19.1](https://github.com/ha4us/ha4us/compare/v0.19.0...v0.19.1) (2018-09-26)


### Bug Fixes

* **arguments:** removed dependencie from $db or $dbFactory ([32d234e](https://github.com/ha4us/ha4us/commit/32d234e))



<a name="0.19.0"></a>
# [0.19.0](https://github.com/ha4us/ha4us/compare/v0.18.2...v0.19.0) (2018-09-26)


### Bug Fixes

* **mqtt.service:** replaced shareReplay with publishReplay(1).refCount() to allow auto unsubscribe ([53a95fc](https://github.com/ha4us/ha4us/commit/53a95fc))


### Features

* **mqttutil:** added splice and slice ([f26f1be](https://github.com/ha4us/ha4us/commit/f26f1be))
* **mqttutil:** added splice and slice ([de02667](https://github.com/ha4us/ha4us/commit/de02667))



<a name="0.18.2"></a>
## [0.18.2](https://github.com/ha4us/ha4us/compare/v0.18.1...v0.18.2) (2018-09-22)


### Bug Fixes

* **logging:** reduced logging level ([ffde111](https://github.com/ha4us/ha4us/commit/ffde111))



<a name="0.18.1"></a>
## [0.18.1](https://github.com/ha4us/ha4us/compare/v0.18.0...v0.18.1) (2018-09-11)



<a name="0.18.0"></a>
# [0.18.0](https://github.com/ha4us/ha4us/compare/v0.17.0...v0.18.0) (2018-09-11)


### Features

* **objectservice:** added role to query ([5b3c66c](https://github.com/ha4us/ha4us/commit/5b3c66c))



<a name="0.17.0"></a>
# [0.17.0](https://github.com/ha4us/ha4us/compare/v0.16.0...v0.17.0) (2018-09-11)


### Features

* **object:** emitting event from object changes via mqtt ([af1b847](https://github.com/ha4us/ha4us/commit/af1b847))
* **object:** emitting event from object changes via mqtt ([294992b](https://github.com/ha4us/ha4us/commit/294992b))



<a name="0.16.0"></a>
# [0.16.0](https://github.com/ha4us/ha4us/compare/v0.15.0...v0.16.0) (2018-09-09)


### Features

* **object definition:** added role descriptions ([bbf3fc3](https://github.com/ha4us/ha4us/commit/bbf3fc3))



<a name="0.15.0"></a>
# [0.15.0](https://github.com/ha4us/ha4us/compare/v0.14.0...v0.15.0) (2018-07-28)


### Bug Fixes

* **dbmediaservice:** fixed put (missing conversion to objectid) ([80568f5](https://github.com/ha4us/ha4us/commit/80568f5))


### Features

* **config/maps:** removed for the time beeing ([1e42fb6](https://github.com/ha4us/ha4us/commit/1e42fb6))
* **config/maps:** removed for the time beeing ([ec01573](https://github.com/ha4us/ha4us/commit/ec01573))
* **config/maps:** removed for the time beeing ([63f113c](https://github.com/ha4us/ha4us/commit/63f113c))
* **config/maps:** removed for the time beeing ([272d9e6](https://github.com/ha4us/ha4us/commit/272d9e6))
* **config/maps:** removed for the time beeing ([2954268](https://github.com/ha4us/ha4us/commit/2954268))
* **map and config:** disabled map and config service (wrong idea) ([d57cda9](https://github.com/ha4us/ha4us/commit/d57cda9))
* **models:** refactored types.ts and remove the I prefix of interfaces ([4638e09](https://github.com/ha4us/ha4us/commit/4638e09))
* **models:** refactored types.ts and remove the I prefix of interfaces ([b4996c9](https://github.com/ha4us/ha4us/commit/b4996c9))
* **utility:** added a filter for pattern function (use in array or rxjs filter function ([f118757](https://github.com/ha4us/ha4us/commit/f118757))



<a name="0.14.0"></a>
# [0.14.0](https://github.com/ha4us/ha4us/compare/v0.13.0...v0.14.0) (2018-07-17)


### Bug Fixes

* fixed release errors (deprecated lint rule) and compiler hint ([89984a8](https://github.com/ha4us/ha4us/commit/89984a8))


### Features

* **media:** import of directories of assets ([004dfb7](https://github.com/ha4us/ha4us/commit/004dfb7))
* **media:** mass deletion with filter ([dc587c7](https://github.com/ha4us/ha4us/commit/dc587c7))



<a name="0.13.0"></a>
# [0.13.0](https://github.com/ha4us/ha4us/compare/v0.12.0...v0.13.0) (2018-07-10)


### Bug Fixes

* **ha4us-error:** wrapError with clean else ([a22209f](https://github.com/ha4us/ha4us/commit/a22209f))
* **valuemap:** added missing type information and toJSON ([217e75e](https://github.com/ha4us/ha4us/commit/217e75e))


### Features

* **adapter:** the version information is read with different, more reliable approach ([ee0ef79](https://github.com/ha4us/ha4us/commit/ee0ef79))
* **config and map service:** rewritten using other structure of objects ([2d2715b](https://github.com/ha4us/ha4us/commit/2d2715b))
* **dbmediastore:** major changes for upload and download and datastructure ([d7ac9f1](https://github.com/ha4us/ha4us/commit/d7ac9f1))



<a name="0.12.0"></a>
# [0.12.0](https://github.com/ha4us/ha4us/compare/v0.11.0...v0.12.0) (2018-07-02)


### Bug Fixes

* **config.service:** fixed import name of $object (must be $object*s*) ([558e913](https://github.com/ha4us/ha4us/commit/558e913))
* **container.factory:** removed $web ([abc4535](https://github.com/ha4us/ha4us/commit/abc4535))


### Features

* **user.service:** updated token handling ([c08d757](https://github.com/ha4us/ha4us/commit/c08d757))
* implemented DI wrapper and added general tests for an adapter ([30b8f74](https://github.com/ha4us/ha4us/commit/30b8f74))



<a name="0.11.0"></a>
# [0.11.0](https://github.com/ha4us/ha4us/compare/v0.10.0...v0.11.0) (2018-07-01)


### Features

* **mapping service:** new mapping service going along with restructuring of the project ([b110c27](https://github.com/ha4us/ha4us/commit/b110c27))
* **media.service:** added get and expiry ([da4dba2](https://github.com/ha4us/ha4us/commit/da4dba2))



<a name="0.10.0"></a>
# [0.10.0](https://github.com/ha4us/ha4us/compare/v0.9.1...v0.10.0) (2018-06-30)


### Features

* adding db-media and test ([565ba08](https://github.com/ha4us/ha4us/commit/565ba08))
* **config.service:** new service for storing user and system configuration in database as an object ([60e5790](https://github.com/ha4us/ha4us/commit/60e5790))
* **mapping service:** new mapping service going along with restructuring of the project ([02499f6](https://github.com/ha4us/ha4us/commit/02499f6))
* **object.service:** deletion of a object + event test ([ea197ec](https://github.com/ha4us/ha4us/commit/ea197ec))



<a name="0.9.1"></a>
## [0.9.1](https://github.com/ha4us/ha4us/compare/v0.9.0...v0.9.1) (2018-06-22)



<a name="0.9.0"></a>
# [0.9.0](https://github.com/ha4us/ha4us/compare/v0.8.1...v0.9.0) (2018-06-21)


### Features

* **objectservice:** "new" method to easily create new objects from an adapter ([c42f5ed](https://github.com/ha4us/ha4us/commit/c42f5ed))



<a name="0.8.1"></a>
## [0.8.1](https://github.com/ha4us/ha4us/compare/v0.8.0...v0.8.1) (2018-06-09)


### Bug Fixes

* **core:** down to es5 ([941b6aa](https://github.com/ha4us/ha4us/commit/941b6aa))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/ha4us/ha4us/compare/v0.7.1...v0.8.0) (2018-06-08)


### Features

* **core:** extractTags with variable tags ([aa768e7](https://github.com/ha4us/ha4us/commit/aa768e7))
* **core:** new helper extractTags ([088ed44](https://github.com/ha4us/ha4us/commit/088ed44))
* **ha4us-error:** wrapping ENOENT ([5ab6cec](https://github.com/ha4us/ha4us/commit/5ab6cec))
* **user.service:** refresh intervall for token (auto refresh and check of valid user after 5 minute ([7dd2bb6](https://github.com/ha4us/ha4us/commit/7dd2bb6))



<a name="0.7.1"></a>
## [0.7.1](https://github.com/ha4us/ha4us/compare/v0.7.0...v0.7.1) (2018-06-05)


### Bug Fixes

* fixed build process (actually the build was left out) ([392a4ee](https://github.com/ha4us/ha4us/commit/392a4ee))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/ha4us/ha4us/compare/v0.6.6...v0.7.0) (2018-06-05)


### Features

* **mqtt.service:** new function observeLatest and new operator pickEach to pick a property of each ([fd1f8a8](https://github.com/ha4us/ha4us/commit/fd1f8a8))
* **mqtt.service:** possibility to observe more then one topic (messages are merged) ([ae5dcf9](https://github.com/ha4us/ha4us/commit/ae5dcf9))



<a name="0.6.6"></a>
## [0.6.6](https://github.com/ha4us/ha4us/compare/v0.6.5...v0.6.6) (2018-06-01)



<a name="0.6.5"></a>
## [0.6.5](https://github.com/ha4us/ha4us/compare/v0.6.4...v0.6.5) (2018-05-24)
