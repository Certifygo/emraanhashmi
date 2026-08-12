/** Resolve a public/ asset path for Vite `base: './'` (GitHub Pages safe). */
export function assetUrl(path: string): string {
  const cleaned = path.replace(/^\//, '')
  return `${import.meta.env.BASE_URL}${cleaned}`
}
