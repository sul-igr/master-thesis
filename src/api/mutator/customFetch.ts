import { getApiBaseUrl } from '@/constants'

/**
 * Rewrites the request URL to use the app's API base (getApiBaseUrl()) so the
 * same code works in dev (openapi.json server is localhost:3001) and deploy.
 */
function getRequestUrl(contextUrl: string): string {
  const url = new URL(contextUrl)
  const base = getApiBaseUrl().replace(/\/$/, '')
  return `${base}${url.pathname}${url.search}`
}

export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const requestUrl = getRequestUrl(url)
  const res = await fetch(requestUrl, options)
  const body = [204, 205, 304].includes(res.status) ? null : await res.text()
  const data = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as T
}
