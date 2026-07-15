// components/admin/AdminFooter.tsx
'use client'

import { useState, useEffect } from 'react'
import { Heart, Shield, Clock, GitBranch, Circle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function AdminFooter() {
  const [systemStatus, setSystemStatus] = useState('operational')
  const [currentTime, setCurrentTime] = useState('')
  const [version, setVersion] = useState('v2.1.0')

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString())
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'operational': return 'text-green-500'
      case 'degraded': return 'text-amber-500'
      case 'down': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3 text-xs text-muted-foreground">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <span>© {new Date().getFullYear()} RentEase Admin Panel</span>
          <Separator orientation="vertical" className="h-4 hidden md:block" />
          <span className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500" /> for administrators
          </span>
        </div>

        {/* Center Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Circle className={cn("h-2 w-2 fill-current", getStatusColor())} />
              <span>System: {systemStatus}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{currentTime}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              <span>{version}</span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <a href="/admin/docs" className="hover:text-foreground transition-colors">
            Documentation
          </a>
          <a href="/admin/status" className="hover:text-foreground transition-colors">
            Status Page
          </a>
          <a href="/support" className="hover:text-foreground transition-colors">
            Support
          </a>
          <Badge variant="outline" className="text-[10px]">
            <Shield className="h-3 w-3 mr-1" />
            Secure Connection
          </Badge>
        </div>
      </div>
    </footer>
  )
}