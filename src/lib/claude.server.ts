/** Server-only Claude client. The key is read from the ANTHROPIC_API_KEY environment variable
 *  (Netlify → Site configuration → Environment variables) and never reaches the browser.
 *  Structured output is requested by forcing a single tool call whose input_schema is the schema. */

export const CLAUDE_FAST = "claude-haiku-5-5"; // quick, cheap: public demo features
export const CLAUDE_SMART = "claude-sonnet-5-5"; // drafting test items and analysis outputs

export class ClaudeError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ClaudeError";
  }
}

export function claudeConfigured() {
  return Boolean(process.env["ANTHROPIC_API_KEY"]);
}

/** Friendly message for the UI; never exposes provider details. */
export function claudeErrorMessage(e: unknown) {
  if (e instanceof ClaudeError) {
    if (e.status === 0)
      return "AI isn't set up yet. Add ANTHROPIC_API_KEY in your hosting settings.";
    if (e.status === 401 || e.status === 403)
      return "The AI key was rejected. Check ANTHROPIC_API_KEY.";
    if (e.status === 429 || e.status === 529)
      return "The AI is busy right now. Please wait a minute and try again.";
    if (e.status === 402 || e.status === 400)
      return "The AI request couldn't be completed. Check your Anthropic account and billing.";
  }
  return "The AI service couldn't complete this request. Please try again.";
}

export async function claudeJson<T>(opts: {
  model?: string;
  system: string;
  user: string;
  name: string;
  schema: Record<string, unknown>;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<T> {
  const key = process.env["ANTHROPIC_API_KEY"];
  if (!key) throw new ClaudeError("missing-key", 0);
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    signal: AbortSignal.timeout(opts.timeoutMs ?? 45000),
    body: JSON.stringify({
      model: opts.model ?? CLAUDE_SMART,
      max_tokens: opts.maxTokens ?? 2000,
      system: opts.system,
      messages: [{ role: "user", content: opts.user }],
      tools: [
        {
          name: opts.name,
          description: "Return the result in this exact structure.",
          input_schema: opts.schema,
        },
      ],
      tool_choice: { type: "tool", name: opts.name },
    }),
  });
  if (!res.ok) throw new ClaudeError(`claude-${res.status}`, res.status);
  const body = (await res.json()) as {
    content?: { type: string; name?: string; input?: unknown }[];
  };
  const call = body.content?.find((c) => c.type === "tool_use" && c.name === opts.name);
  if (!call || typeof call.input !== "object" || call.input === null)
    throw new ClaudeError("no-structured-output", 500);
  return call.input as T;
}
