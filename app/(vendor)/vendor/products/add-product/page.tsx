// 'use client'

// import { useState, useEffect, useCallback, JSX } from 'react'
// import { useRouter } from 'next/navigation'
// import { useForm, useFieldArray } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import * as z from 'zod'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   Package, Upload, Image as ImageIcon, Video, FileText,
//   ChevronRight, ChevronLeft, Save, Plus, Trash2,
//   X, Loader2, CheckCircle, AlertCircle, Info,
//   HelpCircle, Play, Youtube, ExternalLink, Camera,
//   DollarSign, Truck, Shield, Clock, Star, Tag,
//   Layers, Grid3x3, List, Search, Filter
// } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import { Switch } from '@/components/ui/switch'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Progress } from '@/components/ui/progress'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { Separator } from '@/components/ui/separator'
// import { Checkbox } from '@/components/ui/checkbox'
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
// import { Slider } from '@/components/ui/slider'
// import { useToast } from '@/hooks/useToast'
// import axios from 'axios'
// import Image from 'next/image'
// import Link from 'next/link'
// import { useSession } from 'next-auth/react'

// // Form Schema
// const productSchema = z.object({
//   // Step 1: Basic Info
//   basicInfo: z.object({
//     name: z.string().min(3, 'Product name must be at least 3 characters').max(100, 'Product name cannot exceed 100 characters'),
//     description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description cannot exceed 5000 characters'),
//     brand: z.string().min(2, 'Brand name is required'),
//     model: z.string().optional(),
//   }),
  
//   // Step 2: Category & Attributes
//   category: z.string().min(1, 'Please select a category'),
//   attributes: z.record(z.string(), z.any()).default({}),
  
//   // Step 3: Pricing & Inventory
//   pricing: z.object({
//     monthlyRent: z.number().min(0, 'Monthly rent must be a positive number'),
//     securityDeposit: z.number().min(0, 'Security deposit must be a positive number'),
//     deliveryCharges: z.number().min(0, 'Delivery charges must be a positive number').default(0),
//     lateFeePerDay: z.number().min(0).default(0),
//     rentalOptions: z.array(z.object({
//       months: z.number(),
//       discount: z.number().min(0).max(100),
//     })).default([
//       { months: 3, discount: 0 },
//       { months: 6, discount: 5 },
//       { months: 12, discount: 10 },
//     ]),
//   }),
  
//   // Step 4: Inventory
//   inventory: z.object({
//     totalQuantity: z.number().min(1, 'At least 1 item is required').max(1000),
//     sku: z.string().optional(),
//   }),
  
//   // Step 5: Media
//   media: z.object({
//     images: z.array(z.object({
//       url: z.string(),
//       thumbnail: z.string(),
//       isPrimary: z.boolean(),
//     })).min(1, 'At least one product image is required').max(10, 'Maximum 10 images allowed'),
//     videos: z.array(z.object({
//       url: z.string(),
//       thumbnail: z.string().optional(),
//     })).optional(),
//   }),
  
//   // Step 6: Rental Terms
//   rentalTerms: z.object({
//     minRentalMonths: z.number().min(1).max(12).default(3),
//     maxRentalMonths: z.number().min(1).max(36).default(12),
//     deliveryAvailable: z.boolean().default(true),
//     pickupAvailable: z.boolean().default(true),
//     serviceablePincodes: z.array(z.string()).default([]),
//     termsAndConditions: z.string().optional(),
//   }),
  
//   // Step 7: Specifications & Features
//   specifications: z.record(z.string(), z.string()).default({}),
//   features: z.array(z.string()).default([]),
//   tags: z.array(z.string()).default([]),
  
//   // Condition
//   condition: z.enum(['new', 'like-new', 'good', 'fair', 'refurbished']),
  
//   // Generate AI Description
//   generateDescription: z.boolean().default(false),
// })

// type ProductFormValues = z.infer<typeof productSchema>

// interface Category {
//   _id: string
//   name: string
//   slug: string
//   level: number
//   productCount: number
//   children?: Category[]
//   attributes?: Array<{
//     name: string
//     type: string
//     required: boolean
//     filterable: boolean
//     options?: string[]
//     unit?: string
//   }>
// }

// // Static educational content
// const educationalContent = {
//   videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
//   guides: [
//     { title: 'How to write effective product descriptions', link: '/guides/product-description' },
//     { title: 'Best practices for product photography', link: '/guides/product-photography' },
//     { title: 'Pricing strategies for rental products', link: '/guides/pricing-strategy' },
//     { title: 'Understanding rental terms and conditions', link: '/guides/rental-terms' },
//   ],
//   tips: [
//     'Use high-quality images from multiple angles',
//     'Highlight unique features and benefits',
//     'Set competitive rental prices based on market research',
//     'Include clear condition description',
//     'Add relevant tags for better search visibility',
//   ]
// }

// const conditionOptions = [
//   { value: 'new', label: 'New', description: 'Brand new, never used', color: 'bg-green-500' },
//   { value: 'like-new', label: 'Like New', description: 'Almost new, minimal usage', color: 'bg-emerald-500' },
//   { value: 'good', label: 'Good', description: 'Well maintained, minor signs of use', color: 'bg-blue-500' },
//   { value: 'fair', label: 'Fair', description: 'Visible wear but functional', color: 'bg-amber-500' },
//   { value: 'refurbished', label: 'Refurbished', description: 'Professionally restored', color: 'bg-purple-500' },
// ]

// const stepIcons = [
//   { icon: FileText, title: 'Basic Info', description: 'Product name & description' },
//   { icon: Tag, title: 'Category', description: 'Select category & attributes' },
//   { icon: DollarSign, title: 'Pricing', description: 'Set rental prices' },
//   { icon: Package, title: 'Inventory', description: 'Stock management' },
//   { icon: Camera, title: 'Media', description: 'Images & videos' },
//   { icon: Truck, title: 'Rental Terms', description: 'Delivery & policies' },
//   { icon: Layers, title: 'Specifications', description: 'Technical details' },
// ]

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// export default function AddProductPage() {
//   const router = useRouter()
//   const [currentStep, setCurrentStep] = useState(0)
//   const [isLoading, setIsLoading] = useState(false)
//   const [categories, setCategories] = useState<Category[]>([])
//   const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
//   const [categoryAttributes, setCategoryAttributes] = useState<any[]>([])
//   const [uploadedImages, setUploadedImages] = useState<any[]>([])
//   const [isUploading, setIsUploading] = useState(false)
//   const [showGuide, setShowGuide] = useState(true)
//   const [searchCategory, setSearchCategory] = useState('')
//   const [uploadProgress, setUploadProgress] = useState(0)
//   const toast = useToast()
//   const { data: session } = useSession()
//   const accessToken = session?.user?.accessToken

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     getValues,
//     formState: { errors }
//   } = useForm<ProductFormValues>({
//     resolver: zodResolver(productSchema),
//     defaultValues: {
//       basicInfo: {
//         name: '',
//         description: '',
//         brand: '',
//         model: '',
//       },
//       category: '',
//       attributes: {},
//       pricing: {
//         monthlyRent: 0,
//         securityDeposit: 0,
//         deliveryCharges: 0,
//         lateFeePerDay: 0,
//         rentalOptions: [
//           { months: 3, discount: 0 },
//           { months: 6, discount: 5 },
//           { months: 12, discount: 10 },
//         ],
//       },
//       inventory: {
//         totalQuantity: 1,
//         sku: '',
//       },
//       media: {
//         images: [],
//         videos: [],
//       },
//       rentalTerms: {
//         minRentalMonths: 3,
//         maxRentalMonths: 12,
//         deliveryAvailable: true,
//         pickupAvailable: true,
//         serviceablePincodes: [],
//         termsAndConditions: '',
//       },
//       specifications: {},
//       features: [],
//       tags: [],
//       condition: 'good',
//       generateDescription: false,
//     }
//   })

//   const formValues = watch()
//   const selectedCondition = watch('condition')
//   const selectedRentalTerms = watch('rentalTerms')

//   // Fetch categories
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await axios.get(`${BASE_URL}/api/v1/categories/tree`)
//         if (response.data.success) {
//           setCategories(response.data.data?.categories || [])
//         }
//       } catch (error) {
//         console.error('Failed to fetch categories:', error)
//         toast.error('Failed to load categories')
//       }
//     }
//     fetchCategories()
//   }, [])

//   // Load category attributes when category changes
//   useEffect(() => {
//     if (formValues.category) {
//       const findCategory = (cats: Category[], id: string): Category | null => {
//         for (const cat of cats) {
//           if (cat._id === id) return cat
//           if (cat.children) {
//             const found = findCategory(cat.children, id)
//             if (found) return found
//           }
//         }
//         return null
//       }
      
//       const category = findCategory(categories, formValues.category)
//       setSelectedCategory(category)
//       setCategoryAttributes(category?.attributes || [])
      
//       // Initialize attributes with default values
//       const defaultAttributes: Record<string, any> = {}
//       category?.attributes?.forEach(attr => {
//         if (attr.type === 'boolean') {
//           defaultAttributes[attr.name] = false
//         } else if (attr.type === 'number') {
//           defaultAttributes[attr.name] = 0
//         } else {
//           defaultAttributes[attr.name] = ''
//         }
//       })
//       setValue('attributes', defaultAttributes)
//     }
//   }, [formValues.category, categories, setValue])

//   // Filter categories based on search
//   const filteredCategories = categories.filter(cat => 
//     cat.name.toLowerCase().includes(searchCategory.toLowerCase())
//   )

