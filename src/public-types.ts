/**
 * FormFx Public Types
 * v1.0
 */

export interface FormFxOptions {
  /**
   * 非表示になったとき、内部の入力値をdisabledにするかどうか
   * @default true
   */
  disableOnHide?: boolean;
  /**
   * 非表示になったとき、内部の入力値をクリアするかどうか
   * @default false
   */
  clearOnHide?: boolean;
  /**
   * デバッグモード
   * @default false
   */
  debug?: boolean;
  /**
   * JSON形式のルール定義
   */
  rules?: JSONRule[];
  /**
   * ルールの永続化設定 (v0.4)
   */
  persist?: PersistOptions;
}

/**
 * 永続化オプション (v0.4)
 */
export interface PersistOptions {
  key: string;
  storage: 'localStorage' | 'sessionStorage';
}

/**
 * Rule Editor 設定 (v0.4)
 */
export interface RuleEditorOptions {
  mount: HTMLElement;
  mode: 'json' | 'attributes';
}

export type FXValue = string | number | boolean | null | FXValue[];

export type EffectType = 'show' | 'hide' | 'required' | 'disabled' | 'enable' | 'clear';

export interface JSONEffect {
  show?: string;
  hide?: string;
  require?: string;
  required?: string; // alias
  disabled?: string;
  enable?: string;
  clear?: string;
}

export interface JSONRule {
  id?: string;
  if: string;
  then: JSONEffect[];
  else?: JSONEffect[];
  disabled?: boolean; // v0.4
}

/**
 * 外部公開用のデバッグ情報
 */
export interface FormFxDebugInfo {
  ruleId?: string;
  type: EffectType;
  expression: string;
  result: boolean | 'error';
  error?: string;
  element: HTMLElement;
}
