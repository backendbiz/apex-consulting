import crypto from 'crypto'

/**
 * Generate a secure API key for external providers
 * Format: provider_[random_32_chars]
 */
export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(24) // 24 bytes = 32 base64 chars
  const key = randomBytes.toString('base64url')
  return `provider_${key}`
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return typeof apiKey === 'string' && apiKey.startsWith('provider_') && apiKey.length >= 30
}

/**
 * Hash an API key for secure comparison (if needed for lookup optimization)
 * Note: Currently we do direct comparison since API keys are unique in DB
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex')
}
