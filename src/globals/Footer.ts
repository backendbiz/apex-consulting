import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '@/hooks/revalidate'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal],
  },
  fields: [
    {
      name: 'aboutText',
      type: 'textarea',
      label: 'About Section Text',
    },
    {
      name: 'quickLinks',
      type: 'array',
      label: 'Quick Links',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Internal Link', value: 'internal' },
            { label: 'External Link', value: 'external' },
          ],
          defaultValue: 'internal',
          required: true,
        },
        {
          name: 'internalLink',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'internal',
          },
        },
        {
          name: 'externalLink',
          type: 'text',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'external',
          },
        },
      ],
    },
    {
      name: 'offices',
      type: 'array',
      label: 'Office Locations',
      fields: [
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'address',
          type: 'textarea',
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'email',
          type: 'email',
        },
      ],
    },
    {
      name: 'copyrightText',
      type: 'text',
      defaultValue: '© 2024 Consulting. All rights reserved.',
    },
    {
      name: 'bottomLinks',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Internal Link', value: 'internal' },
            { label: 'External Link', value: 'external' },
          ],
          defaultValue: 'internal',
          required: true,
        },
        {
          name: 'internalLink',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'internal',
          },
        },
        {
          name: 'externalLink',
          type: 'text',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'external',
          },
        },
      ],
    },
  ],
}
