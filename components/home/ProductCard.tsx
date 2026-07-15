// // src/components/home/ProductCard.tsx
// 'use client'

// import { useState } from 'react'
// import Link from 'next/link'
// import Image from 'next/image'
// import { motion } from 'framer-motion'
// import { Heart, ShoppingCart, Star, TrendingUp } from 'lucide-react'
// import { Card, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { useToast } from '@/hooks/useToast'
// import { useSession } from 'next-auth/react'
// import axios from 'axios'

// interface ProductCardProps {
//   product: {
//     _id: string
//     basicInfo: { name: string; slug: string }
//     pricing: { monthlyRent: number; securityDeposit: number }
//     media?: { images?: Array<{ url: string; isPrimary: boolean }> }
//     ratings?: { average: number; count: number }
//     condition?: string
//   }
//   variant?: 'default' | 'compact' | 'trending' | 'list'
// }

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
//   const [isWishlisted, setIsWishlisted] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const { data: session } = useSession()
//   const toast = useToast()

//   const primaryImage = product.media?.images?.find(img => img.isPrimary)?.url || product.media?.images?.[0]?.url
//   const rating = product.ratings?.average || 0
//   const reviewCount = product.ratings?.count || 0

//   const handleAddToCart = async (e: React.MouseEvent) => {
//     e.preventDefault()
//     if (!session) {
//       toast.error('Please login to add items to cart')
//       return
//     }
//     setIsLoading(true)
//     try {
//       await axios.post(`${BASE_URL}/api/v1/cart/add`, { productId: product._id, quantity: 1 })
//       toast.success('Added to cart')
//     } catch (error) {
//       toast.error('Failed to add to cart')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleWishlist = async (e: React.MouseEvent) => {
//     e.preventDefault()
//     if (!session) {
//       toast.error('Please login to add to wishlist')
//       return
//     }
//     try {
//       if (isWishlisted) {
//         await axios.delete(`${BASE_URL}/api/v1/wishlist/${product._id}`)
//         toast.success('Removed from wishlist')
//       } else {
//         await axios.post(`${BASE_URL}/api/v1/wishlist/add`, { productId: product._id })
//         toast.success('Added to wishlist')
//       }
//       setIsWishlisted(!isWishlisted)
//     } catch (error) {
//       toast.error('Failed to update wishlist')
//     }
//   }

//   if (variant === 'compact') {
//     return (
//       <Link href={`/products/${product.basicInfo.slug}`}>
//         <Card className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden">
//           <CardContent className="p-0">
//             <div className="relative aspect-square bg-gray-100">
//               {primaryImage ? (
//                 <Image
//                   src={primaryImage}
//                   alt={product.basicInfo.name}
//                   fill
//                   className="object-cover group-hover:scale-105 transition-transform duration-300"
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
//               )}
//               <button
//                 onClick={handleWishlist}
//                 className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
//               >
//                 <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
//               </button>
//             </div>
//             <div className="p-3">
//               <h3 className="font-semibold text-sm line-clamp-1">{product.basicInfo.name}</h3>
//               <div className="flex items-center gap-1 mt-1">
//                 <div className="flex items-center">
//                   <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
//                   <span className="text-xs font-medium ml-1">{rating.toFixed(1)}</span>
//                 </div>
//                 <span className="text-xs text-muted-foreground">({reviewCount})</span>
//               </div>
//               <div className="mt-2">
//                 <span className="font-bold text-primary">₹{product.pricing.monthlyRent.toLocaleString()}</span>
//                 <span className="text-xs text-muted-foreground">/month</span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </Link>
//     )
//   }

//   // Add this to your ProductCard component
// if (variant === 'list') {
//   return (
//     <Link href={`/products/${product.basicInfo.slug}`}>
//       <Card className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden">
//         <CardContent className="p-0">
//           <div className="flex gap-4">
//             <div className="relative w-32 h-32 md:w-40 md:h-40 bg-gray-100 shrink-0">
//               {primaryImage ? (
//                 <Image src={primaryImage} alt={product.basicInfo.name} fill className="object-cover" />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
//               )}
//             </div>
//             <div className="flex-1 p-4">
//               <h3 className="font-semibold text-lg">{product.basicInfo.name}</h3>
//               <div className="flex items-center gap-2 mt-1">
//                 <div className="flex items-center">
//                   <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
//                   <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
//                 </div>
//                 <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
//               </div>
//               <div className="mt-2">
//                 <span className="text-2xl font-bold text-primary">₹{product.pricing.monthlyRent.toLocaleString()}</span>
//                 <span className="text-sm text-muted-foreground">/month</span>
//               </div>
//               <Button className="mt-3 gap-2" size="sm">
//                 <ShoppingCart className="h-4 w-4" />
//                 Add to Cart
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </Link>
//   )
// }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       whileHover={{ y: -4 }}
//       transition={{ duration: 0.3 }}
//     >
//       <Link href={`/products/${product.basicInfo.slug}`}>
//         <Card className="group cursor-pointer hover:shadow-xl transition-all overflow-hidden border-0">
//           <CardContent className="p-0">
//             {/* Image Container */}
//             <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
//               {primaryImage ? (
//                 <Image
//                   src={primaryImage}
//                   alt={product.basicInfo.name}
//                   fill
//                   className="object-cover group-hover:scale-105 transition-transform duration-500"
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
//               )}
              
