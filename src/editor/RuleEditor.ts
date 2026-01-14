import { FormFx } from '../core/FormFx';
import { RuleEditorOptions, JSONRule } from '../types';

export class RuleEditor {
  private container: HTMLElement;
  private activeRuleIndex: number | null = null;

  constructor(
    private fx: FormFx,
    private options: RuleEditorOptions
  ) {
    this.container = document.createElement('div');
    this.container.className = 'formfx-editor';
  }

  mount(): void {
    this.options.mount.appendChild(this.container);
    this.render();
  }

  private render(): void {
    const rules = this.fx.exportRules();
    
    this.container.innerHTML = `
      <div class="formfx-editor-header">
        <div class="formfx-editor-title">FormFx Rule Editor</div>
        <div class="formfx-editor-actions">
          <button class="formfx-btn formfx-btn-primary" id="fx-add-rule">+ Add Rule</button>
        </div>
      </div>
      <div class="formfx-editor-body">
        <div class="formfx-rule-list" id="fx-rule-list"></div>
        <div class="formfx-rule-form" id="fx-rule-form"></div>
      </div>
    `;

    this.renderRuleList(rules);
    this.renderRuleForm(rules);

    this.container.querySelector('#fx-add-rule')?.addEventListener('click', () => {
      this.addRule();
    });
  }

  private renderRuleList(rules: JSONRule[]): void {
    const listEl = this.container.querySelector('#fx-rule-list');
    if (!listEl) return;

    listEl.innerHTML = rules.map((rule, index) => `
      <div class="formfx-rule-item ${this.activeRuleIndex === index ? 'active' : ''}" data-index="${index}">
        <div class="formfx-rule-item-id">${rule.id || '(no id)'}</div>
        <div class="formfx-rule-item-expr">if: ${rule.if}</div>
      </div>
    `).join('') || '<div class="formfx-empty-state">No rules defined</div>';

    listEl.querySelectorAll('.formfx-rule-item').forEach(item => {
      item.addEventListener('click', () => {
        this.activeRuleIndex = parseInt(item.getAttribute('data-index') || '0');
        this.render();
      });
    });
  }

  private renderRuleForm(rules: JSONRule[]): void {
    const formEl = this.container.querySelector('#fx-rule-form');
    if (!formEl || this.activeRuleIndex === null || !rules[this.activeRuleIndex]) {
      if (formEl) formEl.innerHTML = '<div class="formfx-empty-state">Select a rule to edit</div>';
      return;
    }

    const rule = rules[this.activeRuleIndex];
    formEl.innerHTML = `
      <div class="formfx-field-group">
        <label class="formfx-label">Rule ID</label>
        <input type="text" class="formfx-input" id="fx-edit-id" value="${rule.id || ''}">
      </div>
      <div class="formfx-field-group">
        <label class="formfx-label">If Condition (DSL)</label>
        <textarea class="formfx-textarea" id="fx-edit-if" rows="3">${rule.if}</textarea>
      </div>
      
      <div class="formfx-field-group">
        <label class="formfx-label">Then Effects</label>
        <div id="fx-then-list"></div>
        <button class="formfx-btn" id="fx-add-then">+ Add Effect</button>
      </div>

      <div class="formfx-field-group">
        <label class="formfx-label">Else Effects (Optional)</label>
        <div id="fx-else-list"></div>
        <button class="formfx-btn" id="fx-add-else">+ Add Effect</button>
      </div>

      <div style="margin-top: 40px; display: flex; justify-content: space-between;">
        <button class="formfx-btn formfx-btn-primary" id="fx-save-rule">Save Changes</button>
        <button class="formfx-btn formfx-btn-danger" id="fx-delete-rule">Delete Rule</button>
      </div>

      <div class="formfx-json-preview">
        <div class="formfx-label">JSON Preview (Readonly)</div>
        <div class="formfx-json-content">${JSON.stringify(rule, null, 2)}</div>
      </div>
    `;

    this.renderEffectList('then', rule.then);
    this.renderEffectList('else', rule.else || []);

    // Events
    formEl.querySelector('#fx-save-rule')?.addEventListener('click', () => this.saveRule());
    formEl.querySelector('#fx-delete-rule')?.addEventListener('click', () => this.deleteRule());
    formEl.querySelector('#fx-add-then')?.addEventListener('click', () => this.addEffect('then'));
    formEl.querySelector('#fx-add-else')?.addEventListener('click', () => this.addEffect('else'));
  }

