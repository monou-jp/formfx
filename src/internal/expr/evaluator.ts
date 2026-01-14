import { ASTNode, FXValue, EvaluationContext } from '../types';

export function evaluate(node: ASTNode, context: EvaluationContext): FXValue {
  switch (node.type) {
    case 'Literal':
      return node.value;

    case 'Identifier': {
      if (node.name.startsWith('@row.')) {
        const fieldName = node.name.substring(5);
        return context.row && context.row[fieldName] !== undefined ? context.row[fieldName] : null;
      }
      return context.global[node.name] !== undefined ? context.global[node.name] : null;
    }

    case 'UnaryExpression':
      if (node.operator === '!') {
        return !evaluate(node.argument, context);
      }
      throw new Error(`Unknown unary operator: ${node.operator}`);

    case 'BinaryExpression': {
      const left = evaluate(node.left, context);
      const right = evaluate(node.right, context);
      if (node.operator === '==') return left == right;
      if (node.operator === '!=') return left != right;
      if (node.operator === '>') return (left as any) > (right as any);
      if (node.operator === '>=') return (left as any) >= (right as any);
      if (node.operator === '<') return (left as any) < (right as any);
      if (node.operator === '<=') return (left as any) <= (right as any);
      if (node.operator === '+') return (left as any) + (right as any);
      if (node.operator === '-') return (left as any) - (right as any);
      if (node.operator === '*') return (left as any) * (right as any);
      if (node.operator === '/') return (left as any) / (right as any);
      if (node.operator === '%') return (left as any) % (right as any);
      throw new Error(`Unknown binary operator: ${node.operator}`);
    }

    case 'LogicalExpression': {
      const left = evaluate(node.left, context);
      if (node.operator === '&&') {
        return left && evaluate(node.right, context);
      }
      if (node.operator === '||') {
        return left || evaluate(node.right, context);
      }
      throw new Error(`Unknown logical operator: ${node.operator}`);
    }

    case 'CallExpression': {
      const func = context.functions[node.callee];
      if (!func) {
        throw new Error(`Unknown function: ${node.callee}`);
      }
      const args = node.arguments.map(arg => evaluate(arg, context));
      return func(...args);
    }

    case 'ArrayExpression': {
      return node.elements.map(el => evaluate(el, context));
    }

    default:
      throw new Error(`Unknown AST node type: ${(node as any).type}`);
  }
}
