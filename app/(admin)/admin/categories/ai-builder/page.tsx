'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Loader2, Plus, Check, X, 
  ArrowRight, RefreshCw, Save, Image as ImageIcon,
  Tag, Layers, Settings, TrendingUp, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/useToast'
import Image from 'next/image'
import axios from 'axios'

interface GeneratedCategory {
  mainCategory: {
    name: string
    description: string
    keywords: string[]
    iconSuggestion: string
    colorScheme: string
    popularity: number
  }
  subCategories: Array<{
    name: string
    description: string
    attributes: Array<any>
    typicalProducts: string[]
    estimatedDemand: string
    rentalPriceRange: { min: number; max: number }
    popularBrands: string[]
  }>
  suggestedAttributes: Array<any>
  industryStandards: any
}

export default function AICategoryBuilder() {
  const [categoryName, setCategoryName] = useState('')
  const [parentCategory, setParentCategory] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<GeneratedCategory | null>(null)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [generatedIcon, setGeneratedIcon] = useState<string | null>(null)
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const toast = useToast()

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

  const generateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('Please enter a category name')
      return
    }

    setIsGenerating(true)
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/admin/ai-category/generate`, {
        categoryName,
        parentCategory: parentCategory || null
      })

      if (response.data.success) {
        setGeneratedData(response.data.data.data)
        toast.success('Category structure generated!', {
          description: 'Review and customize the suggested structure.'
        })
      }
    } catch (error) {
      console.error('Error generating category:', error)
      toast.error('Failed to generate category', {
        description: 'Please try again or check your AI service configuration.'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateIcon = async () => {
    if (!generatedData) return

    console.log('Generating icon for category:', generatedData)

    setIsGeneratingIcon(true)
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/admin/ai-category/generate-icon`, {
        categoryName: generatedData?.mainCategory?.name,
        description: generatedData.mainCategory.description
      })

      if (response.data.success) {
        setGeneratedIcon(response.data.url)
        toast.success('Category icon generated!')
      }
    } catch (error) {
      console.error('Error generating icon:', error)
      toast.error('Failed to generate icon')
    } finally {
      setIsGeneratingIcon(false)
    }
  }

  // const saveCategory = async () => {
  //   if (!generatedData) return

  //   setSaveStatus('saving')
  //   try {
  //     const response = await axios.post(`${BASE_URL}/api/v1/admin/ai-category/save`, {
  //       categoryData: {
  //         ...generatedData,
  //         mainCategory: {
  //           ...generatedData.mainCategory,
  //           iconUrl: generatedIcon
  //         }
  //       }
  //     })

  //     if (response.data.success) {
  //       setSaveStatus('saved')
  //       toast.success('Category saved successfully!')
  //       setTimeout(() => setSaveStatus('idle'), 2000)
  //     }
  //   } catch (error) {
  //     console.error('Error saving category:', error)
  //     setSaveStatus('error')
  //     toast.error('Failed to save category')
  //     setTimeout(() => setSaveStatus('idle'), 2000)
  //   }
  // }

  const saveCategory = async () => {
  if (!generatedData) return

  setSaveStatus('saving')
  try {
    // Prepare the data to match your Category schema
    const categoryDataToSave = {
      mainCategory: {
        name: generatedData.mainCategory.name,
        description: generatedData.mainCategory.description,
        keywords: generatedData.mainCategory.keywords,
        iconSuggestion: generatedData.mainCategory.iconSuggestion,
        colorScheme: generatedData.mainCategory.colorScheme,
        popularity: generatedData.mainCategory.popularity,
        iconUrl: generatedIcon || null  // Cloudinary URL from generated icon
      },
      subCategories: generatedData.subCategories.map(sub => ({
        name: sub.name,
        description: sub.description,
        attributes: sub.attributes,
        typicalProducts: sub.typicalProducts,
        estimatedDemand: sub.estimatedDemand,
        rentalPriceRange: sub.rentalPriceRange,
        popularBrands: sub.popularBrands,
        iconSuggestion: sub.iconSuggestion || '📄'
      })),
      suggestedAttributes: generatedData.suggestedAttributes,
      industryStandards: generatedData.industryStandards
    }

    const response = await axios.post(`${BASE_URL}/api/v1/admin/ai-category/save`, {
      categoryData: categoryDataToSave
    })

    if (response.data.success) {
      setSaveStatus('saved')
      toast.success('Category saved successfully!')
      setTimeout(() => {
        setSaveStatus('idle')
        // Optionally redirect to categories list
        // router.push('/admin/categories')
      }, 2000)
    } else {
      setSaveStatus('error')
      toast.error('Failed to save category', {
        description: response.data.message
      })
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  } catch (error: any) {
    console.error('Error saving category:', error)
    setSaveStatus('error')
    toast.error('Failed to save category', {
      description: error.response?.data?.message || 'Please try again'
    })
    setTimeout(() => setSaveStatus('idle'), 2000)
  }
}

  const resetForm = () => {
    setCategoryName('')
    setParentCategory('')
    setGeneratedData(null)
    setGeneratedIcon(null)
    setSelectedTab('overview')
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Category Builder
          </CardTitle>
          <CardDescription>
            Enter a category name and let AI generate a complete category structure with subcategories, attributes, and icons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label>Category Name</Label>
              <Input
                placeholder="e.g., Electronics, Furniture, Appliances"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Parent Category (Optional)</Label>
              <Input
                placeholder="e.g., Home & Living"
                value={parentCategory}
                onChange={(e) => setParentCategory(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={generateCategory}
                disabled={isGenerating || !categoryName}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {/* <AnimatePresence>
        {generatedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {generatedIcon ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                        <Image
                          src={generatedIcon}
                          alt={generatedData.mainCategory.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center text-4xl">
                        {generatedData.mainCategory.iconSuggestion}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-2xl">{generatedData.mainCategory.name}</CardTitle>
                      <CardDescription>{generatedData.mainCategory.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateIcon}
                      disabled={isGeneratingIcon}
                    >
                      {isGeneratingIcon ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <ImageIcon className="h-4 w-4 mr-2" />
                      )}
                      Generate Icon
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveCategory}
                      disabled={saveStatus !== 'idle'}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500"
                    >
                      {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {saveStatus === 'saved' && <Check className="h-4 w-4 mr-2" />}
                      {saveStatus === 'error' && <X className="h-4 w-4 mr-2" />}
                      {saveStatus === 'idle' && <Save className="h-4 w-4 mr-2" />}
                      {saveStatus === 'idle' ? 'Save Category' : 
                       saveStatus === 'saving' ? 'Saving...' :
                       saveStatus === 'saved' ? 'Saved!' : 'Failed'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={resetForm}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
                    <TabsTrigger value="attributes">Attributes</TabsTrigger>
                    <TabsTrigger value="standards">Industry Standards</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Keywords</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {generatedData.mainCategory.keywords.map((keyword) => (
                            <Badge key={keyword} variant="secondary">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Popularity Score</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {[...Array(10)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < generatedData.mainCategory.popularity
                                    ? 'fill-amber-500 text-amber-500'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <Progress value={generatedData.mainCategory.popularity * 10} className="h-2" />
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Layers className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Color Scheme</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg"
                            style={{ backgroundColor: generatedData.mainCategory.colorScheme }}
                          />
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {generatedData.mainCategory.colorScheme}
                          </code>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="subcategories" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {generatedData.subCategories.map((sub, idx) => (
                        <Card key={idx} className="bg-muted/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{sub.name}</CardTitle>
                            <CardDescription>{sub.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Typical Products</p>
                              <div className="flex flex-wrap gap-1">
                                {sub.typicalProducts.map((product, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {product}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-muted-foreground">Demand</p>
                                <Badge variant="outline" className="mt-1 capitalize">
                                  {sub.estimatedDemand}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Rental Price Range</p>
                                <p className="text-sm font-medium">
                                  ₹{sub.rentalPriceRange.min} - ₹{sub.rentalPriceRange.max}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Popular Brands</p>
                              <div className="flex flex-wrap gap-1">
                                {sub.popularBrands.map((brand, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {brand}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="attributes" className="mt-6">
                    <div className="space-y-4">
                      {generatedData.suggestedAttributes.map((attr, idx) => (
                        <div key={idx} className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Settings className="h-4 w-4 text-primary" />
                              <span className="font-medium">{attr.name}</span>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {attr.type}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {attr.options?.map((opt: string, i: number) => (
                              <Badge key={i} variant="secondary">
                                {opt}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="standards" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Specifications</h4>
                        <ul className="space-y-1">
                          {generatedData.industryStandards.specifications.map((spec: any, i:number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <Check className="h-3 w-3 text-green-500" />
                              {spec}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Warranty Terms</h4>
                        <ul className="space-y-1">
                          {generatedData.industryStandards.warrantyTerms.map((term: any, i:number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <Check className="h-3 w-3 text-green-500" />
                              {term}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Maintenance Requirements</h4>
                        <ul className="space-y-1">
                          {generatedData.industryStandards.maintenanceRequirements.map((req:any, i:number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <Check className="h-3 w-3 text-green-500" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence> */}

      <AnimatePresence>
  {generatedData && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {generatedIcon ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20">
                  <Image
                    src={generatedIcon}
                    alt={generatedData.mainCategory?.name || 'Category'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center text-4xl">
                  {generatedData.mainCategory?.iconSuggestion || '📦'}
                </div>
              )}
              <div>
                <CardTitle className="text-2xl">{generatedData.mainCategory?.name || 'Category'}</CardTitle>
                <CardDescription>{generatedData.mainCategory?.description || 'Products in this category'}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateIcon}
                disabled={isGeneratingIcon}
              >
                {isGeneratingIcon ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ImageIcon className="h-4 w-4 mr-2" />
                )}
                Generate Icon
              </Button>
              <Button
                size="sm"
                onClick={saveCategory}
                disabled={saveStatus !== 'idle'}
                className="bg-gradient-to-r from-emerald-500 to-teal-500"
              >
                {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {saveStatus === 'saved' && <Check className="h-4 w-4 mr-2" />}
                {saveStatus === 'error' && <X className="h-4 w-4 mr-2" />}
                {saveStatus === 'idle' && <Save className="h-4 w-4 mr-2" />}
                {saveStatus === 'idle' ? 'Save Category' : 
                 saveStatus === 'saving' ? 'Saving...' :
                 saveStatus === 'saved' ? 'Saved!' : 'Failed'}
              </Button>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
              <TabsTrigger value="standards">Standards</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Keywords</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generatedData.mainCategory?.keywords?.map((keyword: string) => (
                      <Badge key={keyword} variant="secondary">
                        {keyword}
                      </Badge>
                    )) || <Badge variant="secondary">{categoryName.toLowerCase()}</Badge>}
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Popularity Score</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {[...Array(10)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < (generatedData.mainCategory?.popularity || 5)
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <Progress value={(generatedData.mainCategory?.popularity || 5) * 10} className="h-2" />
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Color Scheme</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg border"
                      style={{ backgroundColor: generatedData.mainCategory?.colorScheme || '#3B82F6' }}
                    />
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {generatedData.mainCategory?.colorScheme || '#3B82F6'}
                    </code>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subcategories" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(generatedData.subCategories || []).map((sub: any, idx: number) => (
                  <Card key={idx} className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{sub.name || 'Subcategory'}</CardTitle>
                      <CardDescription>{sub.description || 'Products in this subcategory'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Typical Products</p>
                        <div className="flex flex-wrap gap-1">
                          {(sub.typicalProducts || []).map((product: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Demand</p>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {sub.estimatedDemand || 'medium'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Rental Price Range</p>
                          <p className="text-sm font-medium">
                            ₹{sub.rentalPriceRange?.min || 100} - ₹{sub.rentalPriceRange?.max || 5000}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Popular Brands</p>
                        <div className="flex flex-wrap gap-1">
                          {(sub.popularBrands || []).map((brand: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {brand}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="attributes" className="mt-6">
              <div className="space-y-4">
                {(generatedData.suggestedAttributes || []).map((attr: any, idx: number) => (
                  <div key={idx} className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-primary" />
                        <span className="font-medium">{attr.name || 'Attribute'}</span>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {attr.type || 'text'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(attr.options || []).map((opt: string, i: number) => (
                        <Badge key={i} variant="secondary">
                          {opt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="standards" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Specifications</h4>
                  <ul className="space-y-1">
                    {(generatedData.industryStandards?.specifications || []).map((spec: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Warranty Terms</h4>
                  <ul className="space-y-1">
                    {(generatedData.industryStandards?.warrantyTerms || []).map((term: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        {term}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Maintenance Requirements</h4>
                  <ul className="space-y-1">
                    {(generatedData.industryStandards?.maintenanceRequirements || []).map((req: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  )
}