//   const renderCategoryOptions = (items: Category[], level = 0): JSX.Element[] => {
//     const elements: JSX.Element[] = []
//     for (const item of items) {
//       elements.push(
//         <div key={item._id} className="flex items-center">
//           <RadioGroupItem value={item._id} id={item._id} className="mr-3" />
//           <Label htmlFor={item._id} className="flex-1 cursor-pointer">
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium">{'—'.repeat(level)} {item.name}</span>
//               {item.level === 3 && (
//                 <Badge variant="outline" className="text-[10px]">Leaf Category</Badge>
//               )}
//             </div>
//             {item.productCount !== undefined && (
//               <p className="text-xs text-muted-foreground">{item.productCount} products</p>
//             )}
//           </Label>
//         </div>
//       )
//       if (item.children && item.children.length > 0) {
//         elements.push(...renderCategoryOptions(item.children, level + 1))
//       }
//     }
//     return elements
//   }

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || [])
//     if (uploadedImages.length + files.length > 10) {
//       toast.error('Maximum 10 images allowed')
//       return
//     }

//     setIsUploading(true)
//     setUploadProgress(0)

//     const formData = new FormData()
//     files.forEach(file => {
//       formData.append('images', file)
//     })

//     try {
//       const response = await axios.post(`${BASE_URL}/api/v1/vendor/products/upload-images`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${accessToken}` },
        
//         onUploadProgress: (progressEvent) => {
//           if (progressEvent.total) {
//             const percent = (progressEvent.loaded / progressEvent.total) * 100
//             setUploadProgress(percent)
//           }
//         }
//       })

//       if (response.data.success) {
//         const newImages = response.data.images.map((img: any, idx: number) => ({
//           url: img.url,
//           thumbnail: img.thumbnail,
//           isPrimary: uploadedImages.length === 0 && idx === 0
//         }))
        
//         const updatedImages = [...uploadedImages, ...newImages]
//         setUploadedImages(updatedImages)
//         setValue('media.images', updatedImages)
//         toast.success(`${files.length} image(s) uploaded successfully`)
//       }
//     } catch (error) {
//       console.error('Upload failed:', error)
//       toast.error('Failed to upload images')
//     } finally {
//       setIsUploading(false)
//       setUploadProgress(0)
//     }
//   }

//   const removeImage = (index: number) => {
//     const updated = uploadedImages.filter((_, i) => i !== index)
//     setUploadedImages(updated)
//     setValue('media.images', updated)
//   }

//   const setPrimaryImage = (index: number) => {
//     const updated = uploadedImages.map((img, i) => ({
//       ...img,
//       isPrimary: i === index
//     }))
//     setUploadedImages(updated)
//     setValue('media.images', updated)
//   }

//   const addTag = (tag: string) => {
//     const currentTags = getValues('tags')
//     if (!currentTags.includes(tag) && tag.trim()) {
//       setValue('tags', [...currentTags, tag.trim()])
//     }
//   }

//   const removeTag = (tag: string) => {
//     const currentTags = getValues('tags')
//     setValue('tags', currentTags.filter(t => t !== tag))
//   }

//   const addFeature = (feature: string) => {
//     const currentFeatures = getValues('features')
//     if (!currentFeatures.includes(feature) && feature.trim()) {
//       setValue('features', [...currentFeatures, feature.trim()])
//     }
//   }

//   const removeFeature = (feature: string) => {
//     const currentFeatures = getValues('features')
//     setValue('features', currentFeatures.filter(f => f !== feature))
//   }

//   const addSpecification = (key: string, value: string) => {
//     if (key.trim() && value.trim()) {
//       const currentSpecs = getValues('specifications')
//       setValue('specifications', { ...currentSpecs, [key.trim()]: value.trim() })
//     }
//   }

//   const removeSpecification = (key: string) => {
//     const currentSpecs = getValues('specifications')
//     const { [key]: _, ...rest } = currentSpecs
//     setValue('specifications', rest)
//   }

//   const addPincode = (pincode: string) => {
//     const currentPincodes = getValues('rentalTerms.serviceablePincodes')
//     if (!currentPincodes.includes(pincode) && pincode.match(/^[1-9][0-9]{5}$/)) {
//       setValue('rentalTerms.serviceablePincodes', [...currentPincodes, pincode])
//     }
//   }

//   const removePincode = (pincode: string) => {
//     const currentPincodes = getValues('rentalTerms.serviceablePincodes')
//     setValue('rentalTerms.serviceablePincodes', currentPincodes.filter(p => p !== pincode))
//   }

//   const onSubmit = async (data: ProductFormValues) => {
//     setIsLoading(true)
//     try {
//       const payload = {
//         ...data,
//         media: {
//           images: uploadedImages,
//           videos: data.media.videos
//         }
//       }
      
//       const response = await axios.post(`${BASE_URL}/api/v1/vendor/products`, payload)
//       if (response.data.success) {
//         toast.success('Product created successfully!')
//         router.push('/vendor/products')
//         router.refresh()
//       }
//     } catch (error: any) {
//       console.error('Error creating product:', error)
//       toast.error('Failed to create product', {
//         description: error.response?.data?.message || 'Please try again'
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const nextStep = () => {
//     if (currentStep < stepIcons.length - 1) {
//       setCurrentStep(currentStep + 1)
//       window.scrollTo({ top: 0, behavior: 'smooth' })
//     }
//   }

//   const prevStep = () => {
//     if (currentStep > 0) {
//       setCurrentStep(currentStep - 1)
//       window.scrollTo({ top: 0, behavior: 'smooth' })
//     }
//   }

//   const StepIcon = stepIcons[currentStep]?.icon || FileText
//   const StepTitle = stepIcons[currentStep]?.title || 'Step'

//   return (
//     <TooltipProvider>
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
//         <div className="container mx-auto py-6 px-4 max-w-6xl">
//           {/* Header */}
//           <div className="mb-8">
//             <div className="flex items-center justify-between mb-2">
//               <div>
//                 <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
//                   Add New Product
//                 </h1>
//                 <p className="text-muted-foreground mt-1">List your product for rent on RentEase</p>
//               </div>
//               <Button variant="outline" onClick={() => router.back()}>
//                 <X className="h-4 w-4 mr-2" />
//                 Cancel
//               </Button>
//             </div>
            
//             {/* Progress Steps */}
//             <div className="mt-6">
//               <div className="flex justify-between">
//                 {stepIcons.map((step, idx) => {
//                   const Icon = step.icon
//                   const isCompleted = idx < currentStep
//                   const isCurrent = idx === currentStep
//                   return (
//                     <div key={idx} className="flex-1 relative">
//                       <div className="flex flex-col items-center">
//                         <button
//                           onClick={() => setCurrentStep(idx)}
//                           className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
//                             isCompleted
//                               ? 'bg-green-500 text-white'
//                               : isCurrent
//                               ? 'bg-primary text-white ring-4 ring-primary/20'
//                               : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
//                           }`}
//                         >
//                           {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
//                         </button>
//                         <p className={`text-xs mt-2 font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
//                           {step.title}
//                         </p>
//                         <p className="text-[10px] text-muted-foreground">{step.description}</p>
//                       </div>
//                       {idx < stepIcons.length - 1 && (
//                         <div className={`absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2 ${
//                           idx < currentStep ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-800'
//                         }`} />
//                       )}
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Educational Banner (Step 0 only) */}
//           {currentStep === 0 && showGuide && (
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800"
//             >
//               <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-2">
//                     <Youtube className="h-5 w-5 text-red-500" />
//                     <h3 className="font-semibold">Product Listing Guide</h3>
//                   </div>
//                   <p className="text-sm text-muted-foreground mb-3">
//                     Learn how to create effective product listings that attract more customers
//                   </p>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <h4 className="text-sm font-medium mb-2">📹 Video Tutorial</h4>
//                       <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
//                         <iframe
//                           src={educationalContent.videoUrl}
//                           title="Product Listing Guide"
//                           className="absolute inset-0 w-full h-full"
//                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                           allowFullScreen
//                         />
//                       </div>
//                     </div>
//                     <div>
//                       <h4 className="text-sm font-medium mb-2">📚 Helpful Resources</h4>
//                       <ul className="space-y-2">
//                         {educationalContent.guides.map((guide, idx) => (
//                           <li key={idx}>
//                             <Link href={guide.link} className="text-sm text-primary hover:underline flex items-center gap-1">
//                               <ExternalLink className="h-3 w-3" />
//                               {guide.title}
//                             </Link>
//                           </li>
//                         ))}
//                       </ul>
//                       <h4 className="text-sm font-medium mt-3 mb-2">💡 Pro Tips</h4>
//                       <ul className="space-y-1">
//                         {educationalContent.tips.map((tip, idx) => (
//                           <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
//                             <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
//                             {tip}
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   </div>
//                 </div>
//                 <Button variant="ghost" size="sm" onClick={() => setShowGuide(false)} className="h-8 w-8 p-0">
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             </motion.div>
//           )}

//           {/* Main Form */}
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <Card className="border-0 shadow-xl">
//               <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
//                 <CardTitle className="flex items-center gap-2">
//                   <StepIcon className="h-5 w-5 text-primary" />
//                   {StepTitle}
//                 </CardTitle>
//                 <CardDescription>Fill in the details below to list your product</CardDescription>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <AnimatePresence mode="wait">
//                   {/* Step 0: Basic Information */}
//                   {currentStep === 0 && (
//                     <motion.div
//                       key="step0"
//                       initial={{ opacity: 0, x: 20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: -20 }}
//                       className="space-y-6"
//                     >
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                           <Label>Product Name *</Label>
//                           <Input
//                             placeholder="e.g., Premium Leather Sofa"
//                             {...register('basicInfo.name')}
//                             className="mt-1.5"
//                           />
//                           {errors.basicInfo?.name && (
//                             <p className="text-xs text-red-500 mt-1">{errors.basicInfo.name.message}</p>
//                           )}
//                         </div>
//                         <div>
//                           <Label>Brand *</Label>
//                           <Input
//                             placeholder="e.g., Godrej, Urban Ladder"
//                             {...register('basicInfo.brand')}
//                             className="mt-1.5"
//                           />
//                           {errors.basicInfo?.brand && (
//                             <p className="text-xs text-red-500 mt-1">{errors.basicInfo.brand.message}</p>
//                           )}
//                         </div>
//                       </div>

