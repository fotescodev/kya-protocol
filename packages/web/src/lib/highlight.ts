/**
 * Custom TypeScript syntax highlighter with rich token colors.
 * Replaces sugar-high for better visual output in dark themes.
 */

type TokenType =
  | "keyword"
  | "string"
  | "comment"
  | "type"
  | "number"
  | "operator"
  | "punctuation"
  | "function"
  | "property"
  | "plain";

const TOKEN_CLASSES: Record<TokenType, string> = {
  keyword: "sh-keyword",
  string: "sh-string",
  comment: "sh-comment",
  type: "sh-type",
  number: "sh-number",
  operator: "sh-operator",
  punctuation: "sh-punctuation",
  function: "sh-function",
  property: "sh-property",
  plain: "sh-plain",
};

const KEYWORDS = new Set([
  "import",
  "export",
  "from",
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "new",
  "await",
  "async",
  "class",
  "extends",
  "type",
  "interface",
  "true",
  "false",
  "null",
  "undefined",
  "typeof",
  "instanceof",
  "void",
  "default",
  "throw",
  "try",
  "catch",
]);

const TYPES = new Set([
  "string",
  "number",
  "boolean",
  "Promise",
  "Array",
  "Map",
  "Set",
  "Record",
  "Partial",
  "Date",
  "BigInt",
]);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(text: string, type: TokenType): string {
  if (type === "plain") return escapeHtml(text);
  return `<span class="${TOKEN_CLASSES[type]}">${escapeHtml(text)}</span>`;
}

export function highlightCode(code: string): string {
  const result: string[] = [];
  let i = 0;

  while (i < code.length) {
    // Line comments
    if (code[i] === "/" && code[i + 1] === "/") {
      const end = code.indexOf("\n", i);
      const comment = end === -1 ? code.slice(i) : code.slice(i, end);
      result.push(wrap(comment, "comment"));
      i += comment.length;
      continue;
    }

    // Block comments
    if (code[i] === "/" && code[i + 1] === "*") {
      const end = code.indexOf("*/", i + 2);
      const comment =
        end === -1 ? code.slice(i) : code.slice(i, end + 2);
      result.push(wrap(comment, "comment"));
      i += comment.length;
      continue;
    }

    // Strings (double quote)
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') {
        if (code[j] === "\\") j++;
        j++;
      }
      const str = code.slice(i, j + 1);
      result.push(wrap(str, "string"));
      i = j + 1;
      continue;
    }

    // Strings (single quote)
    if (code[i] === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== "'") {
        if (code[j] === "\\") j++;
        j++;
      }
      const str = code.slice(i, j + 1);
      result.push(wrap(str, "string"));
      i = j + 1;
      continue;
    }

    // Template literals
    if (code[i] === "`") {
      let j = i + 1;
      while (j < code.length && code[j] !== "`") {
        if (code[j] === "\\") j++;
        j++;
      }
      const str = code.slice(i, j + 1);
      result.push(wrap(str, "string"));
      i = j + 1;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(code[i]) && (i === 0 || !/[a-zA-Z_$]/.test(code[i - 1]))) {
      let j = i;
      while (j < code.length && /[0-9.xXa-fA-F_n]/.test(code[j])) j++;
      result.push(wrap(code.slice(i, j), "number"));
      i = j;
      continue;
    }

    // Words (identifiers, keywords)
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
      const word = code.slice(i, j);

      if (KEYWORDS.has(word)) {
        result.push(wrap(word, "keyword"));
      } else if (TYPES.has(word)) {
        result.push(wrap(word, "type"));
      } else if (j < code.length && code[j] === "(") {
        // function call
        result.push(wrap(word, "function"));
      } else if (i > 0 && code[i - 1] === ".") {
        // property access
        result.push(wrap(word, "property"));
      } else if (word[0] === word[0].toUpperCase() && /[a-z]/.test(word.slice(1))) {
        // PascalCase = type/class
        result.push(wrap(word, "type"));
      } else {
        result.push(wrap(word, "plain"));
      }
      i = j;
      continue;
    }

    // Operators
    if (/[=+\-*/<>!&|^~?:]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[=+\-*/<>!&|^~?:]/.test(code[j])) j++;
      result.push(wrap(code.slice(i, j), "operator"));
      i = j;
      continue;
    }

    // Punctuation
    if (/[{}()\[\];,.]/.test(code[i])) {
      result.push(wrap(code[i], "punctuation"));
      i++;
      continue;
    }

    // Whitespace and everything else
    result.push(escapeHtml(code[i]));
    i++;
  }

  return result.join("");
}
