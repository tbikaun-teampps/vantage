/**
 * Type Utilities and Helpers
 * Common type utilities used throughout the application
 */

import type { Database } from './database'

// Database table helper types
type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Generic CRUD input types
export type CreateInput<T extends keyof Tables> = Tables[T]['Insert']
export type UpdateInput<T extends keyof Tables> = Tables[T]['Update']
export type DatabaseRow<T extends keyof Tables> = Tables[T]['Row']

// ID type utilities
type EntityId = number // All our database IDs are auto-increment numbers

/**
 * Convert string or number ID to EntityId (number)
 * Useful for handling URL params that come as strings
 */
export const toEntityId = (id: string | number): EntityId => {
  if (typeof id === 'number') return id
  const parsed = parseInt(id, 10)
  if (isNaN(parsed)) throw new Error(`Invalid ID: ${id}`)
  return parsed
}

/**
 * Convert EntityId to string for URL params
 */
export const toStringId = (id: EntityId): string => id.toString()