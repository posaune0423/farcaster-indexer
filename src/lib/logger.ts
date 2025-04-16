import { pino } from "pino";

export const log = pino({
  // 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
  level: Deno.env.get("LOG_LEVEL") || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      // singleLine: true,
    },
  },
});
