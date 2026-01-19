import { Metadata } from 'next'
import { CareerJobTabs, Job } from '@/components/sections/career/CareerJobTabs'
import { getPayloadClient } from '@/lib/payload'

import type { Page } from '@/payload-types'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: 'career',
      },
    },
  })
  const page = docs[0] as Page | undefined

  return {
    title: page?.seo?.metaTitle || page?.title || 'Career',
    description:
      page?.seo?.metaDescription ||
      'Join our team at Apex Consulting. Explore career opportunities.',
  }
}

export default async function CareerPage() {
  const payload = await getPayloadClient()

  // Fetch Career Page Content (for potential future dynamic hero, currently static/hardcoded in component below)
  // We can fetch it to get SEO or if we eventually want to make the Hero dynamic too.
  // For now, prompt asked to fetch jobs. The plan said "Fetch page document... for Hero".
  // But the existing code has a hardcoded Hero. I will keep the hardcoded Hero structure
  // but potentially use the title from the page if found, or just keep it static as per current design
  // until user asks to make the Career Hero dynamic (it wasn't explicitly in the schema updates for Career specifically,
  // though we reused `Pages` collection which has Hero fields).
  // Let's stick to making the JOBS dynamic first.

  const { docs: jobDocs } = await payload.find({
    collection: 'jobs',
    where: {
      status: {
        equals: 'published',
      },
    },
  })

  // Map Payload Jobs to Component Jobs
  const jobs: Job[] = jobDocs.map((job) => ({
    id: job.id,
    title: job.title,
    location: job.location,
    type: job.type,
    description: job.description,
    responsibilities: job.responsibilities?.map((r) => r.text || '').filter(Boolean) || [],
    requirements: job.requirements?.map((r) => r.text || '').filter(Boolean) || [],
  }))

  return (
    <>
      {/* Hero Section - Static for now or we could fetch 'career' page title */}
      <section className="relative bg-navy-900 py-32 overflow-hidden">
        {/* Network Pattern Overlay */}
        <div className="absolute inset-0 z-0 opacity-30 network-pattern"></div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-navy-900 via-navy-800 to-navy-900 opacity-90 z-0"></div>

        <div className="container relative z-10 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-[0.2em] animate-fade-in-up">
            CAREER
          </h1>
          <div className="h-1 w-20 bg-blue-500 mt-6 rounded-full"></div>
        </div>
      </section>

      {/* Job Listings Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6 relative inline-block">
              JOIN OUR TEAM
              <span className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-16 h-[3px] bg-blue-500"></span>
            </h2>
            <p className="text-gray-600 mt-10 text-lg">
              Explore exciting career opportunities with us and grow your career in technology. We
              are always looking for talented individuals to join our mission.
            </p>
          </div>

          <CareerJobTabs jobs={jobs} />
        </div>
      </section>
    </>
  )
}
