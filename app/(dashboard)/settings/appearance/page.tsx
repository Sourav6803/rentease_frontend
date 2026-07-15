'use client'

import { useState, useEffect } from 'react'
import { Palette, Sparkles, Eye } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SettingsCard, PremiumSwitch } from '../components'
import { useSettings } from '../use-settings'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor, Check } from 'lucide-react'

interface AppearanceData {
  theme: 'light' | 'dark' | 'system'
  compactView: boolean
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large'
  accentColor: string
}

const accentColors = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Green', value: '#10B981' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Indigo', value: '#6366F1' },
]

export default function AppearanceSettingsPage() {
  const { fetchSettings, updateSection } = useSettings()
  const [settings, setSettings] = useState<AppearanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchSettings().then(data => {
      if (!isMounted) return
      if (data) setSettings(data.appearance)
      setIsLoading(false)
    })
    return () => { isMounted = false }
  }, [fetchSettings])

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    if (!settings) return
    const newAppearance = { ...settings, theme }
    const success = await updateSection('appearance', newAppearance)
    if (success) {
      setSettings(newAppearance)
    }
  }

  const handleToggle = async (field: keyof Omit<AppearanceData, 'theme' | 'accentColor'>, checked: boolean) => {
    if (!settings) return
    const newAppearance = { ...settings, [field]: checked }
    const success = await updateSection('appearance', newAppearance)
    if (success) {
      setSettings(newAppearance)
    }
  }

  const handleAccentColor = async (color: string) => {
    if (!settings) return
    const newAppearance = { ...settings, accentColor: color }
    const success = await updateSection('appearance', newAppearance)
    if (success) {
      setSettings(newAppearance)
    }
  }

  const handleFontSizeChange = async (fontSize: 'small' | 'medium' | 'large') => {
    if (!settings) return
    const newAppearance = { ...settings, fontSize }
    const success = await updateSection('appearance', newAppearance)
    if (success) {
      setSettings(newAppearance)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SettingsCard title="Theme" icon={Palette}>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </SettingsCard>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load appearance settings</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsCard title="Theme" icon={Palette}>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', icon: Sun, color: 'from-yellow-400 to-orange-400' },
            { value: 'dark', label: 'Dark', icon: Moon, color: 'from-gray-700 to-gray-900' },
            { value: 'system', label: 'System', icon: Monitor, color: 'from-blue-400 to-purple-400' },
          ].map((theme) => (
            <motion.button
              key={theme.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleThemeChange(theme.value as 'light' | 'dark' | 'system')}
              className={`p-4 rounded-2xl border-2 text-center transition-all ${
                settings.theme === theme.value
                  ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-purple-500/10 shadow-lg shadow-blue-500/20'
                  : 'border-gray-200 hover:border-blue-500/30'
              }`}
            >
              <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${theme.color} flex items-center justify-center text-white shadow-lg`}>
                <theme.icon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium mt-3">{theme.label}</p>
              {settings.theme === theme.value && (
                <Check className="h-4 w-4 text-blue-500 mx-auto mt-2" />
              )}
            </motion.button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Accent Color" icon={Sparkles}>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {accentColors.map((color) => (
            <motion.button
              key={color.value}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAccentColor(color.value)}
              className={`w-10 h-10 rounded-full transition-all mx-auto ${
                settings.accentColor === color.value
                  ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Display Settings" icon={Eye}>
        <div className="space-y-3">
          <PremiumSwitch
            label="Compact View"
            description="Show more items per page"
            checked={settings.compactView}
            onCheckedChange={(checked) => handleToggle('compactView', checked)}
          />
          <PremiumSwitch
            label="Reduced Motion"
            description="Minimize animations for better accessibility"
            checked={settings.reducedMotion}
            onCheckedChange={(checked) => handleToggle('reducedMotion', checked)}
          />
          <div>
            <Label className="text-sm font-medium text-gray-700">Font Size</Label>
            <Select
              value={settings.fontSize}
              onValueChange={(value: 'small' | 'medium' | 'large') => handleFontSizeChange(value)}
            >
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}
