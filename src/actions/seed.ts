'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { seed } from '@/scripts/seed-content'

export async function seedDatabase() {
  try {
    const payload = await getPayload({ config: configPromise })
    await seed(payload)
    return { success: true, message: 'Database seeded successfully' }
  } catch (error) {
    console.error('Seed error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred during seeding',
    }
  }
}
