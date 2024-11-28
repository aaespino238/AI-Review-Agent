import * as dotenv from "dotenv";
import * as fs from "fs";
import { createPrivateKey } from "crypto";
import chalk from "chalk";

dotenv.config();
const privateKeyPath = "C:/Users/aaesp/Projects/Fellowship/AI-Review-Agent/ai-review-agent-aaespino238.2024-11-25.private-key.pem";

export const env = {
  GITHUB_APP_ID: process.env.GITHUB_APP_ID,
  GITHUB_PRIVATE_KEY: fs.readFileSync(privateKeyPath, "utf-8"),
  GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
} as const;

let valid = true;

for (const key in env) {
  if (!env[key as keyof typeof env]) {
    console.log(
      chalk.red("✖") +
        chalk.gray(" Missing required env var: ") +
        chalk.bold(`process.env.${key}`)
    );
    valid = false;
  }
}

try {
  createPrivateKey(env.GITHUB_PRIVATE_KEY);
} catch (error) {
  console.log(
    chalk.red(
      "\n✖ Invalid GitHub private key format for " +
        chalk.bold(`process.env.GITHUB_PRIVATE_KEY`) +
        "\n"
    ) +
      chalk.gray("  • Must start with: ") +
      chalk.bold("-----BEGIN RSA PRIVATE KEY-----\n") +
      chalk.gray("  • Must end with:   ") +
      chalk.bold("-----END RSA PRIVATE KEY-----\n")
  );
  valid = false;
}

if (!valid) {
  console.log(
    chalk.yellow("\n⚠ ") +
      chalk.bold("Please check your .env file and try again.\n")
  );
  process.exit(1);
}
