export type UrlResult =
  | { ok: true; url: string }
  | { ok: false; reason: string }

export function validateUrl(input: string): UrlResult {
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, reason: 'URL is required' }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return { ok: false, reason: 'Must be a valid URL (http or https)' }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'Only http and https are supported' }
  }

  const normalized = parsed
    .toString()
    .replace(/\/$/, '')

  return { ok: true, url: normalized }
}
