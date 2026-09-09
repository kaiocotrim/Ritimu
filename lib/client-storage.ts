"use client"

const memoryStorage = new Map<string, string>()

export function getClientStorageItem(key: string) {
  try {
    return window.localStorage.getItem(key) ?? memoryStorage.get(key) ?? null
  } catch {
    return memoryStorage.get(key) ?? null
  }
}

export function setClientStorageItem(key: string, value: string) {
  memoryStorage.set(key, value)
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Some embedded browsers and privacy modes deny access to localStorage.
  }
}

export function removeClientStorageItem(key: string) {
  memoryStorage.delete(key)
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Keep the in-memory state usable when persistent storage is unavailable.
  }
}
