# Changelog

## [0.7.0](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/frontend-v0.6.1...frontend-v0.7.0) (2026-09-08)


### Features

* add a staging environment ([af10008](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/af1000801c3e8b3421177362019d3f0ae9ebbb2d))
* add new font files and implement animations for sheet transitions ([c65f3bc](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/c65f3bcd8393286578168b48fc2e524b7b73ce63))
* add PDF export functionality with trial details and styling ([9e293cd](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/9e293cdd39a569df4f71d1291a96fd22fc723279))
* add pdf renderer dependencies ([5332d01](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/5332d0145ce5c0ba7f43c1d7ca6a36b37482ed6f))
* add Sheet component ([470f23d](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/470f23dbb7c0e60f07b70ca3b6532920ad2ecb09))
* add Toaster component ([56e80fc](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/56e80fc240c95f643a8fc16f7c8641804469b6cf))
* contact information for trial sites ([#106](https://github.com/RealPaiLab/ClinicalTrialChatbot/issues/106)) ([a0b7cfc](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/a0b7cfcd1f10706002cc5d4d88a719cb7ca57b66))
* **dependencies:** add i18next and react-i18next for internationalization support ([af73275](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/af73275e92042345d881a07b1b6e2c0b2cc2b5b5))
* enhance bookmarking functionality in TrialSummary components and ChatPanel ([8ba2cb9](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/8ba2cb9eb7b644190d3f2e58d96f183222ec219d))
* enhance language selection and onboarding tour experience with improved dialog and blur effects ([#87](https://github.com/RealPaiLab/ClinicalTrialChatbot/issues/87)) ([1485c03](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/1485c03aa793616fa40bfc40d92a8b09fb4087e7))
* enhance map view synchronization with initial view handling and empty state checks ([bb2d302](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/bb2d30281941fe873eac9efbf0591879f160078e))
* implement bookmarking functionality with state management and UI components ([112e078](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/112e0787503491d92fc4f009b23b76e3d71548c5))
* implement BookmarkRow and BookmarksSheet components with loading states and export functionality ([1806c02](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/1806c025806c8a0fb4047c36e03cc320d90e93f5))
* implement environment configuration for frontend and update related components ([15ad74b](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/15ad74bdf63cff296aa83af54acc3e962a2abb7c))
* integrate i18n for translations across components ([10f81c2](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/10f81c2091475140de71da567d58e0f39b53960d))
* schedule the trial data refresh and show when it last ran ([#109](https://github.com/RealPaiLab/ClinicalTrialChatbot/issues/109)) ([c9a48ec](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/c9a48ecd1b3ca4031ac2895996ea0768f9f16e4b))
* **translation:** Add 6 supported translation languages ([ebcf9ec](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/ebcf9ec185e50b01215e89645b027a8e3133d3c4))
* **translation:** on-demand trial translation in the summary panel ([2ffe289](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/2ffe289be3e62f69eb826fd6f1761aff1786f0ea))
* **translation:** update pre-release version text to use translation key ([d78e58f](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/d78e58fb0f0835b8bf3b166fc094b0e26f0a9b4c))
* wire the agent to the full CTC corpus ([#102](https://github.com/RealPaiLab/ClinicalTrialChatbot/issues/102)) ([d6e5b1b](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/d6e5b1b77c64792fab4a2dcd07e9b930e0418dea))


### Bug Fixes

* add zoom buttons and navigation control to the map ([bce260e](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/bce260e4627ede096e71836d59d4e4ba814d5e45))
* enhance chat messages with trial context and improve UI responsiveness ([815bc43](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/815bc43adaa352e6bdb3e65caf0f417aad3c823d))
* implement CountPin component to display trial count on map pins ([e92bf45](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/e92bf4538402845de0a1fb6d6731e61da9e9b38d))
* improve map view synchronization and animation parameters ([f49e2a5](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/f49e2a5f2b092971e900a2310dd722a58b6641e9))
* restore the map popup and open it for single trial sites ([#107](https://github.com/RealPaiLab/ClinicalTrialChatbot/issues/107)) ([37564d0](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/37564d0ecd560b38295f700d98919a6b97fc6a40))

## [0.6.1](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/frontend-v0.6.0...frontend-v0.6.1) (2026-07-27)


### Bug Fixes

* update react-router-dom to react-router and adjust imports across the application ([9d59fb0](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/9d59fb0257bbf2b1de1ad5f4f7dd969163ab49b0))

## [0.6.0](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/frontend-v0.5.3...frontend-v0.6.0) (2026-07-22)


### Features

* improve Langfuse settings to capture patient text and update te… ([4cc92f3](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/4cc92f3aa1592221f0e12f366c7900d126faa956))
* improve Langfuse settings to capture patient text and update terms of use version ([9196046](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/91960460ebae7c87e5a883c9716bef1349dd934b))


### Bug Fixes

* update fast-uri version in pnpm-lock.yaml and pnpm-workspace.yaml ([c4a3900](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/c4a390072d3bd4ba8d72cdd06af2ede71b63cd4f))

## [0.5.3](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/frontend-v0.5.2...frontend-v0.5.3) (2026-07-21)


### Bug Fixes

* add trial data freshness notices to ChatDisclaimer and AppHeader ([917fe6d](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/917fe6daa17f0a3652d2f6c8c611358964667fb9))
* add trial data freshness notices to ChatDisclaimer and AppHeader ([4cf578b](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/4cf578bb2aa2170368f00f59097624b349ece81d))

## [0.5.2](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/frontend-v0.5.1...frontend-v0.5.2) (2026-07-21)


### Bug Fixes

* enhance trial selection by adding selectedSiteKey to relevant co… ([667b061](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/667b061fc4475daa2128816e7533f7357518bab4))
* enhance trial selection by adding selectedSiteKey to relevant components and hooks + uv vulnerability patch ([9d7ea5c](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/9d7ea5cb9c4b3b14b675ffd65c95e29ae19bd42a))

## [0.5.1](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/frontend-v0.5.0...frontend-v0.5.1) (2026-07-21)


### Bug Fixes

* add pnpm overrides for brace-expansion and js-yaml dependencies ([6bb3923](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/6bb3923944468ff421d461a5e20edeea446efb72))
* include pnpm-workspace.yaml in Dockerfile copy command ([ed94d5b](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/ed94d5bdf17e403289387dfc6566ce7d26c9708b))

## [0.5.0](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/frontend-v0.4.1...frontend-v0.5.0) (2026-07-16)


### Features

* add the alpha label on the header ([454912c](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/454912c38c74d9b441a8c1ac435e838cf774fecd))
* enhance consent UI with improved messaging and visual elements ([3e7c1c8](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/3e7c1c805ec37de160e49f76fd4666818ac07339))
* enhance TurnstileService and TurnstileGate to conditionally enable based on environment settings ([b2cdb87](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/b2cdb87949414f1cd9c26e17cef58ffb12dcf3df))
* implement consent gate with terms acceptance and related UI components ([354ed7e](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/354ed7e76e8e9ca08634744dad2475210741468b))
* implement Turnstile verification for enhanced security ([bd552ac](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/bd552acbb9d28a599679fc29be77955c8bb29201))
* implement Turnstile verification for enhanced security ([176ad6c](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/176ad6c9a7bee6871439d9e34655da6406ac733e))
* implement Turnstile verification with session management and local storage handling ([fec80d7](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/fec80d79fc0c76c497a12a3861d5f67f867afa5a))
* improve environment configuration and Langfuse integration for development and production ([cf93069](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/cf93069aee241f904408c0eaa85a48393a4f5775))

## [0.4.1](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/frontend-v0.4.0...frontend-v0.4.1) (2026-07-10)


### Bug Fixes

* add c-ares dependency fix ([247f6ad](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/247f6adb3705b634ae4e9d4da8d0363198e349bf))
* adjust AccordionTrigger layout ([1b1973e](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/1b1973ef43bb883e51a7f18b4d9a1d8165ccf915))
* adjust fill and line opacity based on zoom level in MapPanel ([94bcd38](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/94bcd3870c64b27e768709ce7f37c96062a3b5a3))
* enforce maximum message length in chat and handle error messaging ([e4181c5](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/e4181c5f35f3c7fcc36736496c5f2500afaa9432))
* enforce maximum message length in chat and handle error messaging ([47da11f](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/47da11fde60ba17919b402d63c547665a243c842))
* update test assertions to include 'Cancer' in the title ([fb17690](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/fb176909504b55c7aee638b984e98c76ba59b042))
* update titles and messages to include 'Cancer' for consistency ([5cab764](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/5cab7647beffc2e52cac516d57e4adf6e9d8fea9))

## [0.4.0](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/frontend-v0.3.0...frontend-v0.4.0) (2026-07-05)


### Features

* add driver.js dependency and implement tour data attributes in chat components ([b8bb26b](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/b8bb26b72017ae353061331aeefb1878320a2b75))
* add Ontario boundary geojson and integrate it into the map with hover info ([009b17e](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/009b17edc25e84d241143166b2f7a2c30a1ee60e))
* adjust ResizablePanel sizes for improved layout on HomePage ([ab1187a](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/ab1187aef6ed724ca41d5466fdb10ff650de9f07))
* enhance chat input and trial summary components with context management and improved UI interactions ([5da8db6](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/5da8db6ec728a6d78402cbec8b94a0ac56d382db))
* implement onboarding tour with demo trials and UI enhancements ([454b4c1](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/454b4c1cd18d405d6bddcd5bb7b6a914d217ad6c))
* implement onboarding tour with demo trials, UI enhancements, and tour blur effects ([c864bd0](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/c864bd03bf4c7dbcd141a3097d470160829c52fe))
* implement Zustand store for app state management and update HomePage component ([76c9048](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/76c904813576e673fe618655bb7018d0d1edb678))
* swap tour popover titles and descriptions for trial link and add context elements ([6ccc4c3](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/6ccc4c3777b46ae2f0f3a7851c07baf5485ebd81))
* update HomePage to use useLayoutEffect for theme toggling ([03f3520](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/03f352034d71b87cf31f31a8cb9a6444345fb892))


### Bug Fixes

* update theme toggle button accessibility and adjust background colors for consistency ([67e9adc](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/67e9adcc7efff5f761206e8127925eba43c74f6e))

## [0.3.0](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/frontend-v0.2.1...frontend-v0.3.0) (2026-07-03)


### Features

* implement rate limiting for chat API and enhance error handling ([a1bec2b](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/a1bec2ba1f0d2b562d8d3c80d33dd5997e79b6c7))

## [0.2.1](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/frontend-v0.2.0...frontend-v0.2.1) (2026-07-02)


### Bug Fixes

* update environment setup and add runtime configuration files ([fc79804](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/fc7980461c746f8852db7a3ba25e302cc040ac67))
* update environment setup and add runtime configuration files ([d47c7ed](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/d47c7edeedda954162b9a4961b603c99e91700aa))

## [0.2.0](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/frontend-v0.1.0...frontend-v0.2.0) (2026-07-02)


### Features

* add @tanstack/react-query dependency ([9955840](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/99558407981032e3dff56dac3861e0dae14f6848))
* add ai-elements components ([ef1234c](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/ef1234c6e53809efcecb56323c46983b3ae860ad))
* add Ask AI functionality with term definitions and chat disclaimer ([54d3365](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/54d336526292a726111c1b2f847a890f36b7da6b))
* add camelcase-keys dependency and define vite environment types ([0e3220d](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/0e3220d1a8d5f38c00355b9eba18018e21efedbd))
* add custom hooks for managing cluster disclosure and map view synchronization ([5c79e4a](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/5c79e4ae75aac81be449c07141ca0be14f821a10))
* add embedding provider selection to DebugPage and update DebugSearchParams interface ([a3048b4](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/a3048b43612b7d51ab05ca581fa135a8b4e1f6b6))
* add feedback functionality with MessageFeedback component; integrate feedback submission in chat ([e117076](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/e117076770dbe3ec7e01f4db67da05f4d077b5c8))
* add Mapbox style variables to environment configuration ([25ed4a4](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/25ed4a4ff36006e8959c8135923272d07637505c))
* add react-router-dom dependency and enable debug page in environment config ([3972538](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/3972538f94b6719783987da4a1767c48fc38ddba))
* add release configuration and update frontend version to 0.1.0 ([c5a5297](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/c5a52973bfe6977837d8ac0bbe16de7e006aeeeb))
* add SelectedTrials component and integrate trial selection in ChatPanel; update HomePage for context management ([cbc1650](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/cbc1650ea04244f6d8605e2b18f458a1f1f5e746))
* add Spinner and SearchingIndicator components for loading states in chat; update ChatMessages to use SearchingIndicator ([58b657f](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/58b657fd7b1072eaa25d5cd75ca748eac874e910))
* add testing dependencies and remove vite app template ([622492e](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/622492ebfffcf1b7879422e98e7571c2c6975d86))
* add tests for extractNctNumbers and chat service functionality ([b640b07](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/b640b07fbfa1b7675188aee3cb601cf93f1704ab))
* create a design system for the app ([1e3e30f](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/1e3e30fbbff2a506a01470d64a8ef4f133b1c5ec))
* enhance MessageFeedback component with new tests and improve feedback submission UI ([62fac02](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/62fac02659e03014ca9e34b564d4577b8560a9ec))
* enhance trial summary components and improve styling; add accordion UI for criteria and facts ([544c4ab](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/544c4abf0139ce2f346c0e47804c9a8da9b22971))
* implement chat functionality with ChatPanel, ChatInput, and ChatMessages components; add tests for chat features ([8158783](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/8158783cadb5a460a8c32c490e20c5149b5aca46))
* implement chat service and event parsing for real-time communication ([557dd9b](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/557dd9b90ad2d1fea10004e3d1d70aff23e1b204))
* implement ClusterPin, DualPin, and PinShape components for map visualization ([6282afd](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/6282afd6bf0bde4e1eb66facac6ecd1fb1d5be64))
* implement debugging interface with trial search functionality and table display ([5e99a74](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/5e99a741b98cb07399dd466dd53a28e07f209dd8))
* implement HomePage with resizable panels and update App tests ([d915746](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/d9157467679d41e03cec32214f9d2d43ef85c460))
* implement map components including HospitalPin, MapLegend, MapPanel, and TrialMarker for trial visualization ([141525b](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/141525b2c22e3c467bbc17287de1da0c85144321))
* implement runtime configuration for frontend and backend Docker images ([dc6e8e2](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/dc6e8e2b90d7b508db3dfb85db63b32454ba3759))
* implement useChat hook and integrate services ([cd7917f](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/cd7917fd633b78604e1bb2fbda0acc120d632495))
* initialize frontend with React and Vite ([0896a17](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/0896a1783f67c82854b914484732bfda0efea58e))
* integrate MessageResponse component for trial details and criteria display ([95b5e66](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/95b5e66a45b830b63e38c9169d5ea6b1e45d8cdc))
* integrate react-query for data fetching and enhance chat components with citation support ([6392caa](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/6392caa9f54e7017898fe4baeb9decdfc01f60a2))
* refactor MapPanel to use custom hooks for trial pins and cluster disclosure; add TrialCluster component for better trial visualization ([a7f20fd](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/a7f20fd3232dfeea960e5ca8a4cb647f18b088ba))
* set up frontend CI with linting, Docker, and project structure ([7a07779](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/7a077790c60dec5fef077314884d643089e3aa78))
* setup tailwind and shadcn ([efecf91](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/efecf915e24bf7c30d1b97a9870102d9efd18e47))
* update App tests to reflect accurate rendering and add trial status tests ([c9084c9](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/c9084c970655d030716b190c1f160121988fa92c))
* update GitHub Actions workflow to handle versioned tags for backend and frontend images ([f099695](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/f099695f4c2fa92aaa4d193b369f5272ae85c470))


### Bug Fixes

* add container reference and resize observer to MapPanel for responsiveness ([e1bbd03](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/e1bbd036b6beaa1c0b048e6bd44e7fe9f5185640))
* fix linting problems ([74a9efa](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/74a9efac3c9609ea9ab5dd16bd3202ac7e323ff3))
* format frontend files using prettier ([52438d8](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/52438d80f1b898891f55d00fa650a70bfed05b8a))
* linting ([13be326](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/13be326c89da1061e0a1151b65b4372f4720c524))
* update dependencies ([4bd38bf](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/4bd38bfdc3f4dcc73b0475472d1c268503a4b6e3))
* update favicon ([23dada1](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/23dada1fe09ee6af936be39a124a097cce00d898))
* update favicon color ([b5d0a13](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/b5d0a135671ee3751aadc810fa851f055d4d74bf))
* update pnpm version in Dockerfile and add build arguments ([bbd178b](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/bbd178be1f2ca83b0d0782c043b14f844c48dff0))