//                       <div>
//                         <Label>Product Description *</Label>
//                         <Textarea
//                           placeholder="Describe your product in detail. Include features, benefits, condition, and what makes it special..."
//                           rows={6}
//                           {...register('basicInfo.description')}
//                           className="mt-1.5 resize-none"
//                         />
//                         <div className="flex justify-between mt-1">
//                           <p className="text-xs text-muted-foreground">Minimum 20 characters</p>
//                           <p className="text-xs text-muted-foreground">
//                             {formValues.basicInfo.description?.length || 0}/5000 characters
//                           </p>
//                         </div>
//                         {errors.basicInfo?.description && (
//                           <p className="text-xs text-red-500 mt-1">{errors.basicInfo.description.message}</p>
//                         )}
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                           <Label>Model Number (Optional)</Label>
//                           <Input
//                             placeholder="e.g., GL-1234"
//                             {...register('basicInfo.model')}
//                             className="mt-1.5"
//                           />
//                         </div>
//                         <div>
//                           <Label>Generate AI Description</Label>
//                           <div className="flex items-center gap-3 mt-1.5">
//                             <Switch {...register('generateDescription')} />
//                             <span className="text-sm text-muted-foreground">
//                               Use AI to enhance your product description
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div>
//                         <Label>Product Condition *</Label>
//                         <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
//                           {conditionOptions.map((condition) => (
//                             <button
//                               key={condition.value}
//                               type="button"
//                               onClick={() => setValue('condition', condition.value as any)}
//                               className={`p-3 rounded-xl border-2 transition-all text-left ${
//                                 selectedCondition === condition.value
//                                   ? 'border-primary bg-primary/5 shadow-md'
//                                   : 'border-border hover:border-primary/50'
//                               }`}
//                             >
//                               <div className={`w-3 h-3 rounded-full ${condition.color} mb-2`} />
//                               <p className="text-sm font-medium">{condition.label}</p>
//                               <p className="text-xs text-muted-foreground mt-1">{condition.description}</p>
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}

//                   {/* Step 1: Category Selection */}
//                   {currentStep === 1 && (
//                     <motion.div
//                       key="step1"
//                       initial={{ opacity: 0, x: 20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: -20 }}
//                       className="space-y-6"
//                     >
//                       {/* Category Search */}
//                       <div className="relative">
//                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                         <Input
//                           placeholder="Search categories..."
//                           value={searchCategory}
//                           onChange={(e) => setSearchCategory(e.target.value)}
//                           className="pl-9"
//                         />
//                       </div>

//                       {/* Category Tree */}
//                       <ScrollArea className="h-[400px] pr-4">
//                         <RadioGroup
//                           value={formValues.category}
//                           onValueChange={(value:any) => setValue('category', value)}
//                           className="space-y-3"
//                         >
//                           {searchCategory
//                             ? renderCategoryOptions(filteredCategories)
//                             : renderCategoryOptions(categories)
//                           }
//                         </RadioGroup>
//                       </ScrollArea>

//                       {errors.category && (
//                         <p className="text-xs text-red-500">{errors.category.message}</p>
//                       )}

//                       {/* Category Attributes */}
//                       {selectedCategory && categoryAttributes.length > 0 && (
//                         <div className="mt-6 pt-6 border-t">
//                           <h3 className="font-semibold mb-4">Category Attributes</h3>
//                           <div className="space-y-4">
//                             {categoryAttributes.map((attr, idx) => (
//                               <div key={idx} className="space-y-2">
//                                 <Label>
//                                   {attr.name}
//                                   {attr.required && <span className="text-red-500 ml-1">*</span>}
//                                 </Label>
//                                 {attr.type === 'select' && (
//                                   <Select
//                                     onValueChange={(value) => setValue(`attributes.${attr.name}`, value)}
//                                   >
//                                     <SelectTrigger>
//                                       <SelectValue placeholder={`Select ${attr.name}`} />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                       {attr.options?.map((opt: string) => (
//                                         <SelectItem key={opt} value={opt}>{opt}</SelectItem>
//                                       ))}
//                                     </SelectContent>
//                                   </Select>
//                                 )}
//                                 {attr.type === 'text' && (
//                                   <Input
//                                     placeholder={`Enter ${attr.name}`}
//                                     onChange={(e) => setValue(`attributes.${attr.name}`, e.target.value)}
//                                   />
//                                 )}
//                                 {attr.type === 'number' && (
//                                   <Input
//                                     type="number"
//                                     placeholder={`Enter ${attr.name}`}
//                                     onChange={(e) => setValue(`attributes.${attr.name}`, parseFloat(e.target.value))}
//                                   />
//                                 )}
//                                 {attr.type === 'boolean' && (
//                                   <Switch
//                                     checked={formValues.attributes[attr.name] || false}
//                                     onCheckedChange={(checked) => setValue(`attributes.${attr.name}`, checked)}
//                                   />
//                                 )}
//                                 {attr.unit && <p className="text-xs text-muted-foreground">Unit: {attr.unit}</p>}
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </motion.div>
//                   )}

//                   {/* Step 2: Pricing */}
//                   {currentStep === 2 && (
//                     <motion.div
//                       key="step2"
//                       initial={{ opacity: 0, x: 20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: -20 }}
//                       className="space-y-6"
//                     >
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                           <Label>Monthly Rent (₹) *</Label>
//                           <Input
//                             type="number"
//                             placeholder="e.g., 1999"
//                             {...register('pricing.monthlyRent', { valueAsNumber: true })}
//                             className="mt-1.5"
//                           />
//                           {errors.pricing?.monthlyRent && (
//                             <p className="text-xs text-red-500 mt-1">{errors.pricing.monthlyRent.message}</p>
//                           )}
//                         </div>
//                         <div>
//                           <Label>Security Deposit (₹) *</Label>
//                           <Input
//                             type="number"
//                             placeholder="e.g., 5000"
//                             {...register('pricing.securityDeposit', { valueAsNumber: true })}
//                             className="mt-1.5"
//                           />
//                           {errors.pricing?.securityDeposit && (
//                             <p className="text-xs text-red-500 mt-1">{errors.pricing.securityDeposit.message}</p>
//                           )}
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                           <Label>Delivery Charges (₹)</Label>
//                           <Input
//                             type="number"
//                             placeholder="e.g., 499"
//                             {...register('pricing.deliveryCharges', { valueAsNumber: true })}
//                             className="mt-1.5"
//                           />
//                         </div>
//                         <div>
//                           <Label>Late Fee Per Day (₹)</Label>
//                           <Input
//                             type="number"
//                             placeholder="e.g., 100"
//                             {...register('pricing.lateFeePerDay', { valueAsNumber: true })}
//                             className="mt-1.5"
//                           />
//                         </div>
//                       </div>

//                       <div className="border-t pt-4">
//                         <Label className="mb-3 block">Rental Options & Discounts</Label>
//                         <div className="space-y-3">
//                           {[3, 6, 12].map((months) => (
//                             <div key={months} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
//                               <div className="w-24">
//                                 <p className="font-medium">{months} Months</p>
//                               </div>
//                               <div className="flex-1">
//                                 <div className="flex items-center gap-3">
//                                   <span className="text-sm">Discount %</span>
//                                   <Input
//                                     type="number"
//                                     className="w-24"
//                                     {...register(`pricing.rentalOptions.${months === 3 ? 0 : months === 6 ? 1 : 2}.discount`, { valueAsNumber: true })}
//                                   />
//                                   <span className="text-sm text-muted-foreground">
//                                     Total: ₹{formValues.pricing.monthlyRent * months * (1 - (formValues.pricing.rentalOptions[months === 3 ? 0 : months === 6 ? 1 : 2]?.discount || 0) / 100)}
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}

//                   {/* Step 3: Inventory */}
//                   {currentStep === 3 && (
//                     <motion.div
//                       key="step3"
//                       initial={{ opacity: 0, x: 20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: -20 }}
//                       className="space-y-6"
//                     >
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                           <Label>Total Quantity *</Label>
//                           <Input
//                             type="number"
//                             placeholder="Number of items available"
//                             {...register('inventory.totalQuantity', { valueAsNumber: true })}
//                             className="mt-1.5"
//                           />
//                           {errors.inventory?.totalQuantity && (
//                             <p className="text-xs text-red-500 mt-1">{errors.inventory.totalQuantity.message}</p>
//                           )}
//                         </div>
//                         <div>
//                           <Label>SKU (Optional)</Label>
//                           <Input
//                             placeholder="Stock Keeping Unit"
//                             {...register('inventory.sku')}
//                             className="mt-1.5"
//                           />
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}

