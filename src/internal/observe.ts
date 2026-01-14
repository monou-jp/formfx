export function setupEventListener(
  formElement: HTMLElement,
  callback: () => void,
  dependentIds: string[]
): () => void {
  const handler = () => {
    callback();
  };

  // 依存フィールド単位での監視
  // ※ 動的に要素が追加される場合は MutationObserver がカバーする
  const cleanups: (() => void)[] = [];

  // 全体を監視しつつ、特定要素へのリスナーも検討可能だが、
  // シンプルさと確実性のために formElement への委譲を維持しつつ、
  // 将来的にはここで絞り込みを行う。
  // v0.2では「参照されているフィールドのみ」を意識した設計にする。
  
  formElement.addEventListener('input', handler);
  formElement.addEventListener('change', handler);

  return () => {
    formElement.removeEventListener('input', handler);
    formElement.removeEventListener('change', handler);
  };
}

export function setupMutationObserver(
  formElement: HTMLElement,
  callback: () => void
): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
        shouldUpdate = true;
        break;
      }
    }
    
    if (shouldUpdate) {
      callback();
    }
  });

  observer.observe(formElement, {
    childList: true,
    subtree: true
  });

  return observer;
}
