import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  Clock,
  AlertCircle,
  DollarSign,
  ArrowLeftRight,
  FileText,
  Download,
  Database,
  Warehouse,
  MessageSquare,
  FolderTree,
  Tag,
  Layers,
  Sparkles,
  Image,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Eye,
  Grid,
  List,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  DownloadCloud,
  UploadCloud,
  RefreshCw,
  Home,
  Mail,
  Phone,
  MapPin,
  Star,
  Heart,
  Truck,
  Wrench,
  HelpCircle,
  Info,
  Menu,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu as HamburgerIcon,
  Activity,
  Key,
  UserCog,
  Bike,
  Route,
  Brain,
  Megaphone,
  Bell,
  Target,
  Lightbulb,
  LayoutGrid,
  TicketPercent,
  ScanEye,
  ClipboardList,
} from 'lucide-react'

const menuItems = {
  'super-admin': [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: LayoutDashboard, 
      exact: true,
      description: 'Overview & key metrics'
    },
    
    // ==================== VENDOR MANAGEMENT ====================
    {
      name: 'Vendors', 
      icon: Store,
      description: 'Manage vendor accounts',
      children: [
        { 
          name: 'All Vendors', 
          href: '/admin/vendors/all-vendors', 
          icon: Users,
          description: 'View and manage all vendors'
        },
        { 
          name: 'Pending Approval', 
          href: '/admin/vendors/approval', 
          icon: Clock, 
          description: 'Vendors awaiting verification'
        },
        { 
          name: 'Commission Rates', 
          href: '/admin/vendors/commission-rates', 
          icon: DollarSign,
          description: 'Configure vendor commissions'
        },
        { 
          name: 'Vendor Analytics', 
          href: '/admin/vendors/analytics', 
          icon: TrendingUp,
          description: 'Vendor performance metrics'
        },
      ],
    },

    // ==================== USER MANAGEMENT ====================
    {
      name: 'Users', 
      icon: Users,
      description: 'Manage customer accounts',
      children: [
        { 
          name: 'All Users', 
          href: '/admin/users', 
          icon: Users,
          description: 'View all registered users'
        },
        { 
          name: 'KYC Verification', 
          href: '/admin/users/kyc', 
          icon: Shield, 
          description: 'Pending KYC documents'
        },
        { 
          name: 'Blocked Users', 
          href: '/admin/users/blocked', 
          icon: AlertCircle,
          description: 'Restricted accounts'
        },
        { 
          name: 'User Analytics', 
          href: '/admin/users/analytics', 
          icon: BarChart3,
          description: 'User behavior insights'
        },
      ],
    },

    // ==================== PRODUCT MANAGEMENT ====================
    {
      name: 'Products', 
      icon: Package,
      description: 'Manage product catalog',
      children: [
        { 
          name: 'All Products', 
          href: '/admin/products/all', 
          icon: Package,
          description: 'View all products'
        },
        { 
          name: 'Pending Approval', 
          href: '/admin/products/pending', 
          icon: Clock, 
          description: 'Products awaiting moderation'
        },
        { 
          name: 'Featured Products', 
          href: '/admin/products/featured', 
          icon: Star,
          description: 'Manage featured items'
        },
        { 
          name: 'Product Reviews', 
          href: '/admin/products/reviews', 
          icon: MessageSquare,
          description: 'Moderate product reviews'
        },
      ],
    },

    // ==================== CATEGORY MANAGEMENT ====================
    {
      name: 'Categories', 
      icon: FolderTree,
      description: 'Manage category hierarchy',
      children: [
        { 
          name: 'All Categories', 
          href: '/admin/categories', 
          icon: Grid,
          description: 'View all categories'
        },
        { 
          name: 'Add Category', 
          href: '/admin/categories/add', 
          icon: Plus,
          description: 'Create new category'
        },
        { 
          name: 'AI Category Builder', 
          href: '/admin/categories/ai-builder', 
          icon: Sparkles,
          badge: 'New',
          description: 'AI-powered category creation'
        },
        { 
          name: 'Category Attributes', 
          href: '/admin/categories/attributes', 
          icon: Tag,
          description: 'Manage product attributes'
        },
        { 
          name: 'Category Hierarchy', 
          href: '/admin/categories/hierarchy', 
          icon: Layers,
          description: 'Organize category structure'
        },
        { 
          name: 'Bulk Import/Export', 
          href: '/admin/categories/import-export', 
          icon: DownloadCloud,
          description: 'Import/export categories'
        },
      ],
    },

    // ==================== RENTAL MANAGEMENT ====================
    {
      name: 'Rentals', 
      icon: ShoppingBag,
      description: 'Manage rental orders',
      children: [
        { 
          name: 'All Rentals', 
          href: '/admin/rentals', 
          icon: ShoppingBag,
          description: 'View all rental transactions'
        },
        { 
          name: 'Active', 
          href: '/admin/rentals/active', 
          icon: Activity,
          description: 'Currently active rentals'
        },
        { 
          name: 'Pending', 
          href: '/admin/rentals/pending', 
          icon: Clock,
          description: 'Awaiting confirmation'
        },
        { 
          name: 'Disputes', 
          href: '/admin/rentals/disputes', 
          icon: AlertCircle, 
          description: 'Customer disputes'
        },
        { 
          name: 'Overdue', 
          href: '/admin/rentals/overdue', 
          icon: AlertCircle,
          description: 'Late returns'
        },
        { 
          name: 'Completed', 
          href: '/admin/rentals/completed', 
          icon: CheckCircle,
          description: 'Completed rentals'
        },
        { 
          name: 'Cancelled', 
          href: '/admin/rentals/cancelled', 
          icon: XCircle,
          description: 'Cancelled orders'
        },
      ],
    },

    // ==================== DELIVERY MANAGEMENT ====================
{
  name: 'Delivery',
  icon: Truck,
  description: 'Manage delivery operations',
  children: [
    {
      name: 'Overview',
      href: '/admin/delivery',
      icon: LayoutDashboard,
      description: 'Delivery management dashboard'
    },
    {
      name: 'Delivery Personnel',
      href: '/admin/delivery/personnel',
      icon: Bike,
      description: 'Manage delivery agents'
    },
    {
      name: 'Create Personnel',
      href: '/admin/delivery/personnel/create',
      icon: UserCog,
      description: 'Add new delivery person'
    },
    {
      name: 'Teams',
      href: '/admin/delivery/teams',
      icon: Users,
      description: 'Manage delivery teams'
    },
    {
      name: 'Create Team',
      href: '/admin/delivery/teams/create',
      icon: Plus,
      description: 'Create new delivery team'
    },
    {
      name: 'Assignments',
      href: '/admin/delivery/assignments',
      icon: Route,
      description: 'Manage delivery assignments'
    },
    {
      name: 'Analytics',
      href: '/admin/delivery/analytics',
      icon: TrendingUp,
      description: 'Delivery performance analytics'
    },
  ],
},

    // ==================== PAYMENT MANAGEMENT ====================
    {
      name: 'Payments', 
      icon: CreditCard,
      description: 'Manage transactions',
      children: [
        { 
          name: 'Transactions', 
          href: '/admin/payments', 
          icon: CreditCard,
          description: 'All payment transactions'
        },
        { 
          name: 'Vendor Payouts', 
          href: '/admin/payments/payouts', 
          icon: DollarSign,
          description: 'Process vendor payments'
        },
        { 
          name: 'Refunds', 
          href: '/admin/payments/refunds', 
          icon: ArrowLeftRight,
          description: 'Process refunds'
        },
        { 
          name: 'Payment Gateway', 
          href: '/admin/payments/gateway', 
          icon: Settings,
          description: 'Configure payment methods'
        },
        { 
          name: 'Tax Reports', 
          href: '/admin/payments/tax', 
          icon: FileText,
          description: 'Tax summaries'
        },
      ],
    },

// ==================== INTELLIGENCE SUITE (NEW) ====================
     {
       name: 'Intelligence',
       icon: Sparkles,
       description: 'Business intelligence & automation',
       children: [
         {
           name: 'Intelligence Hub',
           href: '/admin/intelligence',
           icon: LayoutGrid,
           badge: 'New',
           description: 'Central command for all intelligence modules',
         },
         {
           name: 'Analytics Dashboard',
           href: '/admin/intelligence/analytics',
           icon: BarChart3,
           description: 'Overview cards, charts & KPIs',
         },
         {
           name: 'Coupons & Offers',
           href: '/admin/intelligence/coupons',
           icon: TicketPercent,
           description: 'Discount & promotion management',
         },
         {
           name: 'Customer CRM',
           href: '/admin/intelligence/crm',
           icon: Users,
           description: 'Customer 360 & email outreach',
         },
         {
           name: 'Marketing Automation',
           href: '/admin/intelligence/marketing',
           icon: Megaphone,
           description: 'Workflows, campaigns & segments',
         },
         {
           name: 'Product Intelligence',
           href: '/admin/intelligence/products',
           icon: Package,
           description: 'Product performance & demand signals',
         },
         {
           name: 'Behavior Tracking',
           href: '/admin/intelligence/behavior',
           icon: ScanEye,
           description: 'User events, funnels & sessions',
         },
         {
           name: 'Interest Monitor',
           href: '/admin/intelligence/interests',
           icon: Target,
           description: 'High-intent product signals',
         },
         {
           name: 'Recommendations',
           href: '/admin/intelligence/recommendations',
           icon: Lightbulb,
           description: 'Recommendation engine preview',
         },
         {
           name: 'Vendor Performance',
           href: '/admin/intelligence/vendors',
           icon: Store,
           description: 'Vendor leaderboard & KPIs',
         },
         {
           name: 'Notification Center',
           href: '/admin/intelligence/notifications',
           icon: Bell,
           description: 'Broadcast & delivery monitoring',
         },
         {
           name: 'Banners',
           href: '/admin/banners',
           icon: Image,
           description: 'Manage homepage banners and promotions',
           badge: 'New',
         },
         {
           name: 'Operations Command',
           href: '/admin/intelligence/operations',
           icon: ClipboardList,
           description: 'Deliveries, pickups & daily ops',
         },
         {
           name: 'AI Insights',
           href: '/admin/intelligence/ai-insights',
           icon: Brain,
           description: 'Automated business insights',
         },
       ],
     },

    // ==================== ANALYTICS & REPORTS ====================
    {
      name: 'Analytics', 
      icon: BarChart3,
      description: 'Platform insights',
      children: [
        { 
          name: 'Overview', 
          href: '/admin/analytics', 
          icon: BarChart3,
          description: 'Key metrics dashboard'
        },
        { 
          name: 'Revenue Reports', 
          href: '/admin/analytics/revenue', 
          icon: TrendingUp,
          description: 'Financial performance'
        },
        { 
          name: 'User Analytics', 
          href: '/admin/analytics/users', 
          icon: Users,
          description: 'User behavior metrics'
        },
        { 
          name: 'Vendor Analytics', 
          href: '/admin/analytics/vendors', 
          icon: Store,
          description: 'Vendor performance'
        },
        { 
          name: 'Product Analytics', 
          href: '/admin/analytics/products', 
          icon: Package,
          description: 'Product performance'
        },
        { 
          name: 'Category Analytics', 
          href: '/admin/analytics/categories', 
          icon: FolderTree,
          description: 'Category insights'
        },
        { 
          name: 'Reports', 
          href: '/admin/analytics/reports', 
          icon: FileText,
          description: 'Generate custom reports'
        },
        { 
          name: 'Export Data', 
          href: '/admin/analytics/export', 
          icon: Download,
          description: 'Export analytics data'
        },
      ],
    },

    // ==================== SYSTEM SETTINGS ====================
    {
      name: 'System', 
      icon: Settings,
      description: 'Platform configuration',
      children: [
        { 
          name: 'General', 
          href: '/admin/settings/general', 
          icon: Settings,
          description: 'General platform settings'
        },
        { 
          name: 'Admins', 
          href: '/admin/settings/admins', 
          icon: Shield,
          description: 'Manage admin accounts'
        },
        { 
          name: 'Roles & Permissions', 
          href: '/admin/settings/roles&permissions', 
          icon: Users,
          description: 'Configure access control'
        },
        { 
          name: 'Email Settings', 
          href: '/admin/settings/email', 
          icon: Mail,
          description: 'Configure email templates'
        },
        { 
          name: 'SMS Settings', 
          href: '/admin/settings/sms', 
          icon: MessageSquare,
          description: 'Configure SMS alerts'
        },
        { 
          name: 'Payment Gateway', 
          href: '/admin/settings/payments-gateway', 
          icon: CreditCard,
          description: 'Payment provider settings'
        },
        { 
          name: 'System Logs', 
          href: '/admin/settings/system-logs', 
          icon: FileText,
          description: 'Audit trail'
        },
        { 
          name: 'Backup', 
          href: '/admin/settings/backup', 
          icon: Database,
          description: 'Database backup'
        },
        { 
          name: 'API Keys', 
          href: '/admin/settings/api-keys', 
          icon: Key,
          description: 'Manage API credentials'
        },
      ],
    },
  ],

  // ==================== ADMIN ROLE (Limited Access) ====================
  admin: [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: LayoutDashboard, 
      exact: true 
    },
    {
      name: 'Vendors', 
      icon: Store,
      children: [
        { name: 'All Vendors', href: '/admin/vendors', icon: Users },
        { name: 'Pending Approval', href: '/admin/vendors/approval', icon: Clock },
      ],
      users: [
        { name: 'All Users', href: '/admin/users', icon: Users },
        { name: 'KYC Verification', href: '/admin/users/kyc', icon: Shield },
      ],
    },
    {
      name: 'Products', 
      icon: Package,
      children: [
        { name: 'All Products', href: '/admin/products', icon: Package },
        { name: 'Pending Approval', href: '/admin/products/pending', icon: Clock },
      ],
    },
    {
      name: 'Categories',
      icon: FolderTree,
      children: [
        { name: 'All Categories', href: '/admin/categories', icon: Grid },
        { name: 'Add Category', href: '/admin/categories/add', icon: Plus },
      ],
    },
    { name: 'Rentals', icon: ShoppingBag, href: '/admin/rentals' },
    { name: 'Payments', icon: CreditCard, href: '/admin/payments' },
    { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    {
      name: 'Intelligence',
      icon: Sparkles,
      children: [
        { name: 'Intelligence Hub', href: '/admin/intelligence', icon: LayoutGrid, badge: 'New' },
        { name: 'Analytics Dashboard', href: '/admin/intelligence/analytics', icon: BarChart3 },
        { name: 'Coupons & Offers', href: '/admin/intelligence/coupons', icon: TicketPercent },
        { name: 'Customer CRM', href: '/admin/intelligence/crm', icon: Users },
        { name: 'AI Insights', href: '/admin/intelligence/ai-insights', icon: Brain },
      ],
    },
  ],

  // ==================== OPERATIONS MANAGER ====================
  operations_manager: [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Vendors', icon: Store, href: '/admin/vendors' },
    { name: 'Products', icon: Package, href: '/admin/products' },
    { 
      name: 'Categories', 
      icon: FolderTree, 
      href: '/admin/categories',
      description: 'Manage category structure'
    },
    { name: 'Rentals', icon: ShoppingBag, href: '/admin/rentals' },
    { name: 'Inventory', icon: Warehouse, href: '/admin/inventory' },
    { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    {
      name: 'Intelligence',
      icon: Sparkles,
      children: [
        { name: 'Operations Command', href: '/admin/intelligence/operations', icon: ClipboardList },
        { name: 'Product Intelligence', href: '/admin/intelligence/products', icon: Package },
        { name: 'Vendor Performance', href: '/admin/intelligence/vendors', icon: Store },
      ],
    },
  ],

  // ==================== SUPPORT MANAGER ====================
  support_manager: [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', icon: Users, href: '/admin/users' },
    { name: 'Rentals', icon: ShoppingBag, href: '/admin/rentals' },
    { 
      name: 'Categories', 
      icon: FolderTree, 
      href: '/admin/categories',
      description: 'Browse category structure'
    },
    { name: 'Tickets', icon: MessageSquare, href: '/admin/tickets' },
    { name: 'Disputes', icon: AlertCircle, href: '/admin/disputes' },
    { name: 'Reviews', icon: Star, href: '/admin/reviews' },
    {
      name: 'Intelligence',
      icon: Sparkles,
      children: [
        { name: 'Customer CRM', href: '/admin/intelligence/crm', icon: Users },
        { name: 'Notification Center', href: '/admin/intelligence/notifications', icon: Bell },
      ],
    },
  ],

  // ==================== FINANCE MANAGER ====================
  finance_manager: [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Payments', icon: CreditCard, href: '/admin/payments' },
    { name: 'Payouts', icon: DollarSign, href: '/admin/payouts' },
    { name: 'Reports', icon: FileText, href: '/admin/reports' },
    { name: 'Tax Reports', icon: FileText, href: '/admin/tax' },
    {
      name: 'Intelligence',
      icon: Sparkles,
      children: [
        { name: 'Coupons & Offers', href: '/admin/intelligence/coupons', icon: TicketPercent },
        { name: 'Analytics Dashboard', href: '/admin/intelligence/analytics', icon: BarChart3 },
      ],
    },
  ],

  // ==================== INVENTORY MANAGER ====================
  inventory_manager: [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', icon: Package, href: '/admin/products' },
    { 
      name: 'Categories', 
      icon: FolderTree, 
      href: '/admin/categories',
      description: 'Organize products by category'
    },
    { name: 'Inventory', icon: Warehouse, href: '/admin/inventory' },
    { name: 'Stock Alerts', icon: AlertCircle, href: '/admin/inventory/alerts' },
    { name: 'Bulk Import', icon: UploadCloud, href: '/admin/inventory/import' },
  ],

  // ==================== CONTENT MANAGER ====================
  content_manager: [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { 
      name: 'Categories', 
      icon: FolderTree, 
      href: '/admin/categories',
      description: 'Manage category content'
    },
    { name: 'Blog', icon: FileText, href: '/admin/blog' },
    { name: 'FAQs', icon: HelpCircle, href: '/admin/faqs' },
    { name: 'Pages', icon: FileText, href: '/admin/pages' },
    { name: 'Media Library', icon: Image, href: '/admin/media' },
    {
      name: 'Intelligence',
      icon: Sparkles,
      children: [
        { name: 'Marketing Automation', href: '/admin/intelligence/marketing', icon: Megaphone },
        { name: 'Notification Center', href: '/admin/intelligence/notifications', icon: Bell },
      ],
    },
  ],

  // ==================== ANALYTICS VIEWER (Read-Only) ====================
  analytics_viewer: [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { 
      name: 'Categories', 
      icon: FolderTree, 
      href: '/admin/categories',
      description: 'View category performance'
    },
    { name: 'Reports', icon: FileText, href: '/admin/reports' },
    { name: 'Export', icon: Download, href: '/admin/export' },
    {
      name: 'Intelligence',
      icon: Sparkles,
      children: [
        { name: 'Intelligence Hub', href: '/admin/intelligence', icon: LayoutGrid },
        { name: 'Analytics Dashboard', href: '/admin/intelligence/analytics', icon: BarChart3 },
        { name: 'Product Intelligence', href: '/admin/intelligence/products', icon: Package },
        { name: 'Behavior Tracking', href: '/admin/intelligence/behavior', icon: ScanEye },
        { name: 'AI Insights', href: '/admin/intelligence/ai-insights', icon: Brain },
      ],
    },
  ],

  // ==================== AUDITOR ====================
  auditor: [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Audit Logs', icon: FileText, href: '/admin/audit-logs' },
    { name: 'Compliance', icon: Shield, href: '/admin/compliance' },
    { 
      name: 'Categories', 
      icon: FolderTree, 
      href: '/admin/categories',
      description: 'Review category structure'
    },
    { name: 'System Logs', icon: Activity, href: '/admin/system-logs' },
  ],
}

export default menuItems