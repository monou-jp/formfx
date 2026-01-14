export function findById(root: HTMLElement, id: string): HTMLElement | null {
  // 1. Try to find by ID
  const el = root.querySelector(`#${id.replace(/([#;?%&,.+*~\':"!^$[\]()=>|/@])/g, '\\$1')}`);
  if (el) return el as HTMLElement;

  // 2. Try to find by name attribute (v1.0 enhancement)
  const byName = root.querySelector(`[name="${id}"]`);
  if (byName) return byName as HTMLElement;
  
  // 3. Try to find by data-fx-id
  return root.querySelector(`[data-fx-id="${id}"]`) as HTMLElement | null;
}

export function findByFxAttr(root: HTMLElement, attr: string): HTMLElement[] {
  return Array.from(root.querySelectorAll(`[${attr}]`));
}
