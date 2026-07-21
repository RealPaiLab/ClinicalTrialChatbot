# Changelog

## [0.5.1](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/backend-v0.5.0...backend-v0.5.1) (2026-07-21)


### Bug Fixes

* enhance trial selection by adding selectedSiteKey to relevant co… ([667b061](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/667b061fc4475daa2128816e7533f7357518bab4))
* enhance trial selection by adding selectedSiteKey to relevant components and hooks + uv vulnerability patch ([9d7ea5c](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/9d7ea5cb9c4b3b14b675ffd65c95e29ae19bd42a))

## [0.5.0](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/backend-v0.4.2...backend-v0.5.0) (2026-07-16)


### Features

* enhance TurnstileService and TurnstileGate to conditionally enable based on environment settings ([b2cdb87](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/b2cdb87949414f1cd9c26e17cef58ffb12dcf3df))
* implement consent gate with terms acceptance and related UI components ([354ed7e](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/354ed7e76e8e9ca08634744dad2475210741468b))
* implement Turnstile verification for enhanced security ([bd552ac](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/bd552acbb9d28a599679fc29be77955c8bb29201))
* implement Turnstile verification for enhanced security ([176ad6c](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/176ad6c9a7bee6871439d9e34655da6406ac733e))
* implement Turnstile verification with session management and local storage handling ([fec80d7](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/fec80d79fc0c76c497a12a3861d5f67f867afa5a))
* improve environment configuration and Langfuse integration for development and production ([cf93069](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/cf93069aee241f904408c0eaa85a48393a4f5775))
* refine agent persona and response guidelines for clinical-trials navigator ([db332d2](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/db332d28e820bed767717a4b3d7d800f489d19f4))

## [0.4.2](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/backend-v0.4.1...backend-v0.4.2) (2026-07-10)


### Bug Fixes

* enforce maximum message length in chat and handle error messaging ([e4181c5](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/e4181c5f35f3c7fcc36736496c5f2500afaa9432))
* enforce maximum message length in chat and handle error messaging ([47da11f](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/47da11fde60ba17919b402d63c547665a243c842))
* refine define_term usage guidelines and clarify scope limitation… ([6f620b1](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/6f620b1c3f0747004d3da847e44cd25e59d58cff))
* refine define_term usage guidelines and clarify scope limitations for patient interactions ([a93fb0c](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/a93fb0c475a6f9ad14194767225ae9a914d4318d))

## [0.4.1](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/backend-v0.4.0...backend-v0.4.1) (2026-07-05)


### Bug Fixes

* improve payload parsing logic in RemoteExperimentTrigger ([65e74d4](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/65e74d49eb37617ee220ec4415b81ad1306820f0))

## [0.4.0](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/backend-v0.3.0...backend-v0.4.0) (2026-07-03)


### Features

* implement rate limiting for chat API and enhance error handling ([a1bec2b](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/a1bec2ba1f0d2b562d8d3c80d33dd5997e79b6c7))

## [0.3.0](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/backend-v0.2.1...backend-v0.3.0) (2026-07-02)


### Features

* implement prompt seeding functionality on first run ([087b944](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/087b944a60c9c0f62db89a81c3b771c7eb254b78))
* implement prompt seeding functionality on first run ([5bc8498](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/5bc8498b8edb06f5320ff5bee621853a1e53f421))

## [0.2.1](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/backend-v0.2.0...backend-v0.2.1) (2026-07-02)


### Bug Fixes

* update environment setup and add runtime configuration files ([fc79804](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/fc7980461c746f8852db7a3ba25e302cc040ac67))
* update environment setup and add runtime configuration files ([d47c7ed](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/d47c7edeedda954162b9a4961b603c99e91700aa))

## [0.2.0](https://github.com/RealPaiLab/ClinicalTrialChatbot/compare/backend-v0.1.0...backend-v0.2.0) (2026-07-02)


### Features

