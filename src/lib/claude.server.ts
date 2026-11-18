/** Server-only Claude client. The key is read from the ANTHROPIC_API_KEY environment variable
 *  (Netlify → Site configuration → Environment variables) and never reaches the browser.
 *  Structured output is requested by forcing a single tool call whose input_schema is the schema. */

export const CLAUDE_FAST = "claude-haiku-5-5"; // quick, cheap: public demo features
export const CLAUDE_SMART = "claude-sonnet-5-5"; // drafting test items and analysis outputs

export class ClaudeError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail = "",
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
      return `The AI key was rejected. ${e.detail || "Check ANTHROPIC_API_KEY."}`;
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
  // Tolerate stray spaces, line breaks or quote marks picked up when the key was pasted.
  const key = (process.env["ANTHROPIC_API_KEY"] ?? "").trim().replace(/^["']|["']$/g, "").trim();
  if (!key) throw new ClaudeError("missing-key", 0);
  // If Netlify's AI Gateway supplied the credentials (no own key reached the function), route through the gateway
  // address it provides. Netlify never sets this when your own ANTHROPIC_API_KEY is visible to functions.
  const base = (process.env["ANTHROPIC_BASE_URL"] ?? "").trim().replace(/\/+$/, "") || "https://api.anthropic.com";
  const res = await fetch(`${base}/v1/messages`, {
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
  if (!res.ok) {
    let detail = "";
    if (res.status === 401 || res.status === 403) {
      // Safe diagnostics: Anthropic's message plus the key's type and length, never the key itself.
      const reason = await res.text().catch(() => "");
      let msg = "";
      try {
        msg = String((JSON.parse(reason) as { error?: { message?: string } }).error?.message ?? "");
      } catch {
        msg = reason.slice(0, 120);
      }
      const kind = key.startsWith("sk-ant-api") ? "an API key (sk-ant-api…)" : key.startsWith("sk-ant-admin") ? "an Admin key (sk-ant-admin…), which can't call the AI" : key.startsWith("sk-ant-") ? "a key starting sk-ant- of an unexpected type" : "not an Anthropic key (it doesn't start with sk-ant-)";
      detail = `Anthropic says: "${msg.slice(0, 120)}". The saved value is ${kind}, ${key.length} characters long${/\s/.test(key) ? ", with a space or line break inside" : ""}.`;
      console.error(`Anthropic auth failed (${res.status}): ${detail}`);
    }
    throw new ClaudeError(`claude-${res.status}`, res.status, detail);
  }
  const body = (await res.json()) as {
    content?: { type: string; name?: string; input?: unknown }[];
  };
  const call = body.content?.find((c) => c.type === "tool_use" && c.name === opts.name);
  if (!call || typeof call.input !== "object" || call.input === null)
    throw new ClaudeError("no-structured-output", 500);
  return call.input as T;
}
