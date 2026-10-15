import { readFile } from "node:fs/promises";
import { packIssues } from "../lib/platform/moderation.ts";
const path = process.argv[2];
if (!path) {
  console.error(
    "Usage: node --experimental-strip-types scripts/review-pack.mjs path/to/pack.json",
  );
  process.exitCode = 1;
} else {
  try {
    const issues = packIssues(JSON.parse(await readFile(path, "utf8")));
    if (issues.length) {
      console.error(issues.join("\n"));
      process.exitCode = 1;
    } else
      console.log(
        "Pack metadata/key validation passed. This does not independently verify the reviewer, permission or factual answers; inspect the supporting evidence before publishing.",
      );
  } catch {
    console.error("Pack could not be read or validated.");
    process.exitCode = 1;
  }
}
