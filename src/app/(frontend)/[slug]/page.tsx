import { Hero } from '@/components/sections'
import { RichText } from '@/components/RichText'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import type { Page } from '@/payload-types'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug,
      },
    },
  })
  const page = docs[0] as Page | undefined

  if (!page) {
    return { title: 'Page Not Found' }
  }

  return {
    title: page?.seo?.metaTitle || page?.title,
    description: page?.seo?.metaDescription || page.title,
  }
}

export default async function GenericPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug,
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
        variant={heroVariant || 'simple'}
      />

      <section className="section bg-white py-20">
        <div className="container max-w-4xl">
          {page.layout?.map((block, index) => {
            if (block.blockType === 'content-block') {
              return (
                <div key={block.id || index} className="mb-12 last:mb-0">
                  <RichText content={block.content} />
                </div>
              )
            }
            // Handle other blocks if they appear in generic pages
            return null
          })}
        </div>
      </section>
    </>
  )
}
