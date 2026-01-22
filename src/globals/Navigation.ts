import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '@/hooks/revalidate'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal],
  },
  fields: [
    {
      name: 'mainNav',
      type: 'array',
      label: 'Main Navigation',
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
        {
          name: 'subItems',
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
    },
    {
      name: 'ctaButton',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'label',
          type: 'text',
          defaultValue: 'Get Consultation',
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Internal Link', value: 'internal' },
            { label: 'External Link', value: 'external' },
          ],
          defaultValue: 'internal',
        },
        {
          name: 'internalLink',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'internal',
          },
        },
        {
          name: 'externalLink',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'external',
          },
        },
      ],
    },
  ],
}
