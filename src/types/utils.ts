/**
 * Type Utilities and Helpers
 * Common type utilities used throughout the application
 */

import type { Database } from './database'

// Database table helper types
type Tables = Database['public']['Tables']

// Generic CRUD input types
export type DatabaseRow<T extends keyof Tables> = Tables[T]['Row']
