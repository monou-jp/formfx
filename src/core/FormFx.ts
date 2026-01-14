import { FormFxOptions, Rule, JSONRule, RuleEditorOptions } from '../types';
import { createRules, runRules, getDependencies } from '../internal/engine';
import { setupEventListener, setupMutationObserver } from '../internal/observe';
import { setupRepeaters } from '../plugins/repeater';
import { DebugPanel } from '../internal/debug/panel';

export class FormFx {
  private rules: Rule[] = [];
  private options: FormFxOptions;
  private cleanupEvents: (() => void) | null = null;
  private cleanupRepeaters: (() => void) | null = null;
  private observer: MutationObserver | null = null;
  private debugPanel: DebugPanel | null = null;
  private isPaused = false;

  constructor(private formElement: HTMLElement, options: FormFxOptions = {}) {
    this.options = {
      disableOnHide: true,
      clearOnHide: false,
      ...options
    };

    // 永続化データの読み込み (JSON rulesのみ)
    this.loadPersistedRules();
  }

  mount(): void {
    // 0. Debug Panel の初期化
    if (this.options.debug) {
      this.debugPanel = new DebugPanel();
      if (this.options.persist) {
        this.debugPanel.setPersistInfo(this.options.persist);
      }
    }

    // 1. ルールの初回収集
    this.refreshRules();

    // 2. リピーターの初期化
    this.cleanupRepeaters = setupRepeaters(this.formElement, () => {
      // DOMが変化した後にルールを再収集して評価
      this.refreshRules();
      this.setupEvents(); // 依存フィールドが変わる可能性があるため再設定
      this.evaluate();
    });

    // 3. イベントリスナーの設定
    this.setupEvents();

    // 4. MutationObserverの設定（動的な属性追加などに対応）
    this.observer = setupMutationObserver(this.formElement, () => {
      this.refreshRules();
      this.setupEvents();
      this.evaluate();
    });

    // 5. 初回評価
    this.evaluate();
  }

  reEvaluate(): void {
    this.evaluate();
  }

  private setupEvents(): void {
    if (this.cleanupEvents) this.cleanupEvents();

    const dependentIds = new Set<string>();
    this.rules.forEach(rule => {
      getDependencies(rule.ast).global.forEach(id => {
        // IDだけでなくnameでも参照される可能性があるため、基本的には広めに監視する
        dependentIds.add(id);
      });
    });

    this.cleanupEvents = setupEventListener(this.formElement, () => {
      this.evaluate();
    }, Array.from(dependentIds));
  }

  private refreshRules(): void {
    // attributes ルールと JSON ルールの両方を収集
    // JSON rules が優先されるように後でマージするが、
    // createRules 内で JSON rules は後に追加されるように実装済み
    this.rules = createRules(this.formElement, this.options);
  }

  private evaluate(): void {
    if (this.isPaused) return;

    const debugInfos = runRules(this.formElement, this.rules, this.options);
    if (this.debugPanel) {
      this.debugPanel.update(debugInfos);
    }
  }

  /**
   * ルール評価を一時停止する (v0.4)
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * ルール評価を再開する (v0.4)
   */
  resume(): void {
    this.isPaused = false;
    this.evaluate();
  }

  /**
   * JSONルールをエクスポートする (v0.4)
   */
  exportRules(): JSONRule[] {
    return this.options.rules || [];
  }

  /**
   * JSONルールをインポートする (v0.4)
   */
  importRules(rules: JSONRule[]): void {
    this.options.rules = rules;
    this.savePersistedRules();
    this.refreshRules();
    this.setupEvents();
    this.evaluate();
  }

  /**
   * Rule Editor を有効化する (v0.4)
   */
  async enableRuleEditor(options: RuleEditorOptions): Promise<void> {
    const { RuleEditor } = await import('../editor/RuleEditor');
    const editor = new RuleEditor(this, options);
    editor.mount();
  }

  private loadPersistedRules(): void {
    const { persist } = this.options;
    if (!persist) return;

    try {
      const storage = persist.storage === 'localStorage' ? localStorage : sessionStorage;
      const data = storage.getItem(persist.key);
      if (data) {
        this.options.rules = JSON.parse(data);
      }
    } catch (e) {
      console.error('[FormFx] Failed to load persisted rules:', e);
    }
  }

  private savePersistedRules(): void {
    const { persist, rules } = this.options;
    if (!persist || !rules) return;

    try {
      const storage = persist.storage === 'localStorage' ? localStorage : sessionStorage;
      storage.setItem(persist.key, JSON.stringify(rules));
    } catch (e) {
      console.error('[FormFx] Failed to save rules:', e);
    }
  }

  /**
   * JSONルールを有効化する
   * @param ruleId 
   */
  enableRule(ruleId: string): void {
    this.rules.forEach(r => {
      if (r.id === ruleId && r.source === 'json') {
        r.disabled = false;
      }
    });
    if (this.options.rules) {
      this.options.rules.forEach(r => {
        if (r.id === ruleId) r.disabled = false;
      });
      this.savePersistedRules();
    }
    this.evaluate();
  }

  /**
   * JSONルールを無効化する
   * @param ruleId 
   */
  disableRule(ruleId: string): void {
    this.rules.forEach(r => {
      if (r.id === ruleId && r.source === 'json') {
        r.disabled = true;
      }
    });
    if (this.options.rules) {
      this.options.rules.forEach(r => {
        if (r.id === ruleId) r.disabled = true;
      });
      this.savePersistedRules();
    }
    this.evaluate();
  }

  destroy(): void {
    if (this.cleanupEvents) this.cleanupEvents();
    if (this.cleanupRepeaters) this.cleanupRepeaters();
    if (this.observer) this.observer.disconnect();
    if (this.debugPanel) this.debugPanel.destroy();
    
    // イベントリスナーの再解除を確実にするため
    this.cleanupEvents = null;
    this.cleanupRepeaters = null;
    this.observer = null;
    this.debugPanel = null;

    // 適用されたスタイルや属性をリセットしたい場合があるが、
    // 基本的には「監視を止める」のが destroy の責務
    this.rules = [];
  }
}
