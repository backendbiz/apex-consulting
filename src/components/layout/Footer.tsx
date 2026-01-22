import Link from 'next/link'
import { Icon, type IconName } from '@/components/ui'
import type { Page } from '@/payload-types'

interface FooterProps {
  siteName?: string
  logo?: {
    url?: string | null
    alt?: string | null
    width?: number | null
    height?: number | null
  } | null
  aboutText?: string
  quickLinks?: { label: string; link: string | Page }[]
  offices?: { city: string; address?: string; phone?: string; email?: string }[]
  socialLinks?: { platform: string; url: string }[]
  copyrightText?: string
  bottomLinks?: { label: string; link: string | Page }[]
}

export function Footer({
  siteName: _siteName = 'Consulting',
  logo: _logo,
  aboutText = 'We provide professional consulting services to help businesses grow and achieve their goals. Our team of experts is dedicated to delivering exceptional results.',
  quickLinks = [],
  offices = [],
  socialLinks = [],
  copyrightText = `© ${new Date().getFullYear()} Consulting. All rights reserved.`,
  bottomLinks = [],
}: FooterProps) {
  const socialIcons: Record<string, IconName> = {
    facebook: 'facebook',
    twitter: 'twitter',
    linkedin: 'linkedin',
    instagram: 'instagram',
    youtube: 'youtube',
  }

  const getLinkUrl = (link: string | Page | null | undefined): string => {
    if (!link) return '#'
    if (typeof link === 'string') return link
    return link.slug === 'home' ? '/' : `/${link.slug}`
  }

  return (
    <footer className="bg-navy-900 text-white pt-16 pb-8">
      <div className="container">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* About Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold uppercase tracking-wider text-white font-heading">
              About Our Consulting
            </h3>
            <p className="text-white/70 leading-relaxed text-sm">{aboutText}</p>
            {/* Common Phone/Contact if needed, or Socials here */}
            {socialLinks.length > 0 && (
              <div className="flex gap-4 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-blue-600"
                    aria-label={social.platform}
                  >
                    <Icon name={socialIcons[social.platform] || 'globe'} className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
            {/* Dynamic Global Contact Info could go here if in aboutText or separate */}
          </div>

          {/* Quick Links */}
          <div className="lg:pl-8">
            <h3 className="mb-6 text-lg font-bold uppercase tracking-wider text-white font-heading">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((item, i) => (
                <li key={i}>
                  <Link
                    href={getLinkUrl(item.link)}
                    className="group flex items-center text-white/70 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-1.5 w-1.5 rounded-full border border-white/40 transition-colors group-hover:border-white group-hover:bg-white" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Offices - Split into columns if possible, or single column list */}
          {/* If we strictly follow '4 columns' and have 2 offices, we can render them as col 3 and 4? */}
          {/* Or render 'Our Offices' header in one and list them? */}
          {/* The image likely shows multiple columns for offices or a wide section. */}
          {/* I'll implement a flexible approach: If offices > 0, render "Our Offices" title then list. */}
          {/* But to fill 4 cols: Let's assume Col 3 is Office 1, Col 4 is Office 2 (if exists). */}

          {offices.length > 0 ? (
            <>
              <div className="lg:col-span-2">
                <h3 className="mb-6 text-lg font-bold uppercase tracking-wider text-white font-heading">
                  Our Offices
                </h3>
                <div className="grid gap-8 md:grid-cols-2">
                  {offices.map((office, index) => (
                    <div key={index} className="space-y-4">
                      <h4 className="text-white font-bold text-base">{office.city} Office</h4>
                      <div className="space-y-2 text-sm text-white/70">
                        {office.address && (
                          <p className="leading-relaxed whitespace-pre-line">{office.address}</p>
                        )}
                        {office.phone && (
                          <div className="flex items-center gap-2">
                            <Icon name="phone" className="h-4 w-4 shrink-0" />
                            <a
                              href={`tel:${office.phone}`}
                              className="hover:text-white transition-colors"
                            >
                              {office.phone}
                            </a>
                          </div>
                        )}
                        {office.email && (
                          <div className="flex items-center gap-2">
                            <Icon name="mail" className="h-4 w-4 shrink-0" />
                            <a
                              href={`mailto:${office.email}`}
                              className="hover:text-white transition-colors"
                            >
                              {office.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="lg:col-span-2" />
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-16 border-t border-white/10 bg-navy-950/30">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-sm text-white/60">{copyrightText}</p>
          {bottomLinks.length > 0 && (
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {bottomLinks.map((item, i) => (
                <Link
                  key={i}
                  href={getLinkUrl(item.link)}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          {/* WhatsApp Float usually goes here or globally, not inside footer flow necessarily */}
        </div>
      </div>
    </footer>
  )
}
