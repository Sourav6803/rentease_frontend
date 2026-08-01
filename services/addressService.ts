// services/addressService.ts

import axios from 'axios'
import { Address, AddressFormData } from '@/types/address'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
}

// Note: We'll pass the auth header from the component/hook instead of accessing it directly
class AddressService {
  private getAuthHeader(accessToken?: string) {
    if (!accessToken) {
      throw new Error('Authentication token is required')
    }
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  }

  async getAddresses(accessToken: string): Promise<Address[]> {
    const response = await axios.get<ApiResponse<{ addresses: Address[] }>>(
      `${BASE_URL}/api/v1/users/addresses`,
      { headers: this.getAuthHeader(accessToken) }
    )
    if (response.data.success) {
      return response.data.data.addresses
    }
    throw new Error(response.data.message || 'Failed to fetch addresses')
  }

  async addAddress(accessToken: string, addressData: AddressFormData): Promise<Address> {
    const response = await axios.post<ApiResponse<{ address: Address }>>(
      `${BASE_URL}/api/v1/users/addresses`,
      addressData,
      { headers: this.getAuthHeader(accessToken) }
    )
    if (response.data.success) {
      return response.data.data.address
    }
    throw new Error(response.data.message || 'Failed to add address')
  }

  async updateAddress(accessToken: string, id: string, addressData: Partial<AddressFormData>): Promise<Address> {
    const response = await axios.put<ApiResponse<{ address: Address }>>(
      `${BASE_URL}/api/v1/users/addresses/${id}`,
      addressData,
      { headers: this.getAuthHeader(accessToken) }
    )
    if (response.data.success) {
      return response.data.data.address
    }
    throw new Error(response.data.message || 'Failed to update address')
  }

  async deleteAddress(accessToken: string, id: string): Promise<void> {
    const response = await axios.delete<ApiResponse>(
      `${BASE_URL}/api/v1/users/addresses/${id}`,
      { headers: this.getAuthHeader(accessToken) }
    )
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete address')
    }
  }

  async setDefaultAddress(accessToken: string, id: string): Promise<void> {
    const response = await axios.patch<ApiResponse>(
      `${BASE_URL}/api/v1/users/addresses/${id}/default`,
      {},
      { headers: this.getAuthHeader(accessToken) }
    )
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to set default address')
    }
  }
}

export const addressService = new AddressService()