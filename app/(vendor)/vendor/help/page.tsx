// app/vendor/help/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  Users,
  DollarSign,
  Package,
  Truck,
  CreditCard,
  AlertCircle,
  MessageSquare,
  Headphones,
  Globe,
  Twitter,
  Facebook,
  Linkedin,
  Send,
  Paperclip,
  Smile,
  Mic,
  Image as ImageIcon,
  Star,
  Award,
  Target,
  Sparkles,
  Rocket,
  Heart,
  Bell,
  Settings,
  User,
  Lock,
  FileQuestion,
  GraduationCap,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Volume2,
  Maximize,
  Download,
  Share2,
  Bookmark,
  Flag,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ─── Types ──────────────────────────────────────────────────────────

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  views: number;
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'support';
  timestamp: Date;
  attachments?: string[];
}

interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  views: number;
  likes: number;
}

interface KnowledgeBase {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  helpful: number;
  views: number;
  updatedAt: Date;
}

// ─── Mock Data ───────────────────────────────────────────────────────

const FAQs: FAQ[] = [
  {
    id: '1',
    question: 'How do I list a new product for rent?',
    answer: 'To list a new product, go to Products > Add New Product. Fill in the product details including title, description, category, pricing, and inventory. Upload photos and set availability schedule. Click "Publish" to make it live.',
    category: 'getting-started',
    helpful: 234,
    views: 1250,
  },
  {
    id: '2',
    question: 'How are rental payments processed?',
    answer: 'Rentals are processed through our secure payment gateway. Customers pay upfront for the rental period. Funds are held in escrow and released to you 24 hours after the rental starts, minus our platform fee (typically 10-15%).',
    category: 'payments',
    helpful: 189,
    views: 980,
  },
  {
    id: '3',
    question: 'What happens if a customer damages my product?',
    answer: 'We offer comprehensive protection plans. You can require a security deposit which is held during the rental. For damages, you can file a claim within 48 hours of rental return. Our team reviews evidence and facilitates compensation.',
    category: 'protection',
    helpful: 321,
    views: 1450,
  },
  {
    id: '4',
    question: 'How do I handle returns and cancellations?',
    answer: 'Returns can be processed through the Rental Management dashboard. Customers can request returns within 24 hours of receiving the item. You have 48 hours to inspect and approve returns. Cancellations follow our tiered policy based on timing.',
    category: 'operations',
    helpful: 156,
    views: 870,
  },
  {
    id: '5',
    question: 'How can I improve my product visibility?',
    answer: 'Optimize your listings with high-quality photos, detailed descriptions, competitive pricing, and fast response times. Encourage positive reviews and maintain high ratings. Featured listings are available for premium visibility.',
    category: 'marketing',
    helpful: 278,
    views: 2100,
  },
];

const recentTickets: Ticket[] = [
  {
    id: 'TK-1234',
    subject: 'Payment delay issue',
    description: 'Payment for rental #R-5678 has not been released yet...',
    status: 'in-progress',
    priority: 'high',
    category: 'payments',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    messages: [],
  },
  {
    id: 'TK-1235',
    subject: 'Customer dispute about damage',
    description: 'Customer claims product arrived damaged...',
    status: 'open',
    priority: 'urgent',
    category: 'disputes',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    messages: [],
  },
];

const guides: Guide[] = [
  {
    id: '1',
    title: 'Getting Started with RentEase',
    description: 'Complete guide for new vendors',
    category: 'getting-started',
    duration: '15 min',
    level: 'beginner',
    thumbnail: '/thumbnails/getting-started.jpg',
    views: 5200,
    likes: 234,
  },
  {
    id: '2',
    title: 'Optimizing Your Listings',
    description: 'Tips to increase bookings',
    category: 'marketing',
    duration: '10 min',
    level: 'intermediate',
    thumbnail: '/thumbnails/optimization.jpg',
    views: 3450,
    likes: 189,
  },
];

// ─── Components ──────────────────────────────────────────────────────

// Search Bar Component
const SearchBar: React.FC<{ onSearch: (query: string) => void }> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <div className={cn(
        "relative transition-all duration-300",
        isFocused ? "scale-105" : "scale-100"
      )}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search help articles, guides, and FAQs..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="pl-12 pr-32 py-6 text-base rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
          <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-mono text-gray-500 bg-gray-100 rounded-md border border-gray-200">⌘</kbd>
          <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-mono text-gray-500 bg-gray-100 rounded-md border border-gray-200">K</kbd>
        </div>
      </div>
    </div>
  );
};

