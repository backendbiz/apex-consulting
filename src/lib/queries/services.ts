import { getPayloadClient } from '@/lib/payload'
import { cache } from 'react'

export const getServices = cache(async () => {
  const payload = await getPayloadClient()

  const services = await payload.find({
    collection: 'services',
    where: {
      status: {
        equals: 'published',
      },
    },
    sort: 'order',
    limit: 100,
  })

  return services.docs
})

export const getServiceBySlug = cache(async (slug: string) => {
  const payload = await getPayloadClient()

  const services = await payload.find({
    collection: 'services',
    where: {
      slug: {
        equals: slug,
      },
      status: {
        equals: 'published',
      },
    },
    limit: 1,
  })

  return services.docs[0] || null
})

export const getFeaturedServices = cache(async (limit = 6) => {
  const payload = await getPayloadClient()

  const services = await payload.find({
    collection: 'services',
    where: {
      status: {
        equals: 'published',
      },
      featured: {
        equals: true,
      },
    },
    sort: 'order',
    limit,
  })

  return services.docs
})
