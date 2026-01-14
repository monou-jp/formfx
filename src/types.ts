import { FXValue, JSONRule, EffectType, FormFxOptions, PersistOptions, RuleEditorOptions } from './public-types';

export { FXValue, JSONRule, EffectType, FormFxOptions, PersistOptions, RuleEditorOptions };

export interface Token {
  type: 'IDENTIFIER' | 'NUMBER' | 'STRING' | 'BOOLEAN' | 'OPERATOR' | 'PAREN' | 'COMMA' | 'BRACKET';
  value: string;
}

export type ASTNode =
  | { type: 'Literal'; value: FXValue }
  | { type: 'Identifier'; name: string }
  | { type: 'BinaryExpression'; operator: string; left: ASTNode; right: ASTNode }
  | { type: 'LogicalExpression'; operator: '&&' | '||'; left: ASTNode; right: ASTNode }
  | { type: 'UnaryExpression'; operator: '!'; argument: ASTNode }
  | { type: 'CallExpression'; callee: string; arguments: ASTNode[] }
  | { type: 'ArrayExpression'; elements: ASTNode[] };

export interface Rule {
  id?: string;
  element: HTMLElement;
  type: EffectType;
  expression: string;
  ast: ASTNode;
  clearOnHide?: boolean;
  lastResult?: boolean; // clear効果などの状態変化検知用
  disabled?: boolean; // ルールの有効/無効
  source: 'attribute' | 'json';
  rawRule?: JSONRule; // デバッグ用
}

export interface DebugInfo {
  rule: Rule;
  result: boolean | 'error';
  error?: string;
  elements: HTMLElement[];
}

export interface EvaluationContext {
  global: Record<string, FXValue>;
  row?: Record<string, FXValue>;
  functions: Record<string, (...args: any[]) => FXValue>;
}

export interface RepeaterConfig {
  container: HTMLElement;
  name: string;
  max: number;
  addButton: HTMLElement | null;
  listContainer: HTMLElement;
  template: HTMLTemplateElement;
}
