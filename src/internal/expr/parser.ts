import { ASTNode, Token } from '../../types';

/**
 * 簡易的な再帰下降構文解析器
 * 優先順位:
 * 1. Primary (Identifier, Literal, Parentheses)
 * 2. Unary (!)
 * 3. Comparison (==, !=)
 * 4. Logical AND (&&)
 * 5. Logical OR (||)
 */
export function parse(tokens: Token[]): ASTNode {
  let current = 0;

  function walk(): ASTNode {
    return parseLogicalOr();
  }

  function parseLogicalOr(): ASTNode {
    let node = parseLogicalAnd();
    while (current < tokens.length && tokens[current].value === '||') {
      const operator = tokens[current].value as '||';
      current++;
      const right = parseLogicalAnd();
      node = { type: 'LogicalExpression', operator, left: node, right };
    }
    return node;
  }

  function parseLogicalAnd(): ASTNode {
    let node = parseComparison();
    while (current < tokens.length && tokens[current].value === '&&') {
      const operator = tokens[current].value as '&&';
      current++;
      const right = parseComparison();
      node = { type: 'LogicalExpression', operator, left: node, right };
    }
    return node;
  }

  function parseComparison(): ASTNode {
    let node = parseAdditive();
    const comparisonOps = ['==', '!=', '>', '>=', '<', '<='];
    while (current < tokens.length && comparisonOps.includes(tokens[current].value)) {
      const operator = tokens[current].value;
      current++;
      const right = parseAdditive();
      node = { type: 'BinaryExpression', operator, left: node, right };
    }
    return node;
  }

  function parseAdditive(): ASTNode {
    let node = parseMultiplicative();
    while (current < tokens.length && (tokens[current].value === '+' || tokens[current].value === '-')) {
      const operator = tokens[current].value;
      current++;
      const right = parseMultiplicative();
      node = { type: 'BinaryExpression', operator, left: node, right };
    }
    return node;
  }

  function parseMultiplicative(): ASTNode {
    let node = parseUnary();
    while (current < tokens.length && (tokens[current].value === '*' || tokens[current].value === '/' || tokens[current].value === '%')) {
      const operator = tokens[current].value;
      current++;
      const right = parseUnary();
      node = { type: 'BinaryExpression', operator, left: node, right };
    }
    return node;
  }

  function parseUnary(): ASTNode {
    if (current < tokens.length && tokens[current].value === '!') {
      current++;
      return { type: 'UnaryExpression', operator: '!', argument: parseUnary() };
    }
    return parsePrimary();
  }

  function parsePrimary(): ASTNode {
    const token = tokens[current];

    if (token.type === 'PAREN' && token.value === '(') {
      current++;
      const node = walk();
      if (tokens[current]?.value !== ')') {
        throw new Error('Expected )');
      }
      current++;
      return node;
    }

    if (token.type === 'IDENTIFIER') {
      current++;
      // 関数呼び出しのチェック: id(arg1, arg2)
      if (current < tokens.length && tokens[current].type === 'PAREN' && tokens[current].value === '(') {
        current++; // skip (
        const args: ASTNode[] = [];
        if (!(tokens[current].type === 'PAREN' && tokens[current].value === ')')) {
          while (true) {
            args.push(walk());
            if (tokens[current].type === 'COMMA') {
              current++;
              continue;
            }
            if (tokens[current].type === 'PAREN' && tokens[current].value === ')') {
              break;
            }
            throw new Error(`Expected , or ) in function call "${token.value}"`);
          }
        }
        current++; // skip )
        return { type: 'CallExpression', callee: token.value, arguments: args };
      }
      return { type: 'Identifier', name: token.value };
    }

    if (token.type === 'BRACKET' && token.value === '[') {
      current++; // skip [
      const elements: ASTNode[] = [];
      if (!(tokens[current].type === 'BRACKET' && tokens[current].value === ']')) {
        while (true) {
          elements.push(walk());
          if (tokens[current].type === 'COMMA') {
            current++;
            continue;
          }
          if (tokens[current].type === 'BRACKET' && tokens[current].value === ']') {
            break;
          }
          throw new Error('Expected , or ] in array literal');
        }
      }
      current++; // skip ]
      return { type: 'ArrayExpression', elements };
    }

    if (token.type === 'NUMBER') {
      current++;
      return { type: 'Literal', value: parseFloat(token.value) };
    }

    if (token.type === 'STRING') {
      current++;
      return { type: 'Literal', value: token.value };
    }

    if (token.type === 'BOOLEAN') {
      current++;
      return { type: 'Literal', value: token.value === 'true' };
    }

    throw new Error(`Unexpected token: ${token.value}`);
  }

  return walk();
}
