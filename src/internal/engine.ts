import { ASTNode, DebugInfo, EffectType, EvaluationContext, FormFxOptions, FXValue, JSONEffect, JSONRule, Rule } from '../types';
import { applyClear, applyDisabled, applyRequired, applyShow } from './dom/effects';
import { findById } from './dom/select';
import { getInputValue } from './dom/value';
import { evaluate } from './expr/evaluator';
import { parse } from './expr/parser';
import { tokenize } from './expr/tokenizer';

export function createRules(formElement: HTMLElement, options: FormFxOptions = {}): Rule[] {
  const rules: Rule[] = [];
  
  // 1. attributes ルール
  const attributeTypes: EffectType[] = ['show', 'required', 'disabled', 'enable', 'clear'];

  attributeTypes.forEach(type => {
    const attrName = `data-fx-${type}`;
    const elements = formElement.querySelectorAll<HTMLElement>(`[${attrName}]`);
    
    elements.forEach(el => {
      const expression = el.getAttribute(attrName) || '';
      try {
        const tokens = tokenize(expression);
        const ast = parse(tokens);
        rules.push({
          element: el,
          type,
          expression,
          ast,
          source: 'attribute'
        });
      } catch (e) {
        console.warn(`[FormFx] Failed to parse expression "${expression}" for ${attrName}:`, e);
      }
    });
  });

  // 2. JSON rules
  if (options.rules) {
    options.rules.forEach(jsonRule => {
      try {
        const tokens = tokenize(jsonRule.if);
        const ast = parse(tokens);
        
        const addEffectRules = (effects: JSONEffect[], isElse: boolean) => {
          effects.forEach(effect => {
            Object.entries(effect).forEach(([key, selector]) => {
              if (typeof selector !== 'string' || !selector) return;
              let type = (key === 'require' ? 'required' : key) as EffectType;
              let expression = jsonRule.if;
              let finalAst = ast;

              if (type === 'hide') {
                type = 'show';
                finalAst = { type: 'UnaryExpression', operator: '!', argument: ast };
                expression = `!(${jsonRule.if})`;
              }

              if (isElse) {
                finalAst = { type: 'UnaryExpression', operator: '!', argument: finalAst };
                expression = `!(${expression})`;
              }

              const elements = formElement.querySelectorAll(selector);
              elements.forEach(node => {
                const el = node as HTMLElement;
                rules.push({
                  id: jsonRule.id,
                  element: el,
                  type,
                  expression,
                  ast: finalAst,
                  source: 'json',
                  rawRule: jsonRule,
                  disabled: jsonRule.disabled // v0.4
                });
              });
            });
          });
        };

        addEffectRules(jsonRule.then, false);
        if (jsonRule.else) {
          addEffectRules(jsonRule.else, true);
        }
      } catch (e) {
        console.warn(`[FormFx] Failed to parse JSON rule:`, jsonRule, e);
      }
    });
  }

  return rules;
}

/**
 * 依存しているフィールド（#id または @row.field）をASTから抽出する
 */
export function getDependencies(ast: ASTNode): { global: string[], row: string[] } {
  const global = new Set<string>();
  const row = new Set<string>();
  
  function traverse(node: ASTNode) {
    if (node.type === 'Identifier') {
      if (node.name.startsWith('@row.')) {
        row.add(node.name.substring(5));
      } else {
        global.add(node.name);
      }
    } else if (node.type === 'BinaryExpression' || node.type === 'LogicalExpression') {
      traverse(node.left);
      traverse(node.right);
    } else if (node.type === 'UnaryExpression') {
      traverse(node.argument);
    } else if (node.type === 'CallExpression') {
      node.arguments.forEach(traverse);
    } else if (node.type === 'ArrayExpression') {
      node.elements.forEach(traverse);
    }
  }
  
  traverse(ast);
  return {
    global: Array.from(global),
    row: Array.from(row)
  };
}

const BUILTIN_FUNCTIONS: Record<string, (...args: any[]) => FXValue> = {
  in: (val, list) => {
    if (!Array.isArray(list)) return false;
    return list.includes(val);
  },
  contains: (val, sub) => {
    if (typeof val !== 'string') return false;
    return val.includes(sub);
  }
};

