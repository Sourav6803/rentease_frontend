// types/address.ts

export interface Address {
  _id: string
  type: 'home' | 'work' | 'other'
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  landmark?: string
  phone?: string
  name?: string
}

export interface AddressFormData {
  type: 'home' | 'work' | 'other'
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  landmark?: string
  phone?: string
  name?: string
}

export type AddressType = 'home' | 'work' | 'other'