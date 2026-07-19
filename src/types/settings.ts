export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'id' | 'en'
  hasCompletedOnboarding: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'id',
  hasCompletedOnboarding: false,
}