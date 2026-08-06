/**
 * Code samples for the marketing code demo.
 * Extracted so they can be shared between:
 * - Server-side Shiki highlighting (landing page pre-renders highlighted HTML)
 * - Client-side CodeDemo (clipboard copy needs raw text)
 */

export interface CodeSample {
  label: string;
  lang: string;
  code: string;
}

export const CODE_SAMPLES: CodeSample[] = [
  {
    label: "curl",
    lang: "bash",
    code: `curl https://api.ruvicode.com/v1/chat/completions \\
  -H "Authorization: Bearer rvcd_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "glm-5.2",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# Response headers include:
# X-Cost: $0.000218`,
  },
  {
    label: "python",
    lang: "python",
    code: `from openai import OpenAI

client = OpenAI(
    api_key="rvcd_...",
    base_url="https://api.ruvicode.com/v1"
)

response = client.chat.completions.create(
    model="glm-5.2",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)`,
  },
  {
    label: "node",
    lang: "typescript",
    code: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "rvcd_...",
  baseURL: "https://api.ruvicode.com/v1",
});

const response = await client.chat.completions.create({
  model: "glm-5.2",
  messages: [{ role: "user", content: "Hello" }],
});`,
  },
];
