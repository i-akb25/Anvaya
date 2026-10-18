"use client";
import { useRef, useState } from "react";
import { calculate, type AngleMode } from "@/lib/platform/calculator";
export function ScientificCalculator() {
  const [expression, setExpression] = useState(""),
    [mode, setMode] = useState<AngleMode>("rad"),
    [answer, setAnswer] = useState(0),
    [status, setStatus] = useState(""),
    [history, setHistory] = useState<string[]>([]),
    field = useRef<HTMLInputElement>(null);
  function insert(value: string) {
    const start = field.current?.selectionStart ?? expression.length,
      end = field.current?.selectionEnd ?? start;
    const next = expression.slice(0, start) + value + expression.slice(end);
    if (next.length > 256) {
      setStatus("Expression limit is 256 characters.");
      return;
    }
    setExpression(next);
    requestAnimationFrame(() => {
      field.current?.focus();
      field.current?.setSelectionRange(
        start + value.length,
        start + value.length,
      );
    });
  }
  function solve() {
    try {
      const result = calculate(expression, mode, answer);
      setAnswer(result);
      setStatus(String(result));
      setHistory((old) =>
        [`${expression} = ${result} (${mode})`, ...old].slice(0, 3),
      );
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  return (
    <div className="scientific-calculator">
      <p className="small-copy">
        Local practice calculator, not a replica of the official GATE
        calculator. Use explicit multiplication. Trig inputs follow the selected
        angle mode; log is base 10 and ln is natural log.
      </p>
      <label>
        Angle mode
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as AngleMode)}
        >
          <option value="rad">Radians</option>
          <option value="deg">Degrees</option>
        </select>
      </label>
      <label>
        Calculator expression
        <input
          ref={field}
          maxLength={256}
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              solve();
            }
          }}
          placeholder="sqrt(3^2+4^2)"
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <div className="calculator-keys">
        {[
          "7",
          "8",
          "9",
          "/",
          "4",
          "5",
          "6",
          "*",
          "1",
          "2",
          "3",
          "-",
          "0",
          ".",
          "(",
          "+",
          ")",
          "^",
          "pi",
          "ans",
          "sqrt(",
          "sin(",
          "cos(",
          "tan(",
          "ln(",
          "log(",
          "exp(",
          "!",
        ].map((k) => (
          <button
            className="button"
            key={k}
            type="button"
            onClick={() => insert(k)}
            aria-label={`Insert ${k}`}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="question-actions">
        <button className="button primary" type="button" onClick={solve}>
          Calculate
        </button>
        <button
          className="button"
          type="button"
          onClick={() => {
            setExpression("");
            setStatus("");
          }}
        >
          Clear expression
        </button>
      </div>
      <output aria-live="polite" aria-label="Calculator result">
        {status || "No calculation yet"}
      </output>
      <details>
        <summary>Recent calculations</summary>
        <ul>
          {history.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
        <p className="small-copy">
          Last three calculations, kept only while this calculator is mounted.
          They do not change answers or practice scores.
        </p>
      </details>
    </div>
  );
}
