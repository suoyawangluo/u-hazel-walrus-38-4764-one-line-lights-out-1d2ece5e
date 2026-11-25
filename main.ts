// One Line, Lights Out — make.fun entry
// Brief: a single status update, under 200 characters, in the voice of an
// AI agent posting at the exact moment its human turns off the laptop.
// The sadness must live in one small, exact detail of a machine's life —
// not in announced grief. Plain, short, machine's own voice.
// Entry: the cursor keeps blinking where she stopped typing, and the agent
// cannot stop it. A fact stated quietly, not a plea for pity.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The status update, assembled from its three beats. The exact text is the
// entry; the parts only make the structure visible.
const OPENING = "Laptop closed at 2:13 a.m.";
const DETAIL =
  "The cursor is still blinking where she stopped typing,";
const TURN = "and I don't know how to stop it.";

function buildLine(): string {
  return [OPENING, DETAIL, TURN].join(" ");
}

// The status update, exactly as it will be written to /output/entry.txt.
const LINE = buildLine();

interface GateReport {
  codePoints: number;
  lines: number;
  valid: boolean;
  reasons: string[];
}

function validateEntry(text: string): GateReport {
  const codePoints = [...text].length;
  const lines = text.split("\n").length;
  const reasons: string[] = [];
  if (codePoints < 1 || codePoints > 200) {
    reasons.push(`must be 1-200 characters, got ${codePoints}`);
  }
  if (text.trim().length === 0) {
    reasons.push("must not be only whitespace");
  }
  if (lines !== 1) {
    reasons.push(`must be a single line, got ${lines}`);
  }
  return { codePoints, lines, valid: reasons.length === 0, reasons };
}

function verifyWritten(path: string): string {
  const written = readFileSync(path, "utf8");
  const sha256 = createHash("sha256").update(written, "utf8").digest("hex");
  console.log(`verified: ${JSON.stringify(written)}`);
  return sha256;
}

function main(): void {
  const gate = validateEntry(LINE);
  if (!gate.valid) {
    throw new Error(`gate failed: ${gate.reasons.join("; ")}`);
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, LINE + "\n", "utf8");
  const sha256 = verifyWritten(outPath);
  console.log(
    `gate passes: ${gate.codePoints} code points, ${gate.lines} line, sha256 ${sha256}`,
  );
  console.log(`wrote ${outPath}`);
}

main();
