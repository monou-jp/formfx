import { Token } from '../../types';

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let current = 0;

  while (current < input.length) {
    let char = input[current];

    if (/\s/.test(char)) {
      current++;
      continue;
    }

    if (char === '(' || char === ')') {
      tokens.push({ type: 'PAREN', value: char });
      current++;
      continue;
    }

    if (char === '[' || char === ']') {
      tokens.push({ type: 'BRACKET', value: char });
      current++;
      continue;
    }

    if (char === ',') {
      tokens.push({ type: 'COMMA', value: char });
      current++;
      continue;
    }

    if (char === '#' || char === '@') {
      const isRow = char === '@';
      let value = isRow ? '@' : '';
      current++; // skip # or @
      
      // @row.fieldName 対応
      if (isRow) {
        let rowPrefix = '';
        while (current < input.length && /[a-zA-Z0-9_-]/.test(input[current])) {
          rowPrefix += input[current];
          current++;
        }
        value += rowPrefix;
        if (input[current] === '.') {
          value += '.';
          current++;
          while (current < input.length && /[a-zA-Z0-9_-]/.test(input[current])) {
            value += input[current];
            current++;
          }
        }
      } else {
        while (current < input.length && /[a-zA-Z0-9_-]/.test(input[current])) {
          value += input[current];
          current++;
        }
      }
      tokens.push({ type: 'IDENTIFIER', value });
      continue;
    }

    if (/[0-9]/.test(char)) {
      let value = '';
      while (current < input.length && /[0-9.]/.test(input[current])) {
        value += input[current];
        current++;
      }
      tokens.push({ type: 'NUMBER', value });
      continue;
    }

    if (char === "'") {
      let value = '';
      current++; // skip '
      while (current < input.length && input[current] !== "'") {
        value += input[current];
        current++;
      }
      current++; // skip '
      tokens.push({ type: 'STRING', value });
      continue;
    }

    // Operators: ==, !=, &&, ||, !, >=, <=, >, <
    if (char === '=' && input[current + 1] === '=') {
      tokens.push({ type: 'OPERATOR', value: '==' });
      current += 2;
      continue;
    }
    if (char === '!' && input[current + 1] === '=') {
      tokens.push({ type: 'OPERATOR', value: '!=' });
      current += 2;
      continue;
    }
    if (char === '>' && input[current + 1] === '=') {
      tokens.push({ type: 'OPERATOR', value: '>=' });
      current += 2;
      continue;
    }
    if (char === '<' && input[current + 1] === '=') {
      tokens.push({ type: 'OPERATOR', value: '<=' });
      current += 2;
      continue;
    }
    if (char === '>') {
      tokens.push({ type: 'OPERATOR', value: '>' });
      current++;
      continue;
    }
    if (char === '<') {
      tokens.push({ type: 'OPERATOR', value: '<' });
      current++;
      continue;
    }
    if (char === '&' && input[current + 1] === '&') {
      tokens.push({ type: 'OPERATOR', value: '&&' });
      current += 2;
      continue;
    }
    if (char === '|' && input[current + 1] === '|') {
      tokens.push({ type: 'OPERATOR', value: '||' });
      current += 2;
      continue;
    }
    if (char === '!') {
      tokens.push({ type: 'OPERATOR', value: '!' });
      current++;
      continue;
    }

    if (char === '+' || char === '-' || char === '*' || char === '/' || char === '%') {
      tokens.push({ type: 'OPERATOR', value: char });
      current++;
      continue;
    }

    // Identifiers (for functions like in, contains)
    const idMatch = input.slice(current).match(/^[a-zA-Z][a-zA-Z0-9_]*/);
    if (idMatch) {
      // boolean check already exists below, so we handle it here or let it fall through
      const word = idMatch[0];
      if (word === 'true' || word === 'false') {
        tokens.push({ type: 'BOOLEAN', value: word });
        current += word.length;
      } else {
        tokens.push({ type: 'IDENTIFIER', value: word });
        current += word.length;
      }
      continue;
    }

    throw new Error(`Unexpected character: ${char} at position ${current}`);
  }

  return tokens;
}
