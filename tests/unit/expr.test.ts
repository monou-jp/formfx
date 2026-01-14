import { describe, it, expect } from 'vitest';
import { tokenize } from '../../src/internal/expr/tokenizer';
import { parse } from '../../src/internal/expr/parser';
import { evaluate } from '../../src/internal/expr/evaluator';

describe('Expression Engine', () => {
  const evalExpr = (expr: string, context: any) => {
    const tokens = tokenize(expr);
    const ast = parse(tokens);
    return evaluate(ast, context);
  };

  it('evaluates basic arithmetic and comparison', () => {
    const context = { global: { a: 10, b: 20 }, functions: {} };
    expect(evalExpr('a + b == 30', context)).toBe(true);
    expect(evalExpr('a > 5', context)).toBe(true);
    expect(evalExpr('b < 15', context)).toBe(false);
  });

  it('evaluates logical expressions', () => {
    const context = { global: { a: true, b: false }, functions: {} };
    expect(evalExpr('a && b', context)).toBe(false);
    expect(evalExpr('a || b', context)).toBe(true);
    expect(evalExpr('!b', context)).toBe(true);
  });

  it('handles strings and array contains', () => {
    const context = { 
      global: { 
        status: 'active',
        tags: ['red', 'blue']
      }, 
      functions: {
        contains: (arr: any, val: any) => Array.isArray(arr) && arr.includes(val)
      } 
    };
    expect(evalExpr("status == 'active'", context)).toBe(true);
    expect(evalExpr("contains(tags, 'red')", context)).toBe(true);
    expect(evalExpr("contains(tags, 'green')", context)).toBe(false);
  });

  it('handles row context (@row)', () => {
    const context = { 
      global: { total: 100 },
      row: { price: 50 },
      functions: {} 
    };
    expect(evalExpr('@row.price * 2 == total', context)).toBe(true);
  });
});