//                   {/* Step 4: Media */}
//                   {currentStep === 4 && (
//                     <motion.div
//                       key="step4"
//                       initial={{ opacity: 0, x: 20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: -20 }}
//                       className="space-y-6"
//                     >
//                       <div>
//                         <Label>Product Images *</Label>
//                         <div className="mt-2">
//                           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//                             {uploadedImages.map((img, idx) => (
//                               <div key={idx} className="relative group">
//                                 <div className="aspect-square rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-800">
//                                   <img
//                                     src={img.thumbnail || img.url}
//                                     alt={`Product ${idx + 1}`}
//                                     className="w-full h-full object-cover"
//                                   />
//                                 </div>
//                                 {img.isPrimary && (
//                                   <Badge className="absolute top-2 left-2 text-[10px] bg-primary">Primary</Badge>
//                                 )}
//                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
//                                   <Button
//                                     size="sm"
//                                     variant="secondary"
//                                     onClick={() => setPrimaryImage(idx)}
//                                     className="h-7 px-2 text-xs"
//                                   >
//                                     <Star className="h-3 w-3 mr-1" />
//                                     Primary
//                                   </Button>
//                                   <Button
//                                     size="sm"
//                                     variant="destructive"
//                                     onClick={() => removeImage(idx)}
//                                     className="h-7 px-2 text-xs"
//                                   >
//                                     <Trash2 className="h-3 w-3" />
//                                   </Button>
//                                 </div>
//                               </div>
//                             ))}
//                             {uploadedImages.length < 10 && (
//                               <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors">
//                                 <Camera className="h-8 w-8 text-muted-foreground" />
//                                 <span className="text-xs text-muted-foreground">Upload Image</span>
//                                 <input
//                                   type="file"
//                                   accept="image/*"
//                                   multiple
//                                   onChange={handleImageUpload}
//                                   className="hidden"
//                                   disabled={isUploading}
//                                 />
//                               </label>
//                             )}
//                           </div>
//                           {isUploading && (
//                             <div className="mt-4">
//                               <div className="flex justify-between text-sm mb-1">
//                                 <span>Uploading...</span>
//                                 <span>{Math.round(uploadProgress)}%</span>
//                               </div>
//                               <Progress value={uploadProgress} className="h-2" />
//                             </div>
//                           )}
//                           <p className="text-xs text-muted-foreground mt-2">
//                             Upload up to 10 images. First image will be used as primary. Supported formats: JPG, PNG, WEBP
//                           </p>
//                           {errors.media?.images && (
//                             <p className="text-xs text-red-500 mt-1">{errors.media.images.message}</p>
//                           )}
//                         </div>
//                       </div>

//                       <div>
//                         <Label>Video URL (Optional)</Label>
//                         <Input
//                           placeholder="YouTube or Vimeo URL"
//                           {...register('media.videos.0.url')}
//                           className="mt-1.5"
//                         />
//                         <p className="text-xs text-muted-foreground mt-1">
//                           Add a product demonstration video to help customers understand better
//                         </p>
//                       </div>
//                     </motion.div>
//                   )}

//                   {/* Step 5: Rental Terms */}
//                   {currentStep === 5 && (
//                     <motion.div
//                       key="step5"
//                       initial={{ opacity: 0, x: 20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: -20 }}
//                       className="space-y-6"
//                     >
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                           <Label>Minimum Rental Period (Months)</Label>
//                           <Input
//                             type="number"
//                             {...register('rentalTerms.minRentalMonths', { valueAsNumber: true })}
//                             className="mt-1.5"
//                           />
//                         </div>
//                         <div>
//                           <Label>Maximum Rental Period (Months)</Label>
//                           <Input
//                             type="number"
//                             {...register('rentalTerms.maxRentalMonths', { valueAsNumber: true })}
//                             className="mt-1.5"
//                           />
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-6">
//                         <div className="flex items-center gap-2">
//                           <Switch {...register('rentalTerms.deliveryAvailable')} />
//                           <Label>Delivery Available</Label>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Switch {...register('rentalTerms.pickupAvailable')} />
//                           <Label>Pickup Available</Label>
//                         </div>
//                       </div>

//                       <div>
//                         <Label>Serviceable Pincodes</Label>
//                         <div className="flex gap-2 mt-1.5">
//                           <Input
//                             placeholder="Enter pincode"
//                             id="pincodeInput"
//                             onKeyDown={(e) => {
//                               if (e.key === 'Enter') {
//                                 e.preventDefault()
//                                 const input = e.target as HTMLInputElement
//                                 if (input.value) {
//                                   addPincode(input.value)
//                                   input.value = ''
//                                 }
//                               }
//                             }}
//                           />
//                           <Button
//                             type="button"
//                             variant="outline"
//                             onClick={() => {
//                               const input = document.getElementById('pincodeInput') as HTMLInputElement
//                               if (input.value) {
//                                 addPincode(input.value)
//                                 input.value = ''
//                               }
//                             }}
//                           >
//                             Add
//                           </Button>
//                         </div>
//                         <div className="flex flex-wrap gap-2 mt-3">
//                           {formValues.rentalTerms.serviceablePincodes.map((pincode) => (
//                             <Badge key={pincode} variant="secondary" className="gap-1">
//                               {pincode}
//                               <button
//                                 type="button"
//                                 onClick={() => removePincode(pincode)}
//                                 className="ml-1 hover:text-red-500"
//                               >
//                                 <X className="h-3 w-3" />
//                               </button>
//                             </Badge>
//                           ))}
//                         </div>
//                       </div>

//                       <div>
//                         <Label>Terms & Conditions (Optional)</Label>
//                         <Textarea
//                           placeholder="Any specific terms and conditions for this rental..."
//                           rows={3}
//                           {...register('rentalTerms.termsAndConditions')}
//                           className="mt-1.5"
//                         />
//                       </div>
//                     </motion.div>
//                   )}

//                   {/* Step 6: Specifications & Features */}
//                   {currentStep === 6 && (
//                     <motion.div
//                       key="step6"
//                       initial={{ opacity: 0, x: 20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: -20 }}
//                       className="space-y-6"
//                     >
//                       {/* Features */}
//                       <div>
//                         <Label>Key Features</Label>
//                         <div className="flex gap-2 mt-1.5">
//                           <Input
//                             placeholder="e.g., Premium Leather, Comfortable Seating"
//                             id="featureInput"
//                             onKeyDown={(e) => {
//                               if (e.key === 'Enter') {
//                                 e.preventDefault()
//                                 const input = e.target as HTMLInputElement
//                                 if (input.value) {
//                                   addFeature(input.value)
//                                   input.value = ''
//                                 }
//                               }
//                             }}
//                           />
//                           <Button
//                             type="button"
//                             variant="outline"
//                             onClick={() => {
//                               const input = document.getElementById('featureInput') as HTMLInputElement
//                               if (input.value) {
//                                 addFeature(input.value)
//                                 input.value = ''
//                               }
//                             }}
//                           >
//                             Add
//                           </Button>
//                         </div>
//                         <div className="flex flex-wrap gap-2 mt-3">
//                           {formValues.features.map((feature) => (
//                             <Badge key={feature} variant="secondary" className="gap-1">
//                               {feature}
//                               <button
//                                 type="button"
//                                 onClick={() => removeFeature(feature)}
//                                 className="ml-1 hover:text-red-500"
//                               >
//                                 <X className="h-3 w-3" />
//                               </button>
//                             </Badge>
//                           ))}
//                         </div>
//                       </div>

//                       {/* Tags */}
//                       <div>
//                         <Label>Tags (for better searchability)</Label>
//                         <div className="flex gap-2 mt-1.5">
//                           <Input
//                             placeholder="e.g., sofa, furniture, modern"
//                             id="tagInput"
//                             onKeyDown={(e) => {
//                               if (e.key === 'Enter') {
//                                 e.preventDefault()
//                                 const input = e.target as HTMLInputElement
//                                 if (input.value) {
//                                   addTag(input.value)
//                                   input.value = ''
//                                 }
//                               }
//                             }}
//                           />
//                           <Button
//                             type="button"
//                             variant="outline"
//                             onClick={() => {
//                               const input = document.getElementById('tagInput') as HTMLInputElement
//                               if (input.value) {
//                                 addTag(input.value)
//                                 input.value = ''
//                               }
//                             }}
//                           >
//                             Add
//                           </Button>
//                         </div>
//                         <div className="flex flex-wrap gap-2 mt-3">
//                           {formValues.tags.map((tag) => (
//                             <Badge key={tag} variant="outline" className="gap-1">
//                               {tag}
//                               <button
//                                 type="button"
//                                 onClick={() => removeTag(tag)}
//                                 className="ml-1 hover:text-red-500"
//                               >
//                                 <X className="h-3 w-3" />
//                               </button>
//                             </Badge>
//                           ))}
//                         </div>
//                       </div>

//                       {/* Specifications */}
//                       <div>
//                         <Label>Technical Specifications</Label>
//                         <div className="space-y-2 mt-2">
//                           {Object.entries(formValues.specifications).map(([key, value]) => (
//                             <div key={key} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
//                               <span className="font-medium text-sm w-1/3">{key}</span>
//                               <span className="text-sm flex-1">{value}</span>
//                               <Button
//                                 type="button"
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => removeSpecification(key)}
//                                 className="text-red-500"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           ))}
//                           <div className="flex gap-2 mt-2">
//                             <Input placeholder="Specification name" id="specKey" className="flex-1" />
//                             <Input placeholder="Value" id="specValue" className="flex-1" />
//                             <Button
//                               type="button"
//                               variant="outline"
//                               onClick={() => {
//                                 const key = (document.getElementById('specKey') as HTMLInputElement).value
//                                 const value = (document.getElementById('specValue') as HTMLInputElement).value
//                                 if (key && value) {
//                                   addSpecification(key, value)
//                                   ;(document.getElementById('specKey') as HTMLInputElement).value = ''
//                                   ;(document.getElementById('specValue') as HTMLInputElement).value = ''
//                                 }
//                               }}
//                             >
//                               Add
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </CardContent>
//             </Card>

