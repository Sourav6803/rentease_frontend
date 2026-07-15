// components/delivery/layout/DeliveryMenuItemsData.ts
import {
  Home,
  Calendar,
  Navigation,
  History,
  User,
  DollarSign,
  Settings,
  HelpCircle,
  Award,
  MapPin,
  Clock,
  TrendingUp,
} from 'lucide-react';

export const deliveryMenuItems = [
  { 
    name: 'Dashboard', 
    href: '/delivery', 
    icon: Home,
    description: 'Overview & daily stats'
  },
  { 
    name: 'Today\'s Deliveries', 
    href: '/delivery/today', 
    icon: Calendar,
    description: 'View today\'s assignments',
    badge: '6'
  },
  { 
    name: 'Active Delivery', 
    href: '/delivery/active', 
    icon: Navigation,
    description: 'Current delivery tracking'
  },
  { 
    name: 'History', 
    href: '/delivery/history', 
    icon: History,
    description: 'Past deliveries'
  },
  { 
    name: 'Earnings', 
    href: '/delivery/earnings', 
    icon: DollarSign,
    description: 'View earnings & incentives'
  },
  { 
    name: 'Performance', 
    href: '/delivery/performance', 
    icon: TrendingUp,
    description: 'Performance metrics',
    badge: 'New'
  },
  { 
    name: 'Profile', 
    href: '/delivery/profile', 
    icon: User,
    description: 'Personal information'
  },
];