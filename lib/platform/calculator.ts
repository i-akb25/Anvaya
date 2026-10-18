export type AngleMode = "rad" | "deg";
/** Bounded real-number parser. No eval, Function constructor, property access or script execution. */
export function calculate(
  raw: string,
  mode: AngleMode = "rad",
  ans = 0,
): number {
  if (
    typeof raw !== "string" ||
    raw.length > 256 ||
    !["rad", "deg"].includes(mode) ||
    !Number.isFinite(ans)
  )
    throw Error("Use a real expression of at most 256 characters.");
  const input = raw
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll("−", "-")
    .replaceAll("π", "pi")
    .trim()
    .toLowerCase();
  if (!input) throw Error("Enter an expression.");
  const tokens: string[] = [];
  let pos = 0;
  while (pos < input.length) {
    const c = input[pos];
    if (/\s/.test(c)) {
      pos++;
      continue;
    }
    const m = input
      .slice(pos)
      .match(/^(?:(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|[a-z]+|[+\-*/^()!%])/);
    if (!m)
      throw Error("Unsupported symbol. Use explicit arithmetic operators.");
    tokens.push(m[0]);
    pos += m[0].length;
    if (tokens.length > 128) throw Error("Expression is too complex.");
  }
  let index = 0,
    steps = 0;
  function finite(n: number) {
    if (!Number.isFinite(n))
      throw Error("Result is outside the real finite domain.");
    return Object.is(n, -0) ? 0 : n;
  }
  function tick() {
    if (++steps > 512) throw Error("Expression is too complex.");
  }
  const take = (t: string) => (tokens[index] === t ? (index++, true) : false);
  function expression(): number {
    tick();
    let n = product();
    for (;;) {
      if (take("+")) n = finite(n + product());
      else if (take("-")) n = finite(n - product());
      else return n;
    }
  }
  function product(): number {
    tick();
    let n = unary();
    for (;;) {
      if (take("*")) n = finite(n * unary());
      else if (take("/")) {
        const d = unary();
        if (d === 0) throw Error("Division by zero.");
        n = finite(n / d);
      } else return n;
    }
  }
  function unary(): number {
    tick();
    if (take("+")) return unary();
    if (take("-")) return finite(-unary());
    return power();
  }
  function power(): number {
    let n = primary();
    if (take("^")) {
      const p = unary();
      if (n === 0 && p === 0) throw Error("0^0 is not supported.");
      n = finite(n ** p);
    }
    return n;
  }
  function primary(): number {
    tick();
    let n: number;
    const token = tokens[index++];
    if (token === "(") {
      n = expression();
      if (!take(")")) throw Error("Missing closing parenthesis.");
    } else if (token && /^(?:\d|\.)/.test(token)) n = finite(Number(token));
    else if (token === "pi") n = Math.PI;
    else if (token === "e") n = Math.E;
    else if (token === "ans") n = ans;
    else {
      const names = [
        "sqrt",
        "abs",
        "ln",
        "log",
        "exp",
        "sin",
        "cos",
        "tan",
        "asin",
        "acos",
        "atan",
      ];
      if (!names.includes(token))
        throw Error("Expected a number, constant or supported function.");
      if (!take("(")) throw Error("Function arguments need parentheses.");
      const value = expression();
      if (!take(")")) throw Error("Missing function parenthesis.");
      const angle = mode === "deg" ? (value * Math.PI) / 180 : value;
      if (token === "tan" && Math.abs(Math.cos(angle)) < 1e-14)
        throw Error("Tangent is undefined at this angle.");
      const results: Record<string, () => number> = {
        sqrt: () => Math.sqrt(value),
        abs: () => Math.abs(value),
        ln: () => Math.log(value),
        log: () => Math.log10(value),
        exp: () => Math.exp(value),
        sin: () => Math.sin(angle),
        cos: () => Math.cos(angle),
        tan: () => Math.tan(angle),
        asin: () => Math.asin(value) * (mode === "deg" ? 180 / Math.PI : 1),
        acos: () => Math.acos(value) * (mode === "deg" ? 180 / Math.PI : 1),
        atan: () => Math.atan(value) * (mode === "deg" ? 180 / Math.PI : 1),
      };
      n = finite(results[token]());
    }
    while (index < tokens.length) {
      if (take("%")) n = finite(n / 100);
      else if (take("!")) {
        if (!Number.isInteger(n) || n < 0 || n > 170)
          throw Error("Factorial requires an integer from 0 to 170.");
        let value = 1;
        for (let k = 2; k <= n; k++) value *= k;
        n = finite(value);
      } else break;
    }
    return n;
  }
  const result = expression();
  if (index !== tokens.length)
    throw Error(
      "Unexpected input. Write multiplication explicitly, for example 2*pi.",
    );
  return finite(result);
}
