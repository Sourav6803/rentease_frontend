// src/hooks/useCart.ts
// Cart state now lives in a shared React Context so every consumer (Header,
// product page, cart page, CartStrip) reads the same instance and updates
// instantly. This file is kept as a re-export shim for backward-compatible imports.
export { useCart, CartProvider } from '@/contexts/CartContext'
export type { Cart, CartItem, CartSummary, CartCoupon } from '@/contexts/CartContext'
