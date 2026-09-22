import type { L2ItemDetail, L2ItemSearchResponse } from './types';

const API_URL = 'https://l2api.dev/api/interlude';

export async function searchL2Items(
  query: string,
  type: 'weapon' | 'armor',
  limit = 10
): Promise<L2ItemSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    type,
    limit: String(limit),
  });

  const response = await fetch(`${API_URL}/items?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`L2 API error: ${response.status}`);
  }

  return response.json();
}

export async function getL2Item(id: number): Promise<L2ItemDetail> {
  const response = await fetch(`${API_URL}/items/${id}`);

  if (!response.ok) {
    throw new Error(`L2 API error: ${response.status}`);
  }

  const result = await response.json();

  return result.data;
}
