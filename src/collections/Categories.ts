import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'icon',
      type: 'select',
      options: [
        { label: 'Briefcase', value: 'briefcase' },
        { label: 'Chart', value: 'chart' },
        { label: 'Users', value: 'users' },
        { label: 'Target', value: 'target' },
        { label: 'Lightbulb', value: 'lightbulb' },
        { label: 'Shield', value: 'shield' },
        { label: 'Globe', value: 'globe' },
        { label: 'Building', value: 'building' },
      ],
      defaultValue: 'briefcase',
    },
  ],
}
