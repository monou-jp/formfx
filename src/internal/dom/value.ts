import { FXValue } from '../../types';

export function getInputValue(el: HTMLElement): FXValue {
  if (el instanceof HTMLInputElement) {
    if (el.type === 'checkbox') {
      return el.checked;
    }
    if (el.type === 'radio') {
      // ラジオボタンの場合は、同じnameを持つチェックされている要素を探す
      if (el.name) {
        const form = el.closest('form') || document;
        const checked = form.querySelector(`input[name="${el.name}"]:checked`) as HTMLInputElement;
        return checked ? checked.value : null;
      }
      return el.checked ? el.value : null;
    }
    if (el.type === 'number' || el.type === 'range') {
      return el.value === '' ? null : Number(el.value);
    }
    return el.value;
  }
  
  if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    return el.value;
  }

  return null;
}

export function clearValue(el: HTMLElement): void {
  if (el instanceof HTMLInputElement) {
    if (el.type === 'checkbox' || el.type === 'radio') {
      el.checked = false;
    } else {
      el.value = '';
    }
  } else if (el instanceof HTMLSelectElement) {
    el.selectedIndex = -1;
    el.value = '';
  } else if (el instanceof HTMLTextAreaElement) {
    el.value = '';
  } else {
    // コンテナの場合は配下の要素をクリア
    const inputs = el.querySelectorAll('input, select, textarea');
    inputs.forEach(input => clearValue(input as HTMLElement));
  }
}

export function setDisabled(el: HTMLElement, disabled: boolean): void {
  if ('disabled' in el) {
    (el as any).disabled = disabled;
  } else {
    // コンテナの場合は配下の要素を制御
    const inputs = el.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      (input as HTMLInputElement).disabled = disabled;
    });
  }
}