//               {/* Badges */}
//               {variant === 'trending' && (
//                 <Badge className="absolute top-2 left-2 bg-orange-500 text-white border-0 gap-1">
//                   <TrendingUp className="h-3 w-3" />
//                   Trending
//                 </Badge>
//               )}
//               {product.condition === 'new' && (
//                 <Badge className="absolute top-2 left-2 bg-green-500 text-white border-0">New</Badge>
//               )}
              
//               {/* Wishlist Button */}
//               <button
//                 onClick={handleWishlist}
//                 className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
//               >
//                 <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
//               </button>
//             </div>

//             {/* Product Info */}
//             <div className="p-4">
//               <h3 className="font-semibold text-base line-clamp-2 min-h-[48px]">{product.basicInfo.name}</h3>
              
//               {/* Rating */}
//               <div className="flex items-center gap-2 mt-1">
//                 <div className="flex items-center gap-0.5">
//                   <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
//                   <span className="text-sm font-medium">{rating.toFixed(1)}</span>
//                 </div>
//                 <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
//               </div>

//               {/* Price */}
//               <div className="mt-2">
//                 <span className="text-xl font-bold text-primary">₹{product.pricing.monthlyRent.toLocaleString()}</span>
//                 <span className="text-sm text-muted-foreground">/month</span>
//               </div>

//               {/* Security Deposit */}
//               {product.pricing.securityDeposit > 0 && (
//                 <p className="text-xs text-muted-foreground mt-1">
//                   Sec. Deposit: ₹{product.pricing.securityDeposit.toLocaleString()}
//                 </p>
//               )}

//               {/* Add to Cart Button */}
//               <Button
//                 onClick={handleAddToCart}
//                 disabled={isLoading}
//                 className="w-full mt-3 gap-2 bg-primary hover:bg-primary/90"
//                 size="sm"
//               >
//                 <ShoppingCart className="h-4 w-4" />
//                 {isLoading ? 'Adding...' : 'Add to Cart'}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </Link>
//     </motion.div>
//   )
// }





// src/components/home/ProductCard.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star, TrendingUp, ShieldCheck, Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/useToast'
import { useSession } from 'next-auth/react'
import axios from 'axios'

interface ProductCardProps {
  product: {
    _id: string
    basicInfo: { name: string; slug: string }
    pricing: { monthlyRent: number; securityDeposit: number }
    media?: { images?: Array<{ url: string; isPrimary: boolean }> }
    ratings?: { average: number; count: number }
    condition?: string
  }
  variant?: 'default' | 'compact' | 'trending' | 'list'
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Shared premium button style — blue gradient, never black
const CART_BTN =
  'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-500/25 border-0'

function ImageFallback({ size = 'text-5xl' }: { size?: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <Package className={`${size} text-blue-300`} strokeWidth={1.25} />
    </div>
  )
}

function RatingRow({ rating, reviewCount, size = 'sm' }: { rating: number; reviewCount: number; size?: 'sm' | 'xs' }) {
  const starClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-3 w-3'
  const textClass = size === 'sm' ? 'text-sm' : 'text-xs'
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 rounded px-1.5 py-0.5">
        <Star className={`${starClass} fill-emerald-600 text-emerald-600`} />
        <span className={`${textClass} font-semibold`}>{rating.toFixed(1)}</span>
      </span>
      <span className="text-xs text-slate-400">({reviewCount})</span>
    </div>
  )
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const toast = useToast()