  private renderEffectList(type: 'then' | 'else', effects: any[]): void {
    const listEl = this.container.querySelector(`#fx-${type}-list`);
    if (!listEl) return;

    listEl.innerHTML = effects.map((eff, i) => {
      const entry = Object.entries(eff)[0] || ['show', ''];
      const effectType = entry[0];
      const selector = entry[1];

      return `
        <div class="formfx-effect-row" data-type="${type}" data-index="${i}">
          <select class="formfx-select fx-effect-type" style="width: 120px;">
            <option value="show" ${effectType === 'show' ? 'selected' : ''}>show</option>
            <option value="hide" ${effectType === 'hide' ? 'selected' : ''}>hide</option>
            <option value="required" ${effectType === 'required' ? 'selected' : ''}>require</option>
            <option value="disabled" ${effectType === 'disabled' ? 'selected' : ''}>disabled</option>
            <option value="enable" ${effectType === 'enable' ? 'selected' : ''}>enable</option>
            <option value="clear" ${effectType === 'clear' ? 'selected' : ''}>clear</option>
          </select>
          <input type="text" class="formfx-input fx-effect-selector" placeholder="#id" value="${selector}">
          <button class="formfx-btn formfx-btn-danger fx-remove-effect">×</button>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.fx-remove-effect').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        effects.splice(i, 1);
        this.renderRuleForm(this.fx.exportRules());
      });
    });
  }

  private addRule(): void {
    const rules = this.fx.exportRules();
    const newRule: JSONRule = {
      id: `rule_${Date.now()}`,
      if: 'true',
      then: [{ show: '' }]
    };
    rules.push(newRule);
    this.activeRuleIndex = rules.length - 1;
    this.fx.importRules(rules);
    this.render();
  }

  private saveRule(): void {
    if (this.activeRuleIndex === null) return;
    
    this.fx.pause(); // 編集適用中は pause

    const rules = this.fx.exportRules();
    const rule = rules[this.activeRuleIndex];

    rule.id = (this.container.querySelector('#fx-edit-id') as HTMLInputElement).value;
    rule.if = (this.container.querySelector('#fx-edit-if') as HTMLTextAreaElement).value;

    const readEffects = (type: 'then' | 'else') => {
      const rows = this.container.querySelectorAll(`.formfx-effect-row[data-type="${type}"]`);
      const effects: any[] = [];
      rows.forEach(row => {
        const effectType = (row.querySelector('.fx-effect-type') as HTMLSelectElement).value;
        const selector = (row.querySelector('.fx-effect-selector') as HTMLInputElement).value;
        const obj: any = {};
        obj[effectType] = selector;
        effects.push(obj);
      });
      return effects;
    };

    rule.then = readEffects('then');
    rule.else = readEffects('else');
    if (rule.else.length === 0) delete rule.else;

    this.fx.importRules(rules);
    this.fx.resume();
    this.render();
  }

  private deleteRule(): void {
    if (this.activeRuleIndex === null || !confirm('Are you sure you want to delete this rule?')) return;
    const rules = this.fx.exportRules();
    rules.splice(this.activeRuleIndex, 1);
    this.activeRuleIndex = null;
    this.fx.importRules(rules);
    this.render();
  }

  private addEffect(type: 'then' | 'else'): void {
    if (this.activeRuleIndex === null) return;
    const rules = this.fx.exportRules();
    const rule = rules[this.activeRuleIndex];
    if (type === 'then') {
      rule.then.push({ show: '' });
    } else {
      rule.else = rule.else || [];
      rule.else.push({ show: '' });
    }
    this.renderRuleForm(rules);
  }
}
