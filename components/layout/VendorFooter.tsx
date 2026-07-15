'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Sparkles,
  Shield,
  Clock,
  CreditCard,
  ArrowUp,
  Heart,
  Zap,
  Gift,
  Truck,
  Award,
  ThumbsUp,
  Star,
  Headset,
  BarChart3,
  Package,
  TrendingUp,
  DollarSign,
  Users,
  HelpCircle,
  BookOpen,
  FileText,
  MessageCircle,
  Smartphone,
  Store
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import { useState, useEffect, memo } from 'react'

// Vendor Footer Navigation
const vendorFooterNav = {
  platform: {
    title: 'Platform',
    icon: BarChart3,
    links: [
      { name: 'Dashboard', href: '/vendor/dashboard', description: 'Overview & metrics' },
      { name: 'Products', href: '/vendor/products', description: 'Manage inventory', badge: 'New' },
      { name: 'Orders', href: '/vendor/orders', description: 'Track rentals' },
      { name: 'Analytics', href: '/vendor/analytics', description: 'Performance insights' },
      { name: 'Payouts', href: '/vendor/payouts', description: 'Earnings history' },
    ]
  },
  resources: {
    title: 'Resources',
    icon: BookOpen,
    links: [
      { name: 'Seller Guide', href: '/vendor/guide', description: 'Get started' },
      { name: 'API Documentation', href: '/vendor/api', description: 'Integrate with us' },
      { name: 'Success Stories', href: '/vendor/success-stories', description: 'Learn from top sellers' },
      { name: 'Webinars', href: '/vendor/webinars', description: 'Live training' },
      { name: 'Blog', href: '/blog', description: 'Latest updates' },
    ]
  },
  support: {
    title: 'Support',
    icon: Headset,
    links: [
      { name: 'Help Center', href: '/vendor/help', description: 'FAQs & guides' },
      { name: 'Contact Support', href: '/vendor/contact', description: '24/7 assistance', badge: 'Priority' },
      { name: 'Community', href: '/vendor/community', description: 'Connect with sellers' },
      { name: 'Report Issue', href: '/vendor/report', description: 'Report a problem' },
      { name: 'Status', href: '/status', description: 'System status' },
    ]
  },
  legal: {
    title: 'Legal',
    icon: Shield,
    links: [
      { name: 'Vendor Agreement', href: '/vendor/agreement' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Commission Structure', href: '/vendor/commission' },
      { name: 'Tax Information', href: '/vendor/tax' },
    ]
  }
}

// Vendor Stats Cards
const vendorStats = [
  { 
    value: '₹1.2Cr+', 
    label: 'Total Sales', 
    description: 'Lifetime earnings',
    icon: DollarSign,
    trend: '+28%',
    color: 'from-emerald-500/20 to-emerald-600/20',
    iconColor: '#10B981'
  },
  { 
    value: '2.5K+', 
    label: 'Active Sellers', 
    description: 'Growing community',
    icon: Users,
    trend: '+156',
    color: 'from-blue-500/20 to-cyan-600/20',
    iconColor: '#3B82F6'
  },
  { 
    value: '98%', 
    label: 'Satisfaction', 
    description: 'Seller rating',
    icon: ThumbsUp,
    trend: '+2%',
    color: 'from-purple-500/20 to-pink-600/20',
    iconColor: '#8B5CF6'
  },
  { 
    value: '24/7', 
    label: 'Support', 
    description: 'Dedicated team',
    icon: Headset,
    trend: 'Always',
    color: 'from-orange-500/20 to-amber-600/20',
    iconColor: '#F59E0B'
  },
]

// Vendor Benefits
const vendorBenefits = [
  { icon: TrendingUp, title: 'Higher Earnings', description: 'Up to 85% commission on sales', color: '#10B981' },
  { icon: Users, title: 'Wide Reach', description: 'Access to 500K+ customers', color: '#3B82F6' },
  { icon: Package, title: 'Easy Management', description: 'Simple inventory tools', color: '#8B5CF6' },
  { icon: Truck, title: 'Logistics Support', description: 'Pan-India delivery', color: '#F59E0B' },
  { icon: Smartphone, title: 'Mobile App', description: 'Manage on the go', color: '#EF4444' },
  { icon: Shield, title: 'Secure Payments', description: 'Weekly payouts', color: '#06B6D4' },
]

// Social Media Links
const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/rentease', color: '#1877F2', bgColor: '#1877F210' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/rentease', color: '#1DA1F2', bgColor: '#1DA1F210' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/rentease', color: '#E4405F', bgColor: '#E4405F10' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/rentease', color: '#0A66C2', bgColor: '#0A66C210' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/rentease', color: '#FF0000', bgColor: '#FF000010' },
]

// Download Badges
const downloadBadges = [
  { name: 'App Store', icon: '🍎', href: '#', bgColor: '#000000' },
  { name: 'Google Play', icon: '🤖', href: '#', bgColor: '#34A853' },
]

