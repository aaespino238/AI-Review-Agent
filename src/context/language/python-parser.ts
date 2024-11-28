import { AbstractParser, EnclosingContext } from "../../constants";
import { spawn, spawnSync } from "child_process";
import * as path from 'path';

function runEnclosingContext(
  fileContent: string,
  lineStart: number,
  lineEnd: number
): EnclosingContext {
  const scriptPath = "src/context/language/python_parser.py";
  const job = "enclosing_context"
  try {
    const output = spawnSync(
      "python",
      [scriptPath, fileContent, job, lineStart.toString(), lineEnd.toString()],
      { encoding: "utf-8", stdio: "pipe" }
    ).output
    const result = JSON.parse(output[1]);
    return {
      line_start: result.line_start,
      line_end: result.line_end
    };
  } catch (error) {
    throw new Error(`Python script execution failed: ${error.message}`);
  }
}

function runDryRun(
  fileContent: string
) : { valid: boolean; error: string} {
  const scriptPath = "src/context/language/python_parser.py";
  const job = "dry_run";
  try {
    const output = spawnSync(
      "python",
      [scriptPath, fileContent, job],
      { encoding: "utf-8", stdio: "pipe"}
    ).output

    const results = JSON.parse(output[1]);
    return {
      valid: results.valid,
      error: results.error
    };
  } catch (error) {
    throw new Error(`Python script execution failed: ${error.message}`);
  }
}

export class PythonParser implements AbstractParser {

  findEnclosingContext(
    file: string,
    lineStart: number,
    lineEnd: number
  ): EnclosingContext {
    const result = runEnclosingContext(file, lineStart, lineEnd);
    return result;
  }

  dryRun(file: string): { valid: boolean; error: string } {
    const result = runDryRun(file);
    return result;
  }
}
