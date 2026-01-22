import { getPayload } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

dotenv.config({
  path: path.resolve(dirname, '../../.env'),
})

async function seed() {
  try {
    const { default: configPromise } = await import('@payload-config')
    const payload = await getPayload({ config: configPromise })

    console.log('Seeding Navigation...')

    await payload.updateGlobal({
      slug: 'navigation',
      data: {
        mainNav: [
          {
            label: 'Home',
            externalLink: '/',
            type: 'external',
          },
          {
            label: 'About',
            externalLink: '/about',
            type: 'external',
          },

          {
            label: 'Services',
            externalLink: '/services',
            type: 'external',
            subItems: [
              { label: 'Strategy', externalLink: '/services/strategy', type: 'external' },
              { label: 'Operations', externalLink: '/services/operations', type: 'external' },
              { label: 'Technology', externalLink: '/services/technology', type: 'external' },
            ],
          },
          {
            label: 'Projects',
            externalLink: '/portfolio',
            type: 'external',
          },
          {
            label: 'Contact',
            externalLink: '/contact',
            type: 'external',
          },
        ],
        ctaButton: {
          enabled: true,
          label: 'Get Consultation',
          externalLink: '/contact',
          type: 'external',
        },
      },
    })

    console.log('Navigation seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding navigation:', error)
    process.exit(1)
  }
}

seed()
