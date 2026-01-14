import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FormFx } from '../../src/core/FormFx';

describe('FormFx Integration', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('handles basic show/hide and required attributes', () => {
    container.innerHTML = `
      <form id="myform">
        <input type="checkbox" id="toggle" name="toggle">
        <div id="target" data-fx-show="toggle == true" data-fx-required="toggle == true">
          <input type="text" id="input" name="input">
        </div>
      </form>
    `;

    const form = container.querySelector('#myform') as HTMLFormElement;
    const fx = new FormFx(form);
    fx.mount();

    const toggle = container.querySelector('#toggle') as HTMLInputElement;
    const target = container.querySelector('#target') as HTMLDivElement;
    const input = container.querySelector('#input') as HTMLInputElement;

    // Initial state (toggle is false)
    expect(target.style.display).toBe('none');
    expect(input.required).toBe(false);

    // Toggle checked
    toggle.checked = true;
    toggle.dispatchEvent(new Event('change', { bubbles: true }));
    
    expect(target.style.display).not.toBe('none');
    expect(input.required).toBe(true);

    // Toggle unchecked
    toggle.checked = false;
    toggle.dispatchEvent(new Event('change', { bubbles: true }));
    
    expect(target.style.display).toBe('none');
    expect(input.required).toBe(false);
    
    fx.destroy();
  });

  it('handles JSON rules and priority', async () => {
    container.innerHTML = `
      <form id="myform">
        <input type="text" id="status" name="status" value="pending">
        <div id="box" data-fx-show="status == 'active'">Box</div>
      </form>
    `;

    const form = container.querySelector('#myform') as HTMLFormElement;
    // JSON rule that overrides or adds to attributes
    const fx = new FormFx(form, {
      debug: true, // Enable debug for logging
      rules: [
        {
          id: 'json-rule',
          if: "status == 'pending'",
          then: [{ show: '#box' }]
        }
      ]
    });
    fx.mount();

    const box = container.querySelector('#box') as HTMLDivElement;
    const statusInput = container.querySelector('#status') as HTMLInputElement;

    // Initial state: status is 'pending'
    // JSON rule (status == 'pending') -> show
    // Attribute rule (status == 'active') -> hidden (but overridden by JSON rule? No, JSON rule for show #box exists, so attribute rule for show #box is skipped)
    expect(box.style.display).not.toBe('none');

    // Change status to 'active'
    statusInput.value = 'active';
    statusInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Evaluate again
    fx.reEvaluate();
    
    // Now status is 'active'
    // JSON rule (status == 'pending') -> false
    // Attribute rule (status == 'active') -> true
    // If JSON rule overrides attribute rule, and JSON rule result is false, box should be hidden.
    // WAIT: Does JSON rule override the WHOLE show effect for the element, or just provide an alternative?
    // Based on my implementation in engine.ts, it overrides.
    // So JSON rule 'status == pending' is the ONLY rule for 'show' on #box.
    // Since 'active' != 'pending', result is false, so it should be hidden.
    
    expect(box.style.display).toBe('none');

    // Change status to 'pending' again
    statusInput.value = 'pending';
    statusInput.dispatchEvent(new Event('input', { bubbles: true }));
    fx.reEvaluate();
    expect(box.style.display).not.toBe('none');

    fx.destroy();
  });

  it('can toggle debug panel visibility with setDebug', () => {
    container.innerHTML = `
      <form id="myform">
        <input type="text" name="test">
      </form>
    `;
    const form = container.querySelector('#myform') as HTMLFormElement;
    const fx = new FormFx(form, { debug: false });
    fx.mount();

    // 最初はデバッグパネルが存在しない
    let panel = document.getElementById('formfx-debug-panel');
    expect(panel).toBeNull();

    // デバッグを有効化
    fx.setDebug(true);
    panel = document.getElementById('formfx-debug-panel');
    expect(panel).not.toBeNull();
    expect(panel?.style.display).not.toBe('none');

    // デバッグを無効化 (hide)
    fx.setDebug(false);
    expect(panel?.style.display).toBe('none');

    // 再度有効化 (show)
    fx.setDebug(true);
    expect(panel?.style.display).toBe('block');

    fx.destroy();
  });
});
