import {
  Hero,
  Features,
  About,
  Stats,
  CTABanner,
  ServicesGrid,
  ContactForm,
} from '@/components/sections'
import type { IconName } from '@/components/ui'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'

import type { Page } from '@/payload-types'

export default async function HomePage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: 'home',
      },
    },
  })

  const page = docs[0] as Page | undefined

  if (!page) {
    return notFound()
  }

  // Fetch services if needed (we can optimize this later to only fetch if the block exists)
  // For now, let's fetch a default set just in case, or we can fetch only when mapping.
  // Actually, we can't await inside the map easily if we do it inline.
  // Let's fetch top services here.
  const { docs: servicesDocs } = await payload.find({
    collection: 'services',
    sort: 'order',
    limit: 6,
  })

  const {
    heroType,
    heroImage,
    heroSubtitle,
    ctaText,
    ctaLink,
    secondaryCtaText,
    secondaryCtaLink,
    heroVariant,
  } = page

  const heroImageUrl =
    heroType === 'image' && heroImage && typeof heroImage === 'object' && 'url' in heroImage
      ? heroImage.url
      : undefined

  // Map services to the format expected by ServicesGrid
  const services = servicesDocs.map((service) => ({
    id: service.id,
    slug: service.slug,
    title: service.title,
    description: service.description,
    icon: service.icon as IconName,
    featuredImage:
      service.featuredImage &&
      typeof service.featuredImage === 'object' &&
      'url' in service.featuredImage
        ? service.featuredImage.url
        : undefined,
    price: service.price,
    originalPrice: service.originalPrice || undefined,
    priceUnit: service.priceUnit || undefined,
  }))

  return (
    <>
      <Hero
        title={page.title}
        subtitle={heroSubtitle || ''}
        ctaText={ctaText || 'Get Started'}
        ctaLink={ctaLink || '/contact'}
        secondaryCta={
          secondaryCtaText && secondaryCtaLink
            ? {
                text: secondaryCtaText,
                link: secondaryCtaLink,
              }
            : undefined
        }
        variant={heroVariant || 'simple'}
        backgroundImage={heroImageUrl || undefined}
      />

      {page.layout?.map((block, index) => {
        switch (block.blockType) {
          case 'features-block':
            return (
              <Features
                key={block.id || index}
                title={block.heading || ''}
                subtitle={block.subtitle || ''}
                features={
                  block.features?.map((f) => ({
                    icon: (f.icon as IconName) || 'briefcase',
                    title: f.title,
                    description: f.description || '',
                  })) || []
                }
                columns={4}
                background={block.background || 'white'}
              />
            )
          case 'stats-block':
            return (
              <Stats
                key={block.id || index}
                stats={
                  block.stats?.map((s) => ({
                    value: s.value,
                    label: s.label,
                  })) || []
                }
              />
            )
          case 'about-block':
            // Handle features string array from object array
            const aboutFeatures = block.features?.map((f) => f.text || '').filter(Boolean) || []
            return (
              <About
                key={block.id || index}
                sectionLabel={block.sectionLabel || ''}
                heading={block.heading}
                description={block.description}
                features={aboutFeatures}
                ctaText={block.ctaText || ''}
                ctaLink={block.ctaLink || ''}
              />
            )
          case 'cta-block':
            return (
              <CTABanner
                key={block.id || index}
                heading={block.heading}
                description={block.description || ''}
                ctaText={block.buttonText}
                ctaLink={block.buttonLink}
                variant={block.style || 'navy'}
              />
            )
          case 'services-block':
            return (
              <ServicesGrid
                key={block.id || index}
                title={block.title || ''}
                subtitle={block.subtitle || ''}
                services={services.slice(0, block.limit || 6)}
                columns={3}
              />
            )
          case 'contact-block':
            return (
              <ContactForm
                key={block.id || index}
                title={block.title || 'FREE CONSULTATION'}
                subtitle={
                  block.subtitle ||
                  "Let's discuss how we can help your business grow. Fill out the form and we'll get back to you within 24 hours."
                }
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}