// Memoized Benefits Section
const BenefitsSection = memo(() => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 p-8">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,158,11,0.05),transparent_70%)]" />
    
    <div className="relative z-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 mb-3">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium text-primary">Why Partner With Us</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          Grow Your Business with RentEase
        </h3>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Join thousands of successful sellers and take your business to the next level
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendorBenefits.map((benefit, index) => (
          <div
            key={benefit.title}
            className="group relative p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${benefit.color}20 opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/10 group-hover:scale-110 transition-transform">
                <benefit.icon className="w-5 h-5" style={{ color: benefit.color }} />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">{benefit.title}</h4>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button className="group relative overflow-hidden bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          <span className="relative z-10">Start Selling Today</span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </Button>
      </div>
    </div>
  </div>
))

BenefitsSection.displayName = 'BenefitsSection'

// Memoized Stats Section
const StatsSection = memo(() => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {vendorStats.map((stat, index) => (
      <div
        key={stat.label}
        className="group relative p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
      >
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {stat.value}
            </p>
            <p className="text-sm font-medium mt-1">{stat.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.description}</p>
          </div>
          <div className="p-2 rounded-lg bg-white/10">
            <stat.icon className="w-4 h-4" style={{ color: stat.iconColor }} />
          </div>
        </div>
        <div className="relative mt-2">
          <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10">
            {stat.trend}
          </Badge>
        </div>
      </div>
    ))}
  </div>
))

StatsSection.displayName = 'StatsSection'

// Newsletter Section
const NewsletterSection = memo(({ email, setEmail, isSubscribing, handleSubscribe }: any) => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(245,158,11,0.1),transparent_70%)]" />
    
    <div className="relative z-10 grid md:grid-cols-2 gap-6 items-center">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 mb-3">
          <Mail className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium text-primary">Stay Updated</span>
        </div>
        <h3 className="text-xl md:text-2xl font-bold mb-2">
          Vendor Newsletter
        </h3>
        <p className="text-sm text-muted-foreground">
          Get weekly insights, tips, and exclusive offers for sellers.
        </p>
      </div>
      
      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-9 bg-background/50 backdrop-blur-sm border-white/10 focus:border-primary/50"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isSubscribing}
          className="group relative overflow-hidden bg-gradient-to-r from-primary to-secondary"
        >
          <span className="relative z-10">{isSubscribing ? 'Subscribing...' : 'Subscribe'}</span>
        </Button>
      </form>
    </div>
  </div>
))

NewsletterSection.displayName = 'NewsletterSection'

// Main Footer Component
export function VendorFooter() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [currentYear, setCurrentYear] = useState(2024)
  const pathname = usePathname()
  const toast = useToast()

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribing(true)

    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success('Subscribed successfully!', {
      description: 'You will receive vendor updates and insights.',
    })
    setEmail('')
    setIsSubscribing(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Don't render footer on non-vendor pages
  if (!pathname?.startsWith('/vendor')) {
    return null
  }

  return (
    <footer className="relative bg-gradient-to-b from-background via-background to-muted/30 border-t mt-auto">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Stats Section */}
      <div className="container relative z-10 pt-12">
        <StatsSection />
      </div>

      {/* Benefits Section */}
      <div className="container relative z-10 py-12">
        <BenefitsSection />
      </div>

      {/* Main Footer Content */}
      <div className="container relative z-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-6">
            <Link href="/vendor/dashboard" className="inline-block group">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <Store size={20} className="text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    RentEase
                  </span>
                  <p className="text-xs text-primary">Vendor Portal</p>
                </div>
              </div>
            </Link>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              India's fastest-growing rental platform. Join thousands of successful sellers and grow your business with RentEase.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              {[
                { icon: Phone, text: '+91 98765 43210', href: 'tel:+919876543210' },
                { icon: Mail, text: 'vendor@rentease.com', href: 'mailto:vendor@rentease.com' },
                { icon: Headset, text: '24/7 Vendor Support', href: '/vendor/contact' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm group">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  <a href={item.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {item.text}
                  </a>
                </div>
              ))}
            </div>

            {/* Download Badges */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Download Vendor App</p>
              <div className="flex gap-2">
                {downloadBadges.map((badge) => (
                  <a
                    key={badge.name}
                    href={badge.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
                    style={{ color: badge.bgColor }}
                  >
                    <span className="text-sm">{badge.icon}</span>
                    <span className="text-xs font-medium">{badge.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2 rounded-lg transition-all hover:-translate-y-1"
                  style={{ background: social.bgColor }}
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4 transition-colors group-hover:text-white" style={{ color: social.color }} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {Object.entries(vendorFooterNav).map(([key, section]) => (
            <div key={key} className="space-y-4">
              <div className="flex items-center gap-2">
                <section.icon className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {section.title}
                </h3>
              </div>
              <ul className="space-y-2">
                {section.links.map((link: any) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-all duration-200"
                    >
                      <span className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        {link.name}
                      </span>
                      {link.badge && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary">
                          {link.badge}
                        </Badge>
                      )}
                    </Link>
                    {link.description && (
                      <p className="text-xs text-muted-foreground/60 mt-0.5 pl-5">{link.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-12">
          <NewsletterSection
            email={email}
            setEmail={setEmail}
            isSubscribing={isSubscribing}
            handleSubscribe={handleSubscribe}
          />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© {currentYear} RentEase. All rights reserved.</span>
              <Separator orientation="vertical" className="h-4 hidden md:block" />
              <span className="flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> for vendors
              </span>
            </div>

            <div className="flex items-center gap-6">
              {/* Commission Badge */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Award className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-500">Up to 85% Commission</span>
              </div>

              {/* Back to Top Button */}
              <Button
                variant="outline"
                size="icon"
                className="rounded-full hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:border-transparent hover:text-white transition-all duration-300 group"
                onClick={scrollToTop}
                aria-label="Back to top"
              >
                <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </footer>
  )
}