'use client'

import { useMemo, useState } from 'react'
import { Copy, Check, Braces } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface JsonPayloadViewerProps {
  value: unknown
  title?: string
  className?: string
  maxHeight?: number
}

function highlight(json: string): string {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-emerald-600'
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'text-indigo-600' : 'text-amber-600'
        } else if (/true|false/.test(match)) {
          cls = 'text-violet-600'
        } else if (/null/.test(match)) {
          cls = 'text-slate-400'
        } else if (/^-?\d/.test(match)) {
          cls = 'text-blue-600'
        }
        return `<span class="${cls}">${match}</span>`
      },
    )
}

export function JsonPayloadViewer({
  value,
  title = 'JSON',
  className,
  maxHeight = 280,
}: JsonPayloadViewerProps) {
  const [copied, setCopied] = useState(false)

  const { pretty, html } = useMemo(() => {
    let pretty = ''
    try {
      pretty = JSON.stringify(value ?? {}, null, 2)
    } catch {
      pretty = String(value)
    }
    const html = highlight(pretty)
    return { pretty, html }
  }, [value])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pretty)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
          <Braces className="h-3.5 w-3.5 text-slate-500" />
          {title}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copy}
          className="h-7 gap-1.5 px-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <ScrollArea style={{ maxHeight }}>
        <pre
          className="overflow-x-auto p-3 text-[11px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </ScrollArea>
    </div>
  )
}

export default JsonPayloadViewer