// Quick Action Card
const QuickActionCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ icon: Icon, title, description, onClick }) => (
  <Card
    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
      </div>
    </CardContent>
  </Card>
);

// FAQ Item Component
const FAQItem: React.FC<{ faq: FAQ }> = ({ faq }) => {
  const [helpful, setHelpful] = useState(false);
  const [notHelpful, setNotHelpful] = useState(false);

  const handleHelpful = () => {
    setHelpful(!helpful);
    setNotHelpful(false);
    // toast({
    //   title: "Thanks for your feedback!",
    //   description: "Your response helps us improve our content.",
    // });
  };

  const handleNotHelpful = () => {
    setNotHelpful(!notHelpful);
    setHelpful(false);
    // toast({
    //   title: "We'll improve this article",
    //   description: "Thanks for letting us know.",
    // });
  };

  return (
    <AccordionItem value={faq.id} className="border border-gray-200 rounded-lg mb-4 px-4">
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-start gap-3 text-left">
          <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <span className="font-medium text-gray-900">{faq.question}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pb-4 space-y-4">
          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHelpful}
                className={cn("gap-2", helpful && "text-green-600 bg-green-50")}
              >
                <ThumbsUp className="h-4 w-4" />
                Helpful ({faq.helpful})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotHelpful}
                className={cn("gap-2", notHelpful && "text-red-600 bg-red-50")}
              >
                <ThumbsDown className="h-4 w-4" />
                Not Helpful
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Eye className="h-4 w-4" />
              <span>{faq.views} views</span>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