export function runRules(formElement: HTMLElement, rules: Rule[], options: FormFxOptions): DebugInfo[] {
  const debugInfos: DebugInfo[] = [];
  // コンテキスト（値の辞書）を作成
  const globalContext: Record<string, FXValue> = {};
  
  // キャッシュして効率化することも考えられるが、まずは全ルール評価
  const allGlobalDeps = new Set<string>();
  rules.forEach(rule => {
    getDependencies(rule.ast).global.forEach(id => allGlobalDeps.add(id));
  });

  allGlobalDeps.forEach(id => {
    const el = findById(formElement, id);
    if (el) {
      globalContext[id] = getInputValue(el);
    } else {
      globalContext[id] = null;
    }
  });

  const baseEvalContext: EvaluationContext = {
    global: globalContext,
    functions: BUILTIN_FUNCTIONS
  };

  // 各ルールを評価して適用
  const elementToTypeToSource = new Map<HTMLElement, Map<EffectType, 'attribute' | 'json'>>();
  rules.forEach(rule => {
    if (!elementToTypeToSource.has(rule.element)) {
      elementToTypeToSource.set(rule.element, new Map());
    }
    const types = elementToTypeToSource.get(rule.element)!;
    // JSONが後にあるので、JSONがあれば上書きされる
    types.set(rule.type, rule.source);
  });

  rules.forEach(rule => {
    if (rule.disabled) return;

    // Determine if this rule should be skipped because a JSON rule for the same element and type exists.
    // JSON rules (added later in createRules) take precedence over attribute rules.
    if (rule.source === 'attribute') {
      const winner = elementToTypeToSource.get(rule.element)?.get(rule.type);
      if (winner === 'json') return;
    }

    try {
      // row context の構築
      let rowContext: Record<string, FXValue> | undefined = undefined;
      const rowItem = rule.element.closest('[data-fx-item]');
      if (rowItem) {
        rowContext = {};
        const deps = getDependencies(rule.ast);
        deps.row.forEach(fieldName => {
          const fieldEl = rowItem.querySelector(`[data-fx-field="${fieldName}"]`);
          if (fieldEl) {
            // フィールド内の実際の入力要素を取得
            const input = fieldEl.querySelector('input, select, textarea') as HTMLElement;
            rowContext![fieldName] = input ? getInputValue(input) : null;
          } else {
            rowContext![fieldName] = null;
          }
        });
      }

      const evalContext: EvaluationContext = {
        ...baseEvalContext,
        row: rowContext
      };

      const result = evaluate(rule.ast, evalContext);
      const boolResult = !!result;

      if (options.debug) {
        debugInfos.push({
          rule,
          result: boolResult,
          elements: [rule.element]
        });
        console.debug(`[FormFx Debug] Rule: ${rule.type}="${rule.expression}" (source: ${rule.source}, result: ${boolResult})`, {
          element: rule.element,
          result: boolResult,
          context: evalContext
        });
      }

      switch (rule.type) {
        case 'show':
          applyShow(rule.element, boolResult, options);
          break;
        case 'required':
          applyRequired(rule.element, boolResult);
          break;
        case 'disabled':
          applyDisabled(rule.element, boolResult);
          break;
        case 'enable':
          applyDisabled(rule.element, !boolResult);
          break;
        case 'clear':
          // 変化した瞬間（false -> true）のみクリア
          if (boolResult && rule.lastResult === false) {
            applyClear(rule.element);
          }
          break;
      }
      
      rule.lastResult = boolResult;

    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      if (options.debug) {
        debugInfos.push({
          rule,
          result: 'error',
          error: errorMsg,
          elements: [rule.element]
        });
        console.warn(`[FormFx Debug] Evaluation failed: "${rule.expression}"`, e);
      } else {
        console.warn(`[FormFx] Failed to evaluate expression "${rule.expression}":`, e);
      }
    }
  });

  return debugInfos;
}
