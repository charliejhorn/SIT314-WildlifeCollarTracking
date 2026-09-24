export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...options, headers: { "content-type": "application/json", ...options?.headers } });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.error ?? data?.message ?? text ?? `Request failed (${response.status})`);
  return data as T;
}
