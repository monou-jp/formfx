# CHANGELOG

## v1.0.0 (2026-01-13)

### Breaking Changes
- Internal implementation details (tokenizer, parser, evaluator, dom helpers) are no longer exported.
- Directory structure reorganized: internal logic moved to `src/internal/`.

### Added
- **API Stabilization**: Public API is now strictly defined and frozen for v1.x.
- **Arithmetic Operators**: Added support for `+`, `-`, `*`, `/`, `%` in expressions.
- **Improved Selector Support**: `findById` now falls back to `name` attribute and `data-fx-id` for better developer experience.
- **Memory Management**: Enhanced `destroy()` method to ensure all event listeners and observers are cleared.
- **Rule Priority**: JSON rules now correctly override attribute-based rules on the same element.
- **Build**: Added ESM and CommonJS support with proper `exports` in `package.json`. RuleEditor is now a separate entry point.
- **Tests**: Comprehensive unit and integration test suite using Vitest.
- **Radio Button Support**: Improved handling of radio button groups in expressions.

### Fixed
- Fixed issues with `show/hide` effects not restoring original display styles.
- Fixed dependency tracking for fields referenced only by `name`.

---

## v0.4.0
- Added Rule Editor.
- Added persistence (localStorage).
- Added `pause()` / `resume()` / `reEvaluate()` methods.

## v0.3.0
- Added Repeater support.
- Added `@row` context.

## v0.2.0
- Added JSON rules support.
- Initial attribute-based rules.

## v0.1.0
- Initial internal release.