  const primaryImage = product.media?.images?.find(img => img.isPrimary)?.url || product.media?.images?.[0]?.url
  const rating = product.ratings?.average || 0
  const reviewCount = product.ratings?.count || 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!session) {
      toast.error('Please login to add items to cart')
      return
    }
    setIsLoading(true)
    try {
      await axios.post(`${BASE_URL}/api/v1/cart/add`, { productId: product._id, quantity: 1 })
      toast.success('Added to cart')
    } catch (error) {
      toast.error('Failed to add to cart')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!session) {
      toast.error('Please login to add to wishlist')
      return
    }
    try {
      if (isWishlisted) {
        await axios.delete(`${BASE_URL}/api/v1/wishlist/${product._id}`)
        toast.success('Removed from wishlist')
      } else {
        await axios.post(`${BASE_URL}/api/v1/wishlist/add`, { productId: product._id })
        toast.success('Added to wishlist')
      }
      setIsWishlisted(!isWishlisted)
    } catch (error) {
      toast.error('Failed to update wishlist')
    }
  }

  // ── Compact variant ─────────────────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <Link href={`/products/${product.basicInfo.slug}`}>
        <Card className="group cursor-pointer border border-slate-200/70 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <div className="relative aspect-square">
              {primaryImage ? (
                <Image
                  src={primaryImage}
                  alt={product.basicInfo.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <ImageFallback size="text-4xl" />
              )}
              <button
                onClick={handleWishlist}
                className="absolute top-2 right-2 bg-white/95 rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Toggle wishlist"
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
              </button>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm text-slate-900 line-clamp-1">{product.basicInfo.name}</h3>
              <div className="mt-1.5">
                <RatingRow rating={rating} reviewCount={reviewCount} size="xs" />
              </div>
              <div className="mt-2">
                <span className="font-bold text-blue-700">₹{product.pricing.monthlyRent.toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-400">/month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  // ── List variant ────────────────────────────────────────────────────────
  if (variant === 'list') {
    return (
      <Link href={`/products/${product.basicInfo.slug}`}>
        <Card className="group cursor-pointer border border-slate-200/70 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <div className="flex gap-4">
              <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
                {primaryImage ? (
                  <Image src={primaryImage} alt={product.basicInfo.name} fill className="object-cover" />
                ) : (
                  <ImageFallback size="text-3xl" />
                )}
              </div>
              <div className="flex-1 p-4 min-w-0">
                <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">{product.basicInfo.name}</h3>
                <div className="mt-1.5">
                  <RatingRow rating={rating} reviewCount={reviewCount} />
                </div>
                <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-bold text-blue-700">
                    ₹{product.pricing.monthlyRent.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-slate-400">/month</span>
                  {product.pricing.securityDeposit > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 rounded-full px-2 py-0.5">
                      <ShieldCheck className="h-3 w-3" />
                      ₹{product.pricing.securityDeposit.toLocaleString('en-IN')} deposit
                    </span>
                  )}
                </div>
                <Button onClick={handleAddToCart} disabled={isLoading} className={`mt-3 gap-2 ${CART_BTN}`} size="sm">
                  <ShoppingCart className="h-4 w-4" />
                  {isLoading ? 'Adding...' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  // ── Default / trending variant ──────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/products/${product.basicInfo.slug}`}>
        <Card className="group cursor-pointer overflow-hidden border border-slate-200/70 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 rounded-2xl">
          <CardContent className="p-0">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden">
              {primaryImage ? (
                <Image
                  src={primaryImage}
                  alt={product.basicInfo.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <ImageFallback size="text-6xl" />
              )}

              {/* Badges */}
              {variant === 'trending' && (
                <Badge className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1 shadow-sm">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </Badge>
              )}
              {product.condition === 'new' && (
                <Badge className="absolute top-2.5 left-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm">
                  New
                </Badge>
              )}

              {/* Wishlist Button */}
              <button
                onClick={handleWishlist}
                className="absolute top-2.5 right-2.5 bg-white/95 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                aria-label="Toggle wishlist"
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
              </button>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-base text-slate-900 line-clamp-2 min-h-[48px]">
                {product.basicInfo.name}
              </h3>

              {/* Rating */}
              <div className="mt-1.5">
                <RatingRow rating={rating} reviewCount={reviewCount} />
              </div>

              {/* Price */}
              <div className="mt-2.5">
                <span className="text-xl font-bold text-blue-700">
                  ₹{product.pricing.monthlyRent.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-slate-400">/month</span>
              </div>

              {/* Security Deposit */}
              {product.pricing.securityDeposit > 0 && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-slate-400" />
                  Sec. Deposit: ₹{product.pricing.securityDeposit.toLocaleString('en-IN')}
                </p>
              )}

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={isLoading}
                className={`w-full mt-3 gap-2 ${CART_BTN}`}
                size="sm"
              >
                <ShoppingCart className="h-4 w-4" />
                {isLoading ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}