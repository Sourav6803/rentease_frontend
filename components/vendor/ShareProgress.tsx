// src/components/vendor/ShareProgress.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Twitter, Linkedin, Mail, Check } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function ShareProgress() {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = "I just registered as a vendor on RentEase! Excited to start my rental business journey. 🚀"

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
    email: `mailto:?subject=${encodeURIComponent('Check out RentEase')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Progress
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-2">
          <p className="text-sm font-medium">Share your milestone</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => window.open(shareLinks.twitter, '_blank')}
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => window.open(shareLinks.linkedin, '_blank')}
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = shareLinks.email}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Share2 className="h-4 w-4 mr-2" />
            )}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}