* add __init__.py file for repository package initialization ([21ad869](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/21ad869498e990626ef89506fc551f87432455d6))
* add __init__.py file for tests package initialization ([7077bc3](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/7077bc3c6b93358dc961104ca833bcb97ecf3e2c))
* add alembic and sqlalchemy dependencies ([f107b6c](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/f107b6cb0e62599386947a7aa0d38c14d77c27a1))
* add data schema and models for locations, trials, and trial sites ([71316c9](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/71316c93830ad30d14366c02946c78f3f07d6e91))
* add debugging interface with new debug route and configuration option ([47c214b](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/47c214b5549ec0671d738061317d4d2d5d784b54))
* add DefineTermInput schema and define_term function for glossary term definitions ([450f2d9](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/450f2d951a68544f1e925e71d145d3aa2ae3696f))
* add Docker Compose configuration and environment example file ([0296520](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/029652041e1e4af6a9134b87fb7aae5ef5abe364))
* add Dockerfile for backend application build and runtime environment ([b5af99c](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/b5af99c58d0b8a1df8b1049ae4b8d3f5824f3185))
* add embedding configuration to environment settings ([3342cbf](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/3342cbffc2d044c74582a2974958317db56ebc66))
* add embedding provider parameter to search_trials for semantic search ([35c127b](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/35c127b4574139518e959115da016af6b1c1a68c))
* add environment variables for Langfuse ([30f9af7](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/30f9af75bd5247e04beef91fb57c33f56ba8eeea))
* add geocoding script using Mapbox API for location addresses ([f5852ea](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/f5852eab4b2f490800aa86b0ce2b98fdff5b5603))
* add glossary functionality and enhance trial citation details in tests ([f4eb2db](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/f4eb2db6fb9407f13e473374d5bd2ff2b77532b9))
* add initial __init__.py files for core, models, routes, scripts, services, and utils ([69867d9](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/69867d90c5d46d6ac456e95374c7b7b9f57e5a3c))
* add initial implementation of clinical trials prompts and bootstrap script for Langfuse ([4ea6f1d](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/4ea6f1d244c72165efe17d926ad5e4c4b70719e2))
* add initial test suite for clinical trials agent and related services ([6936a50](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/6936a50b8524c4668faef587f59dece138b1277a))
* add Langfuse configuration for prompt fetching and Redis dependency ([b952bdb](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/b952bdb830b5f354044345c0290cb9db831cb9ea))
* add Langfuse configuration to environment settings ([5699639](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/56996395812816071f8387ce5bfc58edd3893b08))
* add langfuse dependency ([a73545d](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/a73545de0402c34ae90fe71c1fd790576f3c27d9))
* add Langfuse prompt name and label for production environment ([0a65ff4](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/0a65ff4a8a3de7153e1a32edda1fe60d9f93be3c))
* add LLM configuration to environment and settings ([f74dd21](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/f74dd2128086b6133ea8604015b46877578730ab))
* add logging configuration and logger utility ([28407e2](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/28407e2a9772595ae42a9a674b596577ea2218dc))
* add observation decorator to search and detail functions for enhanced tracking ([6acc890](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/6acc8902d75cbb34e68b8d9df41549d667685157))
* add offset parameter to search functions for pagination support ([ea1a737](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/ea1a73727719bfebc6002929b18063ae25879dd7))
* add OpenAI embedding column and rename existing embedding fields ([ab8eab3](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/ab8eab37b23a32eb24e55d4266d5a232eef287ef))
* add pre-commit hooks for backend ([74121b7](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/74121b716a3568eb9ca319360fe5cdd716574b34))
* add province restriction and agent tool call limit to settings and trial search logic ([5cba0d9](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/5cba0d9224d1d37963186110345ff510834a9fb2))
* add province restriction to environment configuration and update .gitignore for specific scripts ([28b7b7d](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/28b7b7d148e17d18ff80e159fdf75904f1cff763))
* add pydantic-ai dependency ([69aac46](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/69aac4623ca4a629b92cf5f7bdcd4c79e9818734))
* add rich library for enhanced console output and create .gitignore for JSON files ([b3ae4c4](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/b3ae4c418b46fdcb0ffadfc66db5a227b8020dd9))
* add schemas for chat results and trial citations ([de5a877](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/de5a877177804e41001cab8e42e21c4bc5cbf0f9))
* add semantic search functionality to TrialSearchService ([9a43342](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/9a43342ae965c3c7e164099bbd8dc56046196c3c))
* add semantic search tool to agent ([35a3f7d](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/35a3f7d186a4803b5cd2a2d2063c69857a12f07d))
* add separate embedding fields for Qwen and OpenAI in transform_trial function ([80550c8](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/80550c81b833b98c9c4534d445f0a3e3cf203831))
* add separate embedding fields for Qwen and OpenAI models in Trial model ([6980016](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/6980016e76776386f736833aaff85abb47d0a2f2))
* add settings configuration for PostgreSQL database connection ([233bfbf](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/233bfbf01b65c1455f1e1d9214215c35c0890f3d))
* add tool_calls and seen_calls attributes to AgentDeps for tracking tool usage ([f515e54](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/f515e54232fbc19a4dc5d2dec008edc8d7f3a10c))
* add trial document composition functionality ([0320d22](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/0320d22a1b4809e38f1cc25b66bae05c5c828b69))
* add type hint to health endpoint and create placeholder test file ([171ec3f](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/171ec3fee3c06dcf280b93df0da8b4bd2716a947))
* enhance AgentResponse and TrialCitation models with additional fields for improved trial information representation ([6d6b533](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/6d6b533f2849dd9d7e1069ffe4e5ffd9998baca5))
* enhance embedding functionality with instrument option and update debug trial search ([eed3ac8](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/eed3ac8ae20640df4fa4a6ed04a78f8fe0eaeb63))
* enhance patient communication guidelines in prompts for clarity and empathy ([80582e0](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/80582e0fc5f2229db689e0b98891b195a7459dcb))
* enhance PydanticAIEmbedder to support query prefixes and update Ollama embedding integration ([4a69912](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/4a6991283cf7f5a301d50867f2d1b6920472b24f))
* enhance trial filtering with status matching and update citation logic ([eada354](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/eada3545a2dd379a7e3537a6520e10c0e9f75eee))
* enhance trial search functionality with cancer type filtering and location matching ([2dd3e47](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/2dd3e47955457800486ffd74bb37df6cfa7e8317))
* implement centralized guardrails for clinical trials agent and apply guards to search functions ([dda5560](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/dda556056c14109bf469ce3054cd9c7e3467bc3e))
* implement chat and trial routes with streaming responses ([279d71d](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/279d71dfca787df3eca7c92776f83ced675edeaf))
* implement ChatService for clinical trials agent with streaming capabilities ([e2786ab](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/e2786abdfc1e83c0d1dd5844e439407607e52540))
* implement clinical trials agent with search and output handling ([a2a6d46](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/a2a6d46b3b7280218539dfb92025de0ccef7e603))
* implement conversation repository interface and in-memory storage with conversation service ([fa68c76](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/fa68c76bd71a72ff308fb64fa55866e0123f8328))
* implement embedding module with QueryEmbedder and PydanticAIEmbedder classes ([e0e5fd3](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/e0e5fd3a2a6361e691efaf1d6f3a5534ed160862))
* implement Langfuse setup and integration in the application ([3b55733](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/3b55733f5023811e7c2ed0fe6587739f347e4cf5))
* implement LLM provider factory with OpenAI and Ollama support ([c03ca0f](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/c03ca0fbfd5f55eb0f6dddaaa5993bf124eb8aae))
* implement OpenAI Batch API embedding client with async support ([ac82f2a](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/ac82f2aae54fcfbdf2a5a0f36171e0aeb73a5933))
* implement script to fetch Canadian clinical trials from Cancer Trials Canada API ([0ed312e](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/0ed312ee79c0fefb32787d9de6030d105693d0c8))
* implement seeding script for clinical trials ([ef36c93](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/ef36c931d89370eb981bdb2f5da802b56481df52))
* implement trial repository and search service with structured filters ([10f7c99](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/10f7c998ab25b97d587b71c6fb7dd4422d28b675))
* import Embedder and ensure its instrumentation in Langfuse setup ([6ff97bf](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/6ff97bf0c3a371e040d24b5a8b554385bd7e1bf1))
* initialize frontend with React and Vite ([0896a17](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/0896a1783f67c82854b914484732bfda0efea58e))
* integrate feedback section with new routes and schemas; add feedback submission functionality ([3d1488a](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/3d1488aabac4cde870df5ee051f2780c344c2316))
* integrate glossary functionality into clinical trials agent and chat service ([4beae0e](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/4beae0e4c74a64eb39ec3190bd97558595a43c0b))
* integrate OpenAI embedding model and add configuration options ([9e1d01f](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/9e1d01f4e5231f329fbda946dee08093388cb2a8))
* integrate OpenAI embedding providers with batch processing support ([c98fa9c](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/c98fa9c358a1f65eec9ab67012e960f957eb71c5))
* integrate semantic search into chat service and update prompts for improved patient interaction ([8f9f260](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/8f9f260cc483a8a84ec2fb0281a81948895b0843))
* introduce glossary repository and schemas for term definitions ([950c61f](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/950c61f49f3575bd0d05adadd1fd04fc55528bb8))
* refine clinical trials search functionality with syntactic search and input schema updates ([9d8f36f](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/9d8f36fe4584bba3f499ea43daf1e8dd8ca7f1f7))
* set up frontend CI with linting, Docker, and project structure ([7a07779](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/7a077790c60dec5fef077314884d643089e3aa78))
* set up PostgreSQL and Alembic configuration for database migrations ([2f03678](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/2f03678f643f89d9fba3600ec199ff299e5a9287))
* set up PostgreSQL and pgAdmin services in Docker Compose ([53a71be](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/53a71bedf95c02cbbcbda84e1693541c25ace746))
* standalone script to seed db with  trial's embeddings ([335152b](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/335152bcaf8a9a4850286a19702c26d0bfcea521))
* update embedding model to qwen3-embedding:0.6b and add corresponding enum ([2fc7c49](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/2fc7c49b3d58fb86a10d3e5233d48bb729eb9614))
* update embedding provider to OpenAI and adjust related configurations ([8548e43](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/8548e43f36acdce4d37ad723b98c37a9090830af))
* update pyproject.toml and uv.lock for build system and editable package source ([8ae2f53](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/8ae2f5353183cb2eab601d7191ca76d78cb1f39e))
* update semantic search tests to use Qwen embedding and add provider override functionality ([256ab39](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/256ab396a55c80e70cdce71904c418a69593b433))


