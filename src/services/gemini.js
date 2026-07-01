import { parseJsonResponse } from "../lib/api";

export async function askGemini(prompt) {
  const response = await fetch("/api/interview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await parseJsonResponse(response);
  return data.text;
}