// Ticket Card Component
const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const statusColors = {
    open: 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={statusColors[ticket.status]}>
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </Badge>
              <Badge variant="outline" className={priorityColors[ticket.priority]}>
                {ticket.priority.toUpperCase()}
              </Badge>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{ticket.subject}</h3>
            <p className="text-sm text-gray-500">{ticket.id}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Add Comment</DropdownMenuItem>
              <DropdownMenuItem>Upload Evidence</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Close Ticket</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-gray-600 text-sm mb-4">{ticket.description}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Last updated: {ticket.updatedAt.toLocaleDateString()}</span>
          </div>
          <Button variant="link" className="gap-2 text-blue-600">
            View Conversation
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Category Section Component
const CategorySection: React.FC<{
  title: string;
  icon: React.ElementType;
  items: Array<{ name: string; count: number }>;
}> = ({ title, icon: Icon, items }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <Button
            key={idx}
            variant="ghost"
            className="w-full justify-between hover:bg-gray-50"
          >
            <span>{item.name}</span>
            <Badge variant="secondary" className="bg-gray-100">
              {item.count}
            </Badge>
          </Button>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Live Chat Widget Component
const LiveChatWidget: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      sender: 'support',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    setIsTyping(true);
    
    // Simulate support response
    setTimeout(() => {
      const supportReply: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thanks for reaching out! Our team is looking into your query. We'll get back to you shortly.",
        sender: 'support',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, supportReply]);
      setIsTyping(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-8 w-96 z-50">
      <Card className="shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarFallback>RS</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <CardTitle className="text-white">Support Team</CardTitle>
                <CardDescription className="text-blue-100">
                  Usually replies in 2 min
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.sender === 'user' && "flex-row-reverse"
                  )}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={msg.sender === 'user' ? "bg-blue-600 text-white" : "bg-gray-100"}>
                      {msg.sender === 'user' ? 'U' : 'RS'}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      msg.sender === 'user'
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      msg.sender === 'user' ? "text-blue-200" : "text-gray-500"
                    )}>
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>RS</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Help Page Component
const VendorHelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('faq');

  const filteredFAQs = FAQs.filter(faq => 
    (selectedCategory === 'all' || faq.category === selectedCategory) &&
    (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categories = {
    'getting-started': { name: 'Getting Started', icon: Rocket, count: 12 },
    'payments': { name: 'Payments & Billing', icon: DollarSign, count: 8 },
    'operations': { name: 'Operations', icon: Settings, count: 15 },
    'marketing': { name: 'Marketing & Growth', icon: TrendingUp, count: 10 },
    'protection': { name: 'Protection & Claims', icon: Shield, count: 7 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-0 backdrop-blur-sm">
              <Star className="h-3 w-3 mr-1" />
              Premium Support
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              How can we help you today?
            </h1>
            <p className="text-lg text-blue-100 mb-8">
              Get answers, guides, and support from our expert team
            </p>
            <SearchBar onSearch={setSearchQuery} />
            
            {/* Popular Topics */}
            <div className="mt-8 flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-blue-200">Popular:</span>
              {['Listing Products', 'Payments', 'Returns', 'Disputes', 'Analytics'].map((topic) => (
                <Badge
                  key={topic}
                  variant="secondary"
                  className="cursor-pointer bg-white/10 text-white hover:bg-white/20 transition-colors"
                  onClick={() => setSearchQuery(topic)}
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              icon={MessageSquare}
              title="Contact Support"
              description="Chat with our support team"
              onClick={() => setIsChatOpen(true)}
            />
            <QuickActionCard
              icon={FileQuestion}
              title="Submit Ticket"
              description="Create a support ticket"
              onClick={() => {}}
            />
            <QuickActionCard
              icon={GraduationCap}
              title="Video Tutorials"
              description="Watch step-by-step guides"
              onClick={() => {}}
            />
            <QuickActionCard
              icon={Calendar}
              title="Schedule Demo"
              description="Book a personal walkthrough"
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full md:w-auto grid-cols-2 lg:grid-cols-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="faq" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="guides" className="gap-2">
              <Video className="h-4 w-4" />
              Guides & Tutorials
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              <TicketIcon className="h-4 w-4" />
              My Tickets
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Knowledge Base
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <div className="grid gap-8 lg:grid-cols-4">
              {/* Sidebar Categories */}
              <div className="lg:col-span-1 space-y-6">
                <CategorySection
                  title="Categories"
                  icon={FolderIcon}
                  items={Object.values(categories).map(cat => ({
                    name: cat.name,
                    count: cat.count,
                  }))}
                />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Still need help?</CardTitle>
                    <CardDescription>
                      Can't find what you're looking for?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full gap-2" onClick={() => setIsChatOpen(true)}>
                      <MessageCircle className="h-4 w-4" />
                      Live Chat
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Mail className="h-4 w-4" />
                      Email Support
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* FAQ List */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>
                      {filteredFAQs.length} articles found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {filteredFAQs.map((faq) => (
                        <FAQItem key={faq.id} faq={faq} />
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <Card key={guide.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Video className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="lg" className="rounded-full gap-2">
                        <Play className="h-5 w-5" />
                        Watch Now
                      </Button>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-black/80 border-0">
                      {guide.duration}
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {guide.level}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {guide.category}
                      </Badge>
                    </div>
                    <CardTitle>{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {guide.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {guide.likes}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Bookmark className="h-4 w-4" />
                      Save
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
                <p className="text-gray-500">Track and manage your support requests</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Ticket
              </Button>
            </div>
            <div className="grid gap-4">
              {recentTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: 'Getting Started Guide',
                  description: 'Everything you need to know to start renting',
                  icon: Rocket,
                  readTime: '10 min',
                },
                {
                  title: 'Safety & Security',
                  description: 'Best practices for safe transactions',
                  icon: Shield,
                  readTime: '8 min',
                },
                {
                  title: 'Growth Strategies',
                  description: 'How to scale your rental business',
                  icon: TrendingUp,
                  readTime: '15 min',
                },
              ].map((article, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="p-2 w-12 rounded-lg bg-blue-50 text-blue-600 mb-3">
                      <article.icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{article.title}</CardTitle>
                    <CardDescription>{article.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {article.readTime} read
                    </span>
                    <Button variant="ghost" size="sm" className="gap-2">
                      Read Article
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact Options */}
        <div className="mt-12 pt-8 border-t">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Still have questions?</h2>
            <p className="text-gray-500">Our support team is here to help 24/7</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="p-3 rounded-full bg-blue-50 text-blue-600 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-gray-500 mb-4">Average response: 2 min</p>
                <Button onClick={() => setIsChatOpen(true)} variant="outline" className="w-full">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="p-3 rounded-full bg-green-50 text-green-600 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-gray-500 mb-4">Response within 24 hours</p>
                <Button variant="outline" className="w-full">
                  Send Email
                </Button>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="p-3 rounded-full bg-purple-50 text-purple-600 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p className="text-sm text-gray-500 mb-4">Mon-Fri 9am-6pm EST</p>
                <Button variant="outline" className="w-full">
                  Call Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Live Chat Widget */}
      <LiveChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 group"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </Button>
      )}
    </div>
  );
};

// Helper components
const FolderIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
  </svg>
);

const TicketIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 8v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M10 12h4" />
    <path d="M12 10v4" />
  </svg>
);

const Plus: React.FC<{ className?: string }> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const Eye: React.FC<{ className?: string }> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default VendorHelpPage;