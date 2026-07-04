# Changelog

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
