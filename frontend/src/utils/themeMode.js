const themeStorageKey = 'inseetThemeMode'

export function getInitialThemeMode() {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem(themeStorageKey)
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyThemeMode(mode) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', mode === 'dark')
  localStorage.setItem(themeStorageKey, mode)
}
