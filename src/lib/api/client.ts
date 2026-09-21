import type { L2ItemSearchResponse } from './types';

const API_URL = 'https://l2api.dev/api/interlude';

export async function searchL2Items(query: string, limit = 10): Promise<L2ItemSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  const response = await fetch(`${API_URL}/items?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`L2 API error: ${response.status}`);
  }

  return response.json();
}
