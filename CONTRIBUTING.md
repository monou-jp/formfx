# Contributing to FormFx

First off, thank you for considering contributing to FormFx!

## Development Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Build in watch mode**:
    ```bash
    npm run dev
    ```
4.  **Run tests**:
    ```bash
    npm test
    ```

## Project Structure

- `src/core`: The main `FormFx` class and entry point.
- `src/internal`: Private implementation details (tokenizer, parser, evaluator). **Do not export items from here in `src/index.ts`.**
- `src/plugins`: Official plugins like the Repeater.
- `src/editor`: Rule Editor implementation (separated from main bundle).
- `src/public-types.ts`: Strictly defined public types.

## Pull Request Guidelines

- Ensure all tests pass.
- Add tests for new features or bug fixes.
- Follow SemVer. v1.x must not have breaking changes.
- Update `CHANGELOG.md` with your changes.

## Testing

We use [Vitest](https://vitest.dev/) for unit and integration tests.
For E2E tests, we use [Playwright](https://playwright.dev/).

```bash
# Run unit/integration tests
npm test

# Run e2e tests (Playwright must be installed)
npm run test:e2e
```



# Contributing to FormFx

Thank you for considering contributing to FormFx!

## Development Setup

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Build in watch mode**: `npm run dev`
4. **Run tests**: `npm test`

## Pull Request Guidelines

- Ensure all tests pass.
- Add tests for new features or bug fixes.
- Follow Semantic Versioning (SemVer).
- Update `CHANGELOG.md` with your changes.

---

# Contributor License Agreement (CLA)

By contributing to this project (via Pull Requests, Issues, or code submissions), you agree to the following terms:

1. **Grant of License**: You grant the project owner (https://monou.jp/) a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable license to use, reproduce, prepare derivative works of, publicly display, sublicense, and distribute your contributions, including integration into closed-source/commercial products.
2. **Waiver of Moral Rights**: You agree not to assert any moral rights (including the right of attribution and the right of integrity) against the project owner, its successors, or licensees regarding your contributions. This is to ensure smooth future integration, modification, and potential commercial distribution of the software.
3. **Future License Changes**: You acknowledge and agree that the project owner may change the license of this project in the future (e.g., to a commercial license, dual-licensing, or a proprietary license) at their sole discretion.
4. **Representation of Ownership**: You represent that your contribution is your original creation and does not infringe upon any third-party intellectual property rights.