//             {/* Navigation Buttons */}
//             <div className="flex justify-between mt-6">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={prevStep}
//                 disabled={currentStep === 0}
//               >
//                 <ChevronLeft className="h-4 w-4 mr-2" />
//                 Previous
//               </Button>
              
//               {currentStep === stepIcons.length - 1 ? (
//                 <Button
//                   type="submit"
//                   disabled={isLoading}
//                   className="bg-gradient-to-r from-primary to-secondary"
//                 >
//                   {isLoading ? (
//                     <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                   ) : (
//                     <Save className="h-4 w-4 mr-2" />
//                   )}
//                   Publish Product
//                 </Button>
//               ) : (
//                 <Button type="button" onClick={nextStep}>
//                   Next
//                   <ChevronRight className="h-4 w-4 ml-2" />
//                 </Button>
//               )}
//             </div>
//           </form>
//         </div>
//       </div>
//     </TooltipProvider>
//   )
// }






'use client'

import { useState, useEffect, useCallback, useRef, JSX } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Upload, Image as ImageIcon, Video, FileText,
  ChevronRight, ChevronLeft, Save, Plus, Trash2,
  X, Loader2, CheckCircle, AlertCircle, Info,
  Play, Camera, DollarSign, Truck, Shield, Clock, Star, Tag,
  Layers, Search, ChevronDown, ChevronUp, Sparkles,
  BadgeCheck, TrendingUp, Users, Award, Zap, Eye,
  BarChart3, Globe, Lock, RefreshCw, ArrowRight, Box,
  Percent, MapPin, ListChecks, ImagePlus, LayoutGrid, BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/useToast'
import axios from 'axios'
import { useSession } from 'next-auth/react'

// ─── Schema ──────────────────────────────────────────────────────────────────
const productSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  attributes: z.record(z.string(), z.any()).default({}),
  basicInfo: z.object({
    name: z.string().min(3).max(100),
    description: z.string().min(20).max(5000),
    brand: z.string().min(2),
    model: z.string().optional(),
  }),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'refurbished']),
  pricing: z.object({
    monthlyRent: z.number().min(0),
    securityDeposit: z.number().min(0),
    deliveryCharges: z.number().min(0).default(0),
    lateFeePerDay: z.number().min(0).default(0),
    rentalOptions: z.array(z.object({ months: z.number(), discount: z.number().min(0).max(100) })).default([
      { months: 3, discount: 0 }, { months: 6, discount: 5 }, { months: 12, discount: 10 },
    ]),
  }),
  inventory: z.object({
    totalQuantity: z.number().min(1).max(1000),
    sku: z.string().optional(),
  }),
  media: z.object({
    images: z.array(z.object({ url: z.string(), thumbnail: z.string(), isPrimary: z.boolean() })).min(1).max(10),
    videos: z.array(z.object({ url: z.string(), thumbnail: z.string().optional() })).optional(),
  }),
  rentalTerms: z.object({
    minRentalMonths: z.number().min(1).max(12).default(3),
    maxRentalMonths: z.number().min(1).max(36).default(12),
    deliveryAvailable: z.boolean().default(true),
    pickupAvailable: z.boolean().default(true),
    serviceablePincodes: z.array(z.string()).default([]),
    termsAndConditions: z.string().optional(),
  }),
  specifications: z.record(z.string(), z.string()).default({}),
  features: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
})

type ProductFormValues = z.infer<typeof productSchema>

interface CategoryNode {
  _id: string; name: string; slug: string; level: number;
  productCount?: number; children?: CategoryNode[];
  attributes?: Array<{ name: string; type: string; required: boolean; filterable: boolean; options?: string[]; unit?: string }>
}

// ─── Constants ───────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const STEPS = [
  { id: 0, icon: LayoutGrid, title: 'Category', short: 'Cat', desc: 'Select product category' },
  { id: 1, icon: ImagePlus, title: 'Media', short: 'Media', desc: 'Upload images & videos' },
  { id: 2, icon: FileText, title: 'Basic Info', short: 'Info', desc: 'Name, brand & condition' },
  { id: 3, icon: DollarSign, title: 'Pricing', short: 'Price', desc: 'Rent & deposits' },
  { id: 4, icon: Package, title: 'Inventory', short: 'Stock', desc: 'Quantity & SKU' },
  { id: 5, icon: Truck, title: 'Rental Terms', short: 'Terms', desc: 'Delivery & policies' },
  { id: 6, icon: Layers, title: 'Details', short: 'Details', desc: 'Specs & features' },
]

const CONDITIONS = [
  { value: 'new', label: 'New', desc: 'Brand new, never used', color: '#22c55e', dot: 'bg-green-500' },
  { value: 'like-new', label: 'Like New', desc: 'Minimal usage, near perfect', color: '#10b981', dot: 'bg-emerald-500' },
  { value: 'good', label: 'Good', desc: 'Well maintained, minor signs of use', color: '#3b82f6', dot: 'bg-blue-500' },
  { value: 'fair', label: 'Fair', desc: 'Visible wear but fully functional', color: '#f59e0b', dot: 'bg-amber-500' },
  { value: 'refurbished', label: 'Refurbished', desc: 'Professionally restored & certified', color: '#8b5cf6', dot: 'bg-purple-500' },
]

const TIPS_BY_STEP: Record<number, { icon: any; title: string; items: string[] }> = {
  0: { icon: LayoutGrid, title: 'Category Tips', items: ['Choose the most specific sub-category for better visibility', 'Correct category helps buyers find your product faster', 'Attributes vary by category — choose carefully'] },
  1: { icon: Camera, title: 'Photo Tips', items: ['Use natural light, shoot on white background', 'Show all angles — front, back, sides, top', 'Minimum 4 images recommended for best conversion', '1:1 ratio images display best on listing pages'] },
  2: { icon: BookOpen, title: 'Description Tips', items: ['Start with the most important feature', 'Mention dimensions, weight & material', 'Describe what makes it stand out', 'Use bullet points in description for readability'] },
  3: { icon: TrendingUp, title: 'Pricing Tips', items: ['Research competitors for similar products', 'Longer rental discounts attract more bookings', 'Security deposit should be ≈2–3x monthly rent', 'Free delivery increases conversion by 40%'] },
  4: { icon: Box, title: 'Inventory Tips', items: ['Keep inventory accurate to avoid cancellations', 'Use a unique SKU for easy tracking', 'Start with conservative quantities'] },
  5: { icon: MapPin, title: 'Delivery Tips', items: ['More pincodes = more orders', 'Clearly mention delivery timeline in terms', 'Offering free pickup increases trust'] },
  6: { icon: ListChecks, title: 'Details Tips', items: ['Complete specifications improve search ranking', 'Tags should include common search terms', 'Highlight key USPs in features section'] },
}

