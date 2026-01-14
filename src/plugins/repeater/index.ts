import { RepeaterConfig } from '../../types';

export function setupRepeaters(
  formElement: HTMLElement,
  onUpdate: () => void
): () => void {
  const repeaterElements = formElement.querySelectorAll<HTMLElement>('[data-fx-repeater]');
  const cleanups: (() => void)[] = [];

  repeaterElements.forEach(container => {
    const config: RepeaterConfig = {
      container,
      name: container.getAttribute('data-fx-name') || '',
      max: parseInt(container.getAttribute('data-fx-max') || '10', 10),
      addButton: container.querySelector<HTMLElement>('[data-fx-add]'),
      listContainer: container.querySelector<HTMLElement>('[data-fx-list]') || container,
      template: container.querySelector<HTMLTemplateElement>('template[data-fx-template]')!
    };

    if (!config.template) {
      console.warn('[FormFx] Repeater template not found', container);
      return;
    }

    const handleAdd = () => {
      const items = config.listContainer.querySelectorAll('[data-fx-item]');
      if (items.length < config.max) {
        addItem(config);
        reindex(config);
        onUpdate();
      }
    };

    if (config.addButton) {
      config.addButton.addEventListener('click', handleAdd);
      cleanups.push(() => config.addButton?.removeEventListener('click', handleAdd));
    }

    // 既存のアイテムに対してもイベント設定とリインデックスが必要
    const handleListClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-fx-remove]')) {
        const item = target.closest('[data-fx-item]');
        if (item) {
          item.remove();
          reindex(config);
          onUpdate();
        }
      }
    };

    config.listContainer.addEventListener('click', handleListClick);
    cleanups.push(() => config.listContainer.removeEventListener('click', handleListClick));

    // 初期化時に一度リインデックス
    reindex(config);
  });

  return () => cleanups.forEach(c => c());
}

function addItem(config: RepeaterConfig) {
  const content = config.template.content.cloneNode(true) as DocumentFragment;
  const item = content.querySelector('[data-fx-item]');
  if (item) {
    config.listContainer.appendChild(item);
  }
}

function reindex(config: RepeaterConfig) {
  const items = config.listContainer.querySelectorAll<HTMLElement>('[data-fx-item]');
  items.forEach((item, index) => {
    // data-fx-index 属性を付与（デバッグや特定用途向け）
    item.setAttribute('data-fx-index', index.toString());

    const fields = item.querySelectorAll<HTMLElement>('[data-fx-field]');
    fields.forEach(field => {
      const fieldName = field.getAttribute('data-fx-field');
      if (fieldName) {
        const inputs = field.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea');
        inputs.forEach(input => {
          input.name = `${config.name}[${index}].${fieldName}`;
          // 行内参照を容易にするため、input自体にも field 名を保持させることがあるが、
          // 今回は closest('[data-fx-field]') で解決する設計とした。
        });
      }
    });
  });

  // 追加ボタンの表示/非表示制御（任意だが親切）
  if (config.addButton) {
    if (items.length >= config.max) {
      config.addButton.style.display = 'none';
    } else {
      config.addButton.style.display = '';
    }
  }
}
