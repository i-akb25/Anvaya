import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
test("scoring implementation includes unanswered and negative-marking guard",()=>{const s=readFileSync(new URL("../lib/scoring.ts",import.meta.url),"utf8");assert.match(s,/unanswered\+\+/);assert.match(s,/incorrect\*negative/);assert.match(s,/Invalid marks/)});