const STATS = [
  { icon: Users, value: '2.4M+', label: 'Active Renters' },
  { icon: BarChart3, value: '₹850Cr', label: 'GMV Processed' },
  { icon: BadgeCheck, value: '98.2%', label: 'Satisfaction Rate' },
  { icon: TrendingUp, value: '3.2x', label: 'Avg. Repeat Orders' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function flattenCategories(cats: CategoryNode[], level = 0): Array<CategoryNode & { level: number }> {
  const result: Array<CategoryNode & { level: number }> = []
  for (const c of cats) {
    result.push({ ...c, level })
    if (c.children?.length) result.push(...flattenCategories(c.children, level + 1))
  }
  return result
}

// ─── Category Tree Component ──────────────────────────────────────────────────
function CategoryTree({
  categories, value, onChange, search,
}: { categories: CategoryNode[]; value: string; onChange: (id: string) => void; search: string }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setExpanded(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const flat = flattenCategories(categories)
  const searchLower = search.toLowerCase()

  const renderNode = (node: CategoryNode, depth = 0): JSX.Element | null => {
    const hasChildren = !!node.children?.length
    const isExpanded = expanded.has(node._id)
    const isSelected = value === node._id
    const matchSearch = !search || node.name.toLowerCase().includes(searchLower)
    const childrenMatchSearch = !search || flattenCategories(node.children || []).some(c => c.name.toLowerCase().includes(searchLower))

    if (search && !matchSearch && !childrenMatchSearch) return null

    return (
      <div key={node._id}>
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all group ${
            isSelected
              ? 'bg-[#2874f0] text-white shadow-md'
              : 'hover:bg-slate-50 text-slate-700'
          }`}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
          onClick={() => {
            if (!hasChildren) { onChange(node._id); return }
            toggle(node._id)
            if (!node.children?.length) onChange(node._id)
          }}
        >
          {hasChildren ? (
            <button onClick={(e) => { e.stopPropagation(); toggle(node._id) }} className="shrink-0">
              {isExpanded
                ? <ChevronDown className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                : <ChevronRight className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />}
            </button>
          ) : (
            <div className="w-3.5 shrink-0" />
          )}

          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isSelected ? 'bg-white' : depth === 0 ? 'bg-[#2874f0]' : depth === 1 ? 'bg-orange-400' : 'bg-green-500'
          }`} />

          <span className={`flex-1 text-sm font-medium ${isSelected ? 'text-white' : ''}`}>{node.name}</span>

          {!hasChildren && (
            <RadioGroupItem
              value={node._id}
              checked={isSelected}
              className={`shrink-0 ${isSelected ? 'border-white text-white' : ''}`}
            />
          )}
          {hasChildren && node.productCount !== undefined && (
            <span className={`text-[11px] shrink-0 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
              {node.productCount}
            </span>
          )}
        </div>

        <AnimatePresence>
          {(isExpanded || (search && childrenMatchSearch)) && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {node.children!.map(child => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <RadioGroup value={value} onValueChange={onChange}>
      <div className="space-y-0.5">
        {categories.map(cat => renderNode(cat))}
      </div>
    </RadioGroup>
  )
}

// ─── Success Modal ─────────────────────────────────────────────────────────────
function SuccessModal({ onViewProducts, onAddAnother }: { onViewProducts: () => void; onAddAnother: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-40" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Listed Successfully! 🎉</h2>
        <p className="text-slate-500 text-sm mb-2">Your product is now live and visible to renters across India.</p>
        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
          {[
            ['Listing Status', 'Live & Active'],
            ['Visibility', 'All serviceable pincodes'],
            ['Review', 'Within 24 hours'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-slate-500">{k}</span>
              <span className="font-semibold text-slate-800">{v}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <button
            onClick={onViewProducts}
            className="w-full bg-[#2874f0] text-white py-3 rounded-xl font-semibold hover:bg-[#1a5fd4] transition-colors"
          >
            View My Listings
          </button>
          <button
            onClick={onAddAnother}
            className="w-full border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            Add Another Product
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Tip Panel ─────────────────────────────────────────────────────────────────
function TipPanel({ step }: { step: number }) {
  const tip = TIPS_BY_STEP[step]
  if (!tip) return null
  const Icon = tip.icon
  return (
    <div className="bg-[#fff8e7] border border-amber-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
          <Icon className="h-4 w-4 text-amber-600" />
        </div>
        <span className="text-sm font-semibold text-amber-800">{tip.title}</span>
      </div>
      <ul className="space-y-2">
        {tip.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
            <CheckCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AddProductPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [categories, setCategories] = useState<CategoryNode[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null)
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([])
  const [uploadedImages, setUploadedImages] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchCategory, setSearchCategory] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [featureInput, setFeatureInput] = useState('')
  const [pincodeInput, setPincodeInput] = useState('')
  const [specKey, setSpecKey] = useState('')
  const [specVal, setSpecVal] = useState('')
  const toast = useToast()
  const { data: session } = useSession()
  const accessToken = session?.user?.accessToken

  const { register, handleSubmit, setValue, watch, getValues, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: '', attributes: {},
      basicInfo: { name: '', description: '', brand: '', model: '' },
      condition: 'good',
      pricing: {
        monthlyRent: 0, securityDeposit: 0, deliveryCharges: 0, lateFeePerDay: 0,
        rentalOptions: [{ months: 3, discount: 0 }, { months: 6, discount: 5 }, { months: 12, discount: 10 }],
      },
      inventory: { totalQuantity: 1, sku: '' },
      media: { images: [], videos: [] },
      rentalTerms: {
        minRentalMonths: 3, maxRentalMonths: 12, deliveryAvailable: true,
        pickupAvailable: true, serviceablePincodes: [], termsAndConditions: '',
      },
      specifications: {}, features: [], tags: [],
    }
  })

  const fv = watch()
  const completedSteps = new Set<number>()
  if (fv.category) completedSteps.add(0)
  if (uploadedImages.length > 0) completedSteps.add(1)
  if (fv.basicInfo?.name?.length >= 3 && fv.basicInfo?.brand?.length >= 2) completedSteps.add(2)
  if (fv.pricing?.monthlyRent > 0 && fv.pricing?.securityDeposit >= 0) completedSteps.add(3)
  if (fv.inventory?.totalQuantity >= 1) completedSteps.add(4)

  // Fetch categories
  useEffect(() => {
    axios.get(`${BASE_URL}/api/v1/categories/tree`)
      .then(r => { if (r.data.success) setCategories(r.data.data?.categories || []) })
      .catch(() => {})
  }, [])

  // Load attributes when category changes
  useEffect(() => {
    if (!fv.category) return
    const find = (cats: CategoryNode[], id: string): CategoryNode | null => {
      for (const c of cats) {
        if (c._id === id) return c
        if (c.children) { const f = find(c.children, id); if (f) return f }
      }
      return null
    }
    const cat = find(categories, fv.category)
    setSelectedCategory(cat)
    setCategoryAttributes(cat?.attributes || [])
    const defaults: Record<string, any> = {}
    cat?.attributes?.forEach(a => {
      defaults[a.name] = a.type === 'boolean' ? false : a.type === 'number' ? 0 : ''
    })
    setValue('attributes', defaults)
  }, [fv.category, categories, setValue])

  // const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = Array.from(e.target.files || [])
  //   if (uploadedImages.length + files.length > 10) { toast.error('Maximum 10 images allowed'); return }
  //   setIsUploading(true); setUploadProgress(0)
  //   const fd = new FormData()
  //   files.forEach(f => fd.append('images', f))
  //   try {
  //     const res = await axios.post(`${BASE_URL}/api/v1/vendor/products/upload-images`, fd, {
  //       headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${accessToken}` },
  //       onUploadProgress: pe => pe.total && setUploadProgress((pe.loaded / pe.total) * 100),
  //     })
  //     if (res.data.success) {
  //       const newImgs = res.data.images.map((img: any, i: number) => ({
  //         url: img.url, thumbnail: img.thumbnail, isPrimary: uploadedImages.length === 0 && i === 0,
  //       }))
  //       const all = [...uploadedImages, ...newImgs]
  //       setUploadedImages(all); setValue('media.images', all)
  //       toast.success(`${files.length} image(s) uploaded`)
  //     }
  //   } catch { toast.error('Upload failed') }
  //   finally { setIsUploading(false); setUploadProgress(0) }
  // }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || [])
  if (uploadedImages.length + files.length > 10) {
    toast.error('Maximum 10 images allowed')
    return
  }
  
  setIsUploading(true)
  setUploadProgress(0)
  
  const fd = new FormData()
  files.forEach(f => fd.append('images', f))
  
  try {
    const res = await axios.post(`${BASE_URL}/api/v1/vendor/products/upload-images`, fd, {
      headers: { 
        'Content-Type': 'multipart/form-data', 
        'Authorization': `Bearer ${accessToken}`
      },
      onUploadProgress: (pe) => {
        if (pe.total) {
          setUploadProgress((pe.loaded / pe.total) * 100)
        }
      },
    })
    
    console.log("Upload response:", res.data) // Debug log
    
    // 🔥 FIX: Check both response structures
    if (res.data.success) {
      // Handle both possible response structures
      let uploadedImagesData = res.data.data?.images || res.data.images
      
      if (!uploadedImagesData || uploadedImagesData.length === 0) {
        throw new Error('No images returned from server')
      }
      
      const newImgs = uploadedImagesData.map((img: any, i: number) => ({
        url: img.url,
        thumbnail: img.thumbnail || img.url.replace('/upload/', '/upload/w_200,h_200,c_fill/'),
        isPrimary: uploadedImages.length === 0 && i === 0,
        publicId: img.publicId
      }))
      
      const all = [...uploadedImages, ...newImgs]
      setUploadedImages(all)
      setValue('media.images', all)
      toast.success(`${files.length} image(s) uploaded successfully`)
    } else {
      throw new Error(res.data.message || 'Upload failed')
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    toast.error('Upload failed', {
      description: error.response?.data?.message || error.message || 'Please try again'
    })
  } finally {
    setIsUploading(false)
    setUploadProgress(0)
  }
}

  const onSubmit = async (data: ProductFormValues) => {
    console.log('Form data to submit:', data)
    setIsLoading(true)
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/vendor/products`, { ...data, media: { images: uploadedImages, videos: data.media.videos } }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (res.data.success) setShowSuccess(true)
    } catch (e: any) {
      toast.error('Failed to create product', { description: e.response?.data?.message })
    } finally { setIsLoading(false) }
  }

  const goTo = (n: number) => { setCurrentStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  // ── Render Steps ──────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {
      // ── STEP 0: Category ──
      case 0: return (
        <motion.div key="s0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search categories..."
              value={searchCategory}
              onChange={e => setSearchCategory(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]"
            />
          </div>
          <ScrollArea className="h-[380px] pr-2">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mb-3" />
                <p className="text-sm">Loading categories...</p>
              </div>
            ) : (
              <CategoryTree categories={categories} value={fv.category} onChange={v => setValue('category', v)} search={searchCategory} />
            )}
          </ScrollArea>
          {fv.category && selectedCategory && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 bg-[#ebf3fb] border border-[#2874f0]/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-[#2874f0]" />
              <span className="text-sm text-[#2874f0] font-medium">Selected: {selectedCategory.name}</span>
            </motion.div>
          )}
          {categoryAttributes.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-slate-500" />
                <h3 className="font-semibold text-sm text-slate-700">Category Attributes</h3>
                <Badge variant="secondary" className="text-[10px]">{categoryAttributes.length} fields</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categoryAttributes.map((attr, i) => (
                  <div key={i}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {attr.name}{attr.required && <span className="text-red-500 ml-1">*</span>}
                      {attr.unit && <span className="text-slate-400 ml-1">({attr.unit})</span>}
                    </label>
                    {attr.type === 'select' ? (
                      <Select onValueChange={v => setValue(`attributes.${attr.name}`, v)}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={`Select ${attr.name}`} /></SelectTrigger>
                        <SelectContent>{attr.options?.map((o: string) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    ) : attr.type === 'boolean' ? (
                      <Switch checked={fv.attributes[attr.name] || false} onCheckedChange={v => setValue(`attributes.${attr.name}`, v)} />
                    ) : (
                      <input
                        type={attr.type === 'number' ? 'number' : 'text'}
                        placeholder={`Enter ${attr.name}`}
                        onChange={e => setValue(`attributes.${attr.name}`, attr.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
        </motion.div>
      )

      // ── STEP 1: Media ──
      case 1: return (
        <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-800">Product Images</h3>
                <p className="text-xs text-slate-500 mt-0.5">Upload up to 10 images. First will be primary listing image.</p>
              </div>
              <Badge variant={uploadedImages.length >= 4 ? 'default' : 'secondary'} className="text-xs">
                {uploadedImages.length}/10 uploaded
              </Badge>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="relative group aspect-square">
                  <div className={`w-full h-full rounded-xl overflow-hidden border-2 transition-all ${img.isPrimary ? 'border-[#2874f0] shadow-md' : 'border-slate-200'}`}>
                    <img src={img.thumbnail || img.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  {img.isPrimary && (
                    <div className="absolute top-1.5 left-1.5 bg-[#2874f0] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">PRIMARY</div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-1.5">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => {
                          const u = uploadedImages.map((m, i) => ({ ...m, isPrimary: i === idx }))
                          setUploadedImages(u); setValue('media.images', u)
                        }}
                        className="text-[10px] bg-white text-slate-700 px-2 py-1 rounded-md font-semibold"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const u = uploadedImages.filter((_, i) => i !== idx)
                        setUploadedImages(u); setValue('media.images', u)
                      }}
                      className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-md font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {uploadedImages.length < 10 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-[#2874f0] hover:bg-[#ebf3fb]/50 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <Plus className="h-5 w-5 text-slate-500" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Add Image</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                </label>
              )}
            </div>

            {isUploading && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex justify-between text-xs mb-1.5 text-slate-600">
                  <span className="flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" />Uploading images...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            )}

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[['Min. 1 image', 'Required'], ['Max 10 images', 'Allowed'], ['JPG, PNG, WEBP', 'Formats']].map(([v, l]) => (
                <div key={l} className="text-center p-2.5 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-700">{v}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Product Video URL <span className="text-xs font-normal text-slate-400">(Optional)</span></label>
            <input
              {...register('media.videos.0.url')}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]"
            />
            <p className="text-xs text-slate-400 mt-1">A product demo video increases bookings by up to 60%</p>
          </div>
        </motion.div>
      )

      // ── STEP 2: Basic Info ──
      case 2: return (
        <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Product Name <span className="text-red-500">*</span></label>
              <input {...register('basicInfo.name')} placeholder="e.g., Premium Leather Sofa"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]" />
              {errors.basicInfo?.name && <p className="text-[11px] text-red-500 mt-1">{errors.basicInfo.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Brand <span className="text-red-500">*</span></label>
              <input {...register('basicInfo.brand')} placeholder="e.g., Godrej, Urban Ladder"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]" />
              {errors.basicInfo?.brand && <p className="text-[11px] text-red-500 mt-1">{errors.basicInfo.brand.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea
              {...register('basicInfo.description')}
              rows={5}
              placeholder="Describe your product clearly — highlight key features, condition, dimensions, and benefits for the renter..."
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0] resize-none"
            />
            <div className="flex justify-between mt-1">
              <p className="text-[11px] text-slate-400">Minimum 20 characters</p>
              <p className="text-[11px] text-slate-400">{fv.basicInfo?.description?.length || 0}/5000</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Model Number <span className="text-slate-400 font-normal">(Optional)</span></label>
            <input {...register('basicInfo.model')} placeholder="e.g., GL-1234-PRO"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-3">Product Condition <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {CONDITIONS.map(c => (
                <button
                  key={c.value} type="button"
                  onClick={() => setValue('condition', c.value as any)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${fv.condition === c.value ? 'border-[#2874f0] bg-[#ebf3fb] shadow' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${c.dot} mb-2`} />
                  <p className="text-xs font-semibold text-slate-800">{c.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )

      // ── STEP 3: Pricing ──
      case 3: return (
        <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Monthly Rent (₹)', name: 'pricing.monthlyRent', ph: '1999', req: true },
              { label: 'Security Deposit (₹)', name: 'pricing.securityDeposit', ph: '5000', req: true },
              { label: 'Delivery Charges (₹)', name: 'pricing.deliveryCharges', ph: '499' },
              { label: 'Late Fee Per Day (₹)', name: 'pricing.lateFeePerDay', ph: '100' },
            ].map(({ label, name, ph, req }) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}{req && <span className="text-red-500 ml-1">*</span>}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input type="number" placeholder={ph}
                    {...register(name as any, { valueAsNumber: true })}
                    className="w-full pl-7 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Percent className="h-4 w-4 text-[#2874f0]" />
              <h3 className="font-semibold text-sm text-slate-700">Long-term Rental Discounts</h3>
              <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200">Boosts Bookings</Badge>
            </div>
            <div className="space-y-2.5">
              {[
                { label: '3 Months', idx: 0 },
                { label: '6 Months', idx: 1 },
                { label: '12 Months', idx: 2 },
              ].map(({ label, idx }) => {
                const disc = fv.pricing?.rentalOptions?.[idx]?.discount || 0
                const months = [3, 6, 12][idx]
                const total = fv.pricing?.monthlyRent ? Math.round(fv.pricing.monthlyRent * months * (1 - disc / 100)) : 0
                return (
                  <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-24 shrink-0">
                      <p className="text-sm font-semibold text-slate-700">{label}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <input type="number" min={0} max={100}
                        {...register(`pricing.rentalOptions.${idx}.discount`, { valueAsNumber: true })}
                        className="w-20 px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
                      />
                      <span className="text-xs text-slate-500">% off</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="text-sm font-bold text-[#2874f0]">₹{total.toLocaleString()}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {fv.pricing?.monthlyRent > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-[#2874f0]/5 to-orange-50 border border-[#2874f0]/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />Listing Preview Pricing</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#2874f0]">₹{fv.pricing.monthlyRent.toLocaleString()}</span>
                <span className="text-sm text-slate-500">/month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Security deposit: ₹{(fv.pricing.securityDeposit || 0).toLocaleString()}</p>
            </motion.div>
          )}
        </motion.div>
      )

      // ── STEP 4: Inventory ──
      case 4: return (
        <motion.div key="s4" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Total Quantity <span className="text-red-500">*</span></label>
              <input type="number" placeholder="1" min={1} max={1000}
                {...register('inventory.totalQuantity', { valueAsNumber: true })}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]"
              />
              {errors.inventory?.totalQuantity && <p className="text-[11px] text-red-500 mt-1">{errors.inventory.totalQuantity.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">SKU <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input {...register('inventory.sku')} placeholder="e.g., SOFA-001-BLK"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[['In Stock', '✓ Active & Bookable'], ['Track Inventory', '✓ Auto-managed'], ['Low Stock Alert', '✓ At 10% qty']].map(([t, d]) => (
              <div key={t} className="p-3 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-xs font-bold text-green-700">{t}</p>
                <p className="text-[10px] text-green-600 mt-0.5">{d}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )

      // ── STEP 5: Rental Terms ──
      case 5: return (
        <motion.div key="s5" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Min. Rental Period (months)</label>
              <input type="number" min={1} max={12} {...register('rentalTerms.minRentalMonths', { valueAsNumber: true })}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Max. Rental Period (months)</label>
              <input type="number" min={1} max={36} {...register('rentalTerms.maxRentalMonths', { valueAsNumber: true })}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]" />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            {[
              { label: 'Delivery Available', field: 'rentalTerms.deliveryAvailable' as const },
              { label: 'Pickup Available', field: 'rentalTerms.pickupAvailable' as const },
            ].map(({ label, field }) => (
              <div key={field} className="flex items-center gap-3">
                <Switch checked={fv.rentalTerms?.[field.split('.')[1] as 'deliveryAvailable' | 'pickupAvailable']}
                  onCheckedChange={v => setValue(field, v)} />
                <label className="text-sm font-medium text-slate-700">{label}</label>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Serviceable Pincodes</label>
            <div className="flex gap-2">
              <input value={pincodeInput} onChange={e => setPincodeInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const p = getValues('rentalTerms.serviceablePincodes'); if (pincodeInput.match(/^[1-9][0-9]{5}$/)) { setValue('rentalTerms.serviceablePincodes', [...p, pincodeInput]); setPincodeInput('') } } }}
                placeholder="Enter 6-digit pincode"
                className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]"
              />
              <button type="button" onClick={() => {
                const p = getValues('rentalTerms.serviceablePincodes')
                if (pincodeInput.match(/^[1-9][0-9]{5}$/)) { setValue('rentalTerms.serviceablePincodes', [...p, pincodeInput]); setPincodeInput('') }
              }} className="px-4 py-2 bg-[#2874f0] text-white text-sm font-semibold rounded-lg hover:bg-[#1a5fd4]">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {fv.rentalTerms?.serviceablePincodes?.map(p => (
                <span key={p} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full">
                  <MapPin className="h-3 w-3" />{p}
                  <button type="button" onClick={() => setValue('rentalTerms.serviceablePincodes', fv.rentalTerms.serviceablePincodes.filter(x => x !== p))}>
                    <X className="h-3 w-3 hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Terms & Conditions <span className="text-slate-400 font-normal">(Optional)</span></label>
            <textarea rows={3} {...register('rentalTerms.termsAndConditions')}
              placeholder="Any special conditions, return policies, or usage restrictions..."
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0] resize-none"
            />
          </div>
        </motion.div>
      )

      // ── STEP 6: Specifications & Details ──
      case 6: return (
        <motion.div key="s6" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-6">
          {/* Features */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Key Features</label>
            <div className="flex gap-2">
              <input value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (featureInput.trim()) { const cur = getValues('features'); setValue('features', [...cur, featureInput.trim()]); setFeatureInput('') } } }}
                placeholder="e.g., Adjustable height, Scratch-resistant surface"
                className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]"
              />
              <button type="button" onClick={() => { if (featureInput.trim()) { setValue('features', [...getValues('features'), featureInput.trim()]); setFeatureInput('') } }}
                className="px-4 py-2 bg-[#2874f0] text-white text-sm font-semibold rounded-lg hover:bg-[#1a5fd4]">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {fv.features?.map(f => (
                <span key={f} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-100">
                  <Zap className="h-3 w-3" />{f}
                  <button type="button" onClick={() => setValue('features', fv.features.filter(x => x !== f))}><X className="h-3 w-3 hover:text-red-500" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Search Tags</label>
            <div className="flex gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (tagInput.trim()) { const cur = getValues('tags'); setValue('tags', [...cur, tagInput.trim()]); setTagInput('') } } }}
                placeholder="e.g., sofa, furniture, modern, living room"
                className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]"
              />
              <button type="button" onClick={() => { if (tagInput.trim()) { setValue('tags', [...getValues('tags'), tagInput.trim()]); setTagInput('') } }}
                className="px-4 py-2 bg-slate-700 text-white text-sm font-semibold rounded-lg hover:bg-slate-800">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {fv.tags?.map(t => (
                <span key={t} className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">
                  #{t}
                  <button type="button" onClick={() => setValue('tags', fv.tags.filter(x => x !== t))}><X className="h-3 w-3 hover:text-red-500" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Technical Specifications</label>
            {Object.entries(fv.specifications || {}).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg mb-2">
                <span className="text-xs font-semibold text-slate-600 w-1/3 shrink-0">{k}</span>
                <span className="text-xs text-slate-700 flex-1">{String(v)}</span>
                <button type="button" onClick={() => { const { [k]: _, ...r } = fv.specifications; setValue('specifications', r) }}>
                  <Trash2 className="h-3.5 w-3.5 text-red-400 hover:text-red-600" />
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input value={specKey} onChange={e => setSpecKey(e.target.value)} placeholder="e.g., Weight"
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30" />
              <input value={specVal} onChange={e => setSpecVal(e.target.value)} placeholder="e.g., 15 kg"
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30" />
              <button type="button" onClick={() => {
                if (specKey.trim() && specVal.trim()) {
                  setValue('specifications', { ...fv.specifications, [specKey.trim()]: specVal.trim() })
                  setSpecKey(''); setSpecVal('')
                }
              }} className="px-4 py-2 bg-slate-700 text-white text-sm font-semibold rounded-lg hover:bg-slate-800">Add</button>
            </div>
          </div>
        </motion.div>
      )

      default: return null
    }
  }

  const progress = Math.round(((completedSteps.size) / STEPS.length) * 100)

  console.log("isLoading-->", isLoading)
  

  return (
    <div className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {showSuccess && (
        <SuccessModal
          onViewProducts={() => router.push('/vendor/products')}
          onAddAnother={() => { setShowSuccess(false); setCurrentStep(0); window.location.reload() }}
        />
      )}

      <div className="max-w-300 mx-auto py-6 px-4">

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Add New Product</h1>
            <p className="text-sm text-slate-500 mt-0.5">Fill in the details below to list your item for rent</p>
          </div>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200">
            <X className="h-4 w-4" />Cancel
          </button>
        </div>

        {/* Stats Bar */}
        <div className="bg-[#2874f0] rounded-2xl p-4 mb-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="h-4.5 w-4.5 text-white h-[18px] w-[18px]" />
              </div>
              <div>
                <p className="text-white font-bold text-base leading-none">{value}</p>
                <p className="text-blue-100 text-[11px] mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Layout */}
        <div className="flex gap-5">
          {/* Left: Steps Sidebar */}
          <div className="w-52 shrink-0 hidden md:block">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden sticky top-4">
              <div className="p-4 border-b border-slate-100">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-slate-600">Overall Progress</span>
                  <span className="text-xs font-bold text-[#2874f0]">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <motion.div animate={{ width: `${progress}%` }} className="h-1.5 bg-[#2874f0] rounded-full" transition={{ duration: 0.4 }} />
                </div>
              </div>
              <div className="p-2">
                {STEPS.map((step, i) => {
                  const Icon = step.icon
                  const isCurrent = currentStep === i
                  const isDone = completedSteps.has(i)
                  return (
                    <button key={i} onClick={() => goTo(i)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left group ${isCurrent ? 'bg-[#2874f0] shadow-md' : 'hover:bg-slate-50'}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${isCurrent ? 'bg-white/20' : isDone ? 'bg-green-50' : 'bg-slate-100'}`}>
                        {isDone && !isCurrent ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Icon className={`h-4 w-4 ${isCurrent ? 'text-white' : 'text-slate-500'}`} />}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold leading-none ${isCurrent ? 'text-white' : 'text-slate-700'}`}>{step.title}</p>
                        <p className={`text-[10px] mt-0.5 leading-none ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>{step.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Center: Form */}
          <div className="flex-1 min-w-0">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Mobile step indicator */}
              <div className="md:hidden bg-white rounded-2xl shadow-sm border border-slate-200/60 p-3 mb-4">
                <div className="flex overflow-x-auto gap-2 pb-1">
                  {STEPS.map((step, i) => {
                    const isDone = completedSteps.has(i)
                    const isCurrent = currentStep === i
                    return (
                      <button key={i} type="button" onClick={() => goTo(i)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isCurrent ? 'bg-[#2874f0] text-white' : isDone ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {step.short}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60">
                {/* Card Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    {(() => { const Icon = STEPS[currentStep].icon; return <div className="w-9 h-9 bg-[#ebf3fb] rounded-xl flex items-center justify-center"><Icon className="h-4.5 w-4.5 text-[#2874f0] h-[18px] w-[18px]" /></div> })()}
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">{STEPS[currentStep].title}</h2>
                      <p className="text-xs text-slate-500">{STEPS[currentStep].desc}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Step {currentStep + 1} of {STEPS.length}</span>
                </div>

                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {renderStep()}
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                  <button type="button" onClick={() => goTo(currentStep - 1)} disabled={currentStep === 0}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 rounded-xl hover:bg-white transition-all">
                    <ChevronLeft className="h-4 w-4" />Previous
                  </button>

                  {currentStep === STEPS.length - 1 ? (
                    <button type="submit" disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#fb641b] hover:bg-[#e55c18] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Publish Product
                    </button>
                  ) : (
                    <button type="button" onClick={() => goTo(currentStep + 1)}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-[#2874f0] hover:bg-[#1a5fd4] text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all">
                      Save & Continue<ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Right: Tips */}
          <div className="w-64 shrink-0 hidden lg:block">
            <div className="space-y-4 sticky top-4">
              <TipPanel step={currentStep} />

              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-[#2874f0]" />
                  <span className="text-xs font-bold text-slate-700">Seller Protections</span>
                </div>
                <ul className="space-y-2">
                  {[
                    [Lock, 'Secure Payments', 'Auto-credited monthly'],
                    [Shield, 'Damage Protection', 'Up to ₹50,000 cover'],
                    [Globe, 'Broad Reach', '500+ cities covered'],
                    [Award, 'Seller Badge', 'After 10 rentals'],
                  ].map(([Icon, title, desc]) => (
                    <li key={String(title)} className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-[#ebf3fb] rounded-md flex items-center justify-center shrink-0 mt-0.5">
                        {/* @ts-ignore */}
                        <Icon className="h-3 w-3 text-[#2874f0]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-700">{String(title)}</p>
                        <p className="text-[10px] text-slate-400">{String(desc)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-bold text-orange-700">Listing Quality Score</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    ['Category', !!fv.category],
                    ['Images', uploadedImages.length >= 4],
                    ['Description', (fv.basicInfo?.description?.length || 0) >= 100],
                    ['Pricing', fv.pricing?.monthlyRent > 0],
                    ['Pincodes', (fv.rentalTerms?.serviceablePincodes?.length || 0) > 0],
                    ['Specs', Object.keys(fv.specifications || {}).length > 0],
                  ].map(([label, done]) => (
                    <div key={String(label)} className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">{String(label)}</span>
                      <span className={`text-[11px] font-semibold ${done ? 'text-green-600' : 'text-slate-400'}`}>{done ? '✓ Done' : '○ Pending'}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-orange-600 font-semibold">Quality</span>
                    <span className="text-orange-700 font-bold">
                      {Math.round([[!!fv.category], [uploadedImages.length >= 4], [(fv.basicInfo?.description?.length || 0) >= 100], [fv.pricing?.monthlyRent > 0], [(fv.rentalTerms?.serviceablePincodes?.length || 0) > 0], [Object.keys(fv.specifications || {}).length > 0]].filter(([v]) => v).length / 6 * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-orange-100 rounded-full h-2">
                    <div
                      className="h-2 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round([[!!fv.category], [uploadedImages.length >= 4], [(fv.basicInfo?.description?.length || 0) >= 100], [fv.pricing?.monthlyRent > 0], [(fv.rentalTerms?.serviceablePincodes?.length || 0) > 0], [Object.keys(fv.specifications || {}).length > 0]].filter(([v]) => v).length / 6 * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 p-4">
                <p className="text-xs font-bold text-slate-700 mb-2">📋 Checklist</p>
                <ul className="space-y-1.5">
                  {['Add 4+ clear photos', 'Write 100+ char description', 'Set competitive pricing', 'Add 3+ pincodes', 'Add specifications'].map(item => (
                    <li key={item} className="text-[11px] text-slate-500 flex items-start gap-1.5">
                      <ArrowRight className="h-3 w-3 text-slate-300 mt-0.5 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}