# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - 2026-11-08

### Security

- Upgraded Next.js to 16.4.5, resolving published advisories (including critical ones) in 16.2.1.
- Pinned patched versions of transitive dependencies (`browserslist`, `dompurify`, `fast-uri`, `source-map-js`, `@babel/core`) via pnpm overrides; `pnpm audit --prod` is clean.

### Changed

- Dependency updates: `monaco-editor` 0.55.1, `tailwindcss` 4.2.2, `zustand` 5.0.12, `@next/mdx` 16.4.5, `ts-jest` 29.4.6, `@types/node`, `tw-animate-css` 1.4.0, `@radix-ui/react-slot` 1.2.4.
- CI actions: `pnpm/action-setup` v6, `codecov/codecov-action` v7.

## [0.1.1] - 2026-03-14

### Fixed

- Mobile header menu: `Demo pipelines` now expands inline as a collapsible section so demo items stay visible on small screens.

## [0.1.0] - 2026-03-14

### Added

- Initial public release of the JSON transformation web app.
- Composable operation pipeline editor with live output preview.
- Client-side transformation runtime with import/export helpers.
- Shareable workspace state and operation metadata export support.
- Unit and integration test coverage for runtime and UI flows.

[0.1.4]: https://github.com/nekser/jsonloom/releases/tag/v0.1.4
[0.1.1]: https://github.com/nekser/jsonloom/releases/tag/v0.1.1
[0.1.0]: https://github.com/nekser/jsonloom/releases/tag/v0.1.0
