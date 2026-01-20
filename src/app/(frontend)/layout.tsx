import type { Metadata } from 'next'
import { Montserrat, Open_Sans } from 'next/font/google'
import { Header, Footer, WhatsAppButton } from '@/components/layout'
import { getSiteSettings, getNavigation, getFooter } from '@/lib/queries/globals'
import type { Navigation, Footer as FooterType, SiteSetting } from '@/payload-types'
import './styles.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings()

  return {
    title: {
      default: siteSettings.siteName || 'Consulting',
      template: `%s | ${siteSettings.siteName || 'Consulting'}`,
    },
    description: siteSettings.defaultMetaDescription || 'Professional consulting services.',
    openGraph: {
      images:
        siteSettings.defaultOgImage &&
        typeof siteSettings.defaultOgImage === 'object' &&
        'url' in siteSettings.defaultOgImage
          ? [{ url: siteSettings.defaultOgImage.url || '' }]
          : undefined,
    },
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [siteSettings, navigation, footer] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getFooter(),
  ])

  // Map Navigation to Header Props
  const navItems =
    navigation.mainNav?.map((item: NonNullable<Navigation['mainNav']>[number]) => ({
      label: item.label,
      link: item.link,
      subItems: item.subItems?.map(
        (sub: NonNullable<NonNullable<Navigation['mainNav']>[number]['subItems']>[number]) => ({
          label: sub.label,
          link: sub.link,
        }),
      ),
    })) || []

  // Map Footer to Footer Props
  const footerLinks =
    footer.quickLinks?.map((link: NonNullable<FooterType['quickLinks']>[number]) => ({
      label: link.label,
      link: link.link,
    })) || []

  const officeLocations =
    footer.offices?.map((office: NonNullable<FooterType['offices']>[number]) => ({
      city: office.city,
      address: office.address || undefined,
      phone: office.phone || undefined,
    })) || []

  const bottomLinks =
    footer.bottomLinks?.map((link: NonNullable<FooterType['bottomLinks']>[number]) => ({
      label: link.label,
      link: link.link,
    })) || []

  const socialLinks =
    siteSettings.socialLinks?.map((link: NonNullable<SiteSetting['socialLinks']>[number]) => ({
      platform: link.platform,
      url: link.url,
    })) || []

  const logo =
    siteSettings.logo && typeof siteSettings.logo === 'object' && 'url' in siteSettings.logo
      ? {
          url: siteSettings.logo.url,
          alt: siteSettings.logo.alt || siteSettings.siteName,
          width: siteSettings.logo.width,
          height: siteSettings.logo.height,
        }
      : null

  const hasTopBar = siteSettings?.phone || siteSettings?.email
  const paddingTopClass = hasTopBar ? 'pt-[70px] md:pt-[115px]' : 'pt-[70px]'

  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable}`}>
      <body className="antialiased">
        <Header
          siteName={siteSettings.siteName}
          logo={logo}
          navItems={navItems}
          ctaButton={
            navigation.ctaButton
              ? {
                  enabled: navigation.ctaButton.enabled ?? false,
                  label: navigation.ctaButton.label || 'Get Consultation',
                  link: navigation.ctaButton.link || '/contact',
                }
              : undefined
          }
          contactInfo={{
            phone: siteSettings.phone || undefined,
            email: siteSettings.email || undefined,
            address: siteSettings.address || undefined,
          }}
        />
        <main className={paddingTopClass}>{children}</main>
        <Footer
          siteName={siteSettings.siteName}
          logo={logo}
          aboutText={footer.aboutText || undefined}
          quickLinks={footerLinks}
          offices={officeLocations}
          socialLinks={socialLinks}
          copyrightText={footer.copyrightText || undefined}
          bottomLinks={bottomLinks}
        />
        {siteSettings.whatsapp && <WhatsAppButton phoneNumber={siteSettings.whatsapp} />}
      </body>
    </html>
  )
}
