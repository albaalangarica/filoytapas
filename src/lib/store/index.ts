import 'server-only'
import { isDemoMode } from '@/lib/config'
import { googleStore } from './google'
import { memoryStore } from './memory'
import type { Store } from './types'

export function getStore(): Store {
  return isDemoMode() ? memoryStore : googleStore
}

export { SHEETS_CACHE_TAG } from './google'
