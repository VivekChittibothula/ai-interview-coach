export async function parseJsonResponse(res) {
  const text = await res.text();

  if (!text.trim()) {
    if (!res.ok) {
      throw new Error(
        `API unavailable (${res.status}). Start the API server with "npx vercel dev" alongside "npm run dev".`
      );
    }
    throw new Error("Empty response from server");
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid server response (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}
