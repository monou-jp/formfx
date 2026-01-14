import { FormFxOptions } from '../../types';
import { clearValue, setDisabled } from './value';

export function applyShow(el: HTMLElement, show: boolean, options: FormFxOptions): void {
  const isCurrentlyVisible = el.style.display !== 'none';
  
  if (show) {
    el.style.display = el.dataset.fxOriginalDisplay || '';
    // 再表示されたときに disabled を解除するかどうかは要件にないが、
    // disableOnHide=true の場合は対称性を持たせるのが一般的
    if (options.disableOnHide && !isCurrentlyVisible) {
      setDisabled(el, false);
    }
  } else {
    if (isCurrentlyVisible && !el.dataset.fxOriginalDisplay) {
      el.dataset.fxOriginalDisplay = el.style.display;
    }
    el.style.display = 'none';
    
    // 非表示になったときの追加処理
    if (isCurrentlyVisible) {
      if (el.dataset.fxClearOnHide === 'true' || options.clearOnHide) {
        clearValue(el);
      }
      if (options.disableOnHide) {
        setDisabled(el, true);
      }
    }
  }
}

export function applyRequired(el: HTMLElement, required: boolean): void {
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    el.required = required;
  } else {
    // コンテナの場合、配下の全ての入力要素に適用
    const inputs = el.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      (input as HTMLInputElement).required = required;
    });
  }
}

export function applyDisabled(el: HTMLElement, disabled: boolean): void {
  setDisabled(el, disabled);
}

export function applyClear(el: HTMLElement): void {
  clearValue(el);
}