### Bug Fixes

* enable unaccent extension and update substring match to be accent-insensitive ([6fd2281](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/6fd22812905825c94b06b68ffc10526a56b8c686))
* enhance agent response formatting and inline definitions for clarity ([b8ffa52](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/b8ffa522bcdfe5d2736da322a8b6dbede04d0957))
* fix function name typo ([11921d2](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/11921d275df513d075470e6ae309c3236ffe5466))
* inforce NCT inline format in agent response ([391400e](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/391400e27e9d99921324545510c541dd0c29230e))
* integrate trace_id_from_session into ChatService for enhanced tracing ([e0002d6](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/e0002d6ad25d6093ed691614583480bc1f80df01))
* refactor TrialSearchService to use async session for database operations ([eda6b83](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/eda6b831ac82d3cd1b089dbfefe74c9af676e3d0))
* refine search logic to avoid redundant queries and improve patient guidance ([f6d7fa6](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/f6d7fa6d55eb797b172327166fd27c81debd63cf))
* update default search limit from 20 to 10 in Settings ([ad31f91](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/ad31f91523c7b47ae73d22dcc7126f86820523aa))
* update follow_up_questions description for clarity and patient engagement ([1bfbbe6](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/1bfbbe6e03ae4a1b6d546f64d599978b16a8b716))
* update pgAdmin configuration and add servers.json for database connection in dev environment ([f248860](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/f248860281af80377fba768e8e2788f254f06b45))
* update task_id type in fetch_page function to use TaskID ([1cd0a35](https://github.com/RealPaiLab/ClinicalTrialChatbot/commit/1cd0a351fa11dab6f916d37d82f84353c948a4a6))
