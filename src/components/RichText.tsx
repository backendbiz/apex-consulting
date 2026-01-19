import React from 'react'
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { cn } from '@/utils/cn'

export const RichText: React.FC<{
  content: unknown
  className?: string
}> = ({ content, className }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(content as any)?.root?.children) {
    return null
  }

  return (
    <div className={cn('prose max-w-none text-gray-600', className)}>
      <LexicalRichText data={content as SerializedEditorState} />
    </div>
  )
}
