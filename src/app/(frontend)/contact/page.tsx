import { Hero, ContactForm, Features, CTABanner, Stats } from '@/components/sections'

import { type IconName } from '@/components/ui'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import type { Page } from '@/payload-types'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: 'contact',
      },
    },
  })
  const page = docs[0] as Page | undefined

  return {
    title: page?.seo?.metaTitle || page?.title || 'Contact Us',
    description:
      page?.seo?.metaDescription ||
      "Get in touch with our consulting team. We're here to help your business grow.",
  }
}

export default async function ContactPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: 'contact',
      },
    },
  })

  const page = docs[0] as Page | undefined

  if (!page) {
    return notFound()
  }

  const { heroSubtitle, ctaText, ctaLink, secondaryCtaText, secondaryCtaLink, heroVariant } = page

  return (
    <>
      <Hero
        title={page.title}
        subtitle={heroSubtitle || ''}
        ctaText={ctaText || undefined}
        ctaLink={ctaLink || undefined}
        secondaryCta={
          secondaryCtaText && secondaryCtaLink
            ? {
                text: secondaryCtaText,
                link: secondaryCtaLink,
              }
            : undefined
        }
        variant={heroVariant || 'page'}
      />

      {page.layout?.map((block, index) => {
        switch (block.blockType) {
          case 'contact-block':
            return (
              <ContactForm
                key={block.id || index}
                title={block.title || 'SEND US A MESSAGE'}
                subtitle={
                  block.subtitle ||
                  "Fill out the form below and we'll get back to you within 24 hours."
                }
              />
            )
          case 'features-block':
            // Can be used for "Contact Info Cards" or "Office Locations"
            // If we wanted to distinguish, we could check block.name or styling,
            // but Features component is versatile enough for both (Icon + Title + Desc/Details).
            // However, `Features` component in `src/components/sections` might assume simple description strings.
            // The static page had arrays of details for addresses.
            // The `FeaturesBlock` schema has `description` as textarea.
            // So it's best suited for single paragraph text, which is fine for address block too.
            return (
              <Features
                key={block.id || index}
                title={block.heading || ''}
                subtitle={block.subtitle || ''}
                features={
                  block.features?.map((f) => ({
                    icon: (f.icon as IconName) || 'map-pin',
                    title: f.title,
                    description: f.description || '',
                  })) || []
                }
                columns={4} // Default, or maybe we should add 'columns' to the block schema? Defaults to 4 in code.
                background={block.background || 'white'}
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
          default:
            return null
        }
      })}
    </>
  )
}
