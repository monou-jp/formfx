# FormFx

Powerful, lightweight, and declarative form control library.

FormFx allows you to manage dynamic form behaviors (show/hide, enable/disable, validation) using simple data attributes or JSON rules, without writing complex JavaScript or relying on heavy frameworks.

## Why FormFx?

- **Better Maintenance**: Avoid jQuery/Vanilla JS spaghetti code.
- **Lightweight**: Minimal overhead compared to full-blown form engines.
- **Declarative**: Logic is co-located with HTML using `data-fx-*` attributes.
- **Safe**: No `eval()` or `new Function()`. Expressions are evaluated safely.
- **Framework Agnostic**: Works everywhere.

## Install

```bash
npm install formfx
```

Or via CDN:
```html
<script src="https://unpkg.com/formfx/dist/index.js"></script>
```

## Quick Start (Attributes)

Just define rules in your HTML using data attributes.

```html
<form id="my-form">
  <input type="checkbox" id="toggle" name="toggle">
  
  <div data-fx-show="toggle == true">
    <p>This is only visible when the checkbox is checked.</p>
    <input type="text" name="optional_field" data-fx-required="toggle == true">
  </div>
</form>

<script type="module">
  import { FormFx } from 'formfx';
  const fx = new FormFx(document.getElementById('my-form'));
  fx.mount();
</script>
```

## JSON Rules (Advanced)

For more complex logic or when you want to keep HTML clean. JSON rules take precedence over attributes.

```javascript
const fx = new FormFx(form, {
  rules: [
    {
      if: "total > 1000",
      then: [
        { show: "#discount-section" },
        { required: "#coupon-code" }
      ]
    }
  ]
});
```

## Repeater

Handle dynamic rows with ease.

```html
<div data-fx-repeater="items" data-fx-min="1" data-fx-max="5">
  <div data-fx-list>
    <template>
      <div data-fx-item>
        <input type="text" data-fx-field="name">
        <button type="button" data-fx-remove-btn>Remove</button>
      </div>
    </template>
  </div>
  <button type="button" data-fx-add-btn>Add Item</button>
</div>
```

### Row Context (`@row.field`)

Refer to fields within the same repeater row.

```html
<input type="number" data-fx-field="price">
<div data-fx-show="@row.price > 100">Expensive item!</div>
```

## Persistence

Automatically save and restore form rules state.

```javascript
const fx = new FormFx(form, {
  persist: {
    key: 'my-form-settings',
    storage: 'localStorage'
  }
});
```

## Rule Editor (Optional Add-on)

A visual editor for your form rules.

```javascript
import { FormFx } from 'formfx';
// Import editor separately to keep main bundle small
import { RuleEditor } from 'formfx/editor';
import 'formfx/editor.css';

const fx = new FormFx(form);
fx.mount();

const editor = new RuleEditor(fx, {
  mount: document.getElementById('editor-container'),
  mode: 'json'
});
editor.mount();
```

## Debug Panel

Visual debug information for development.

```javascript
const fx = new FormFx(form, { debug: true });
```

## API Reference

### `FormFxOptions`
- `disableOnHide`: Boolean (default `true`)
- `clearOnHide`: Boolean (default `false`)
- `rules`: `JSONRule[]`
- `persist`: `PersistOptions`
- `debug`: Boolean

### `FormFx` Methods
- `mount()`: Initialize listeners and observers.
- `destroy()`: Cleanup everything (removes listeners and observers).
- `pause()` / `resume()`: Pause or resume rule evaluation.
- `reEvaluate()`: Manually trigger evaluation.
- `exportRules()`: Get current JSON rules.
- `importRules(rules)`: Load new JSON rules.
- `enableRule(ruleId)` / `disableRule(ruleId)`: Control JSON rules by ID.

## Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- No `eval()` used. Safe for strict CSP environments.

## Security

- Custom tokenizer and parser ensure expressions are only allowed to perform specific safe operations.
- No access to global objects like `window` or `document` from within expressions.

## Roadmap

- **v1.1**: Async function support in expressions.
- **v2.0**: Plugin system for custom effects.

## License

This project is licensed under the BSD 3-Clause License - see the [LICENSE](LICENSE) file for details.

### Note for Contributors
By contributing to this repository, you agree to the terms of our Contributor License Agreement (CLA), which includes the waiver of moral rights and allows for future re-licensing or commercial use by the project owner.