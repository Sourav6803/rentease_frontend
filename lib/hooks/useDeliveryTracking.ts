'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/components/providers/SocketProvider'

export interface DeliveryLocationPayload {
  deliveryId?: string
  deliveryNumber?: string
  location?: {
    lat: number
    lng: number
    speed?: number
    battery?: number
    accuracy?: number
  }
  status?: string
  estimatedArrival?: string
  personId?: string
  timestamp?: string
}

export interface PartnerLocationPayload {
  personId?: string
  userId?: string
  location?: DeliveryLocationPayload['location']
  currentLocation?: {
    type: 'Point'
    coordinates: [number, number]
    updatedAt?: string
  }
  activeDeliveryIds?: string[]
  timestamp?: string
}

export interface DeliveryStatusPayload {
  deliveryId?: string
  deliveryNumber?: string
  status?: string
  timestamp?: string
}

interface UseDeliveryTrackingOptions {
  deliveryId?: string
  trackingNumber?: string
  subscribePartner?: boolean
  onDeliveryLocation?: (payload: DeliveryLocationPayload) => void
  onPartnerLocation?: (payload: PartnerLocationPayload) => void
  onDeliveryStatus?: (payload: DeliveryStatusPayload) => void
}

export function useDeliveryTracking(options: UseDeliveryTrackingOptions = {}) {
  const { socket, isConnected } = useSocket()
  const { data: session } = useSession()
  const [partnerLocation, setPartnerLocation] = useState<PartnerLocationPayload['currentLocation']>()
  const [lastDeliveryLocation, setLastDeliveryLocation] = useState<DeliveryLocationPayload>()
  const partnerSubscribedRef = useRef(false)
  const trackedDeliveriesRef = useRef<Set<string>>(new Set())

  const onPartnerLocationRef = useRef(options.onPartnerLocation)
  const onDeliveryLocationRef = useRef(options.onDeliveryLocation)
  const onDeliveryStatusRef = useRef(options.onDeliveryStatus)

  onPartnerLocationRef.current = options.onPartnerLocation
  onDeliveryLocationRef.current = options.onDeliveryLocation
  onDeliveryStatusRef.current = options.onDeliveryStatus

  const role = (session?.user as { role?: string } | undefined)?.role
  const isDeliveryPartner = ['delivery', 'delivery_partner', 'delivery_boy', 'delivery_team'].includes(role || '')

  const subscribeToDelivery = useCallback(
    (deliveryId: string) => {
      if (!socket || !deliveryId || trackedDeliveriesRef.current.has(deliveryId)) return
      socket.emit('delivery:track', { deliveryId })
      trackedDeliveriesRef.current.add(deliveryId)
    },
    [socket],
  )

  const unsubscribeFromDelivery = useCallback(
    (deliveryId: string) => {
      if (!socket || !deliveryId || !trackedDeliveriesRef.current.has(deliveryId)) return
      socket.emit('delivery:untrack', { deliveryId })
      trackedDeliveriesRef.current.delete(deliveryId)
    },
    [socket],
  )

  useEffect(() => {
    if (!socket || !isConnected) return

    if (options.subscribePartner !== false && isDeliveryPartner && !partnerSubscribedRef.current) {
      socket.emit('delivery:partner:subscribe')
      partnerSubscribedRef.current = true
    }

    const handlePartnerLocation = (payload: PartnerLocationPayload) => {
      if (payload.currentLocation) {
        setPartnerLocation(payload.currentLocation)
      }
      onPartnerLocationRef.current?.(payload)
    }

    const handleDeliveryLocation = (payload: DeliveryLocationPayload) => {
      setLastDeliveryLocation(payload)
      onDeliveryLocationRef.current?.(payload)
    }

    const handleDeliveryStatus = (payload: DeliveryStatusPayload) => {
      onDeliveryStatusRef.current?.(payload)
    }

    socket.on('delivery:partner:location', handlePartnerLocation)
    socket.on('delivery:location', handleDeliveryLocation)
    socket.on('delivery:status', handleDeliveryStatus)
    socket.on('delivery:tracking', handleDeliveryStatus)

    return () => {
      socket.off('delivery:partner:location', handlePartnerLocation)
      socket.off('delivery:location', handleDeliveryLocation)
      socket.off('delivery:status', handleDeliveryStatus)
      socket.off('delivery:tracking', handleDeliveryStatus)
    }
  }, [socket, isConnected, isDeliveryPartner, options.subscribePartner])

  useEffect(() => {
    if (!options.deliveryId) return
    subscribeToDelivery(options.deliveryId)
    return () => unsubscribeFromDelivery(options.deliveryId!)
  }, [options.deliveryId, subscribeToDelivery, unsubscribeFromDelivery])

  useEffect(() => {
    if (!options.trackingNumber || !socket) return
    socket.emit('delivery:track', { trackingNumber: options.trackingNumber })
    return () => {
      socket.emit('delivery:untrack', { trackingNumber: options.trackingNumber })
    }
  }, [options.trackingNumber, socket])

  const pushLocation = useCallback(
    (lat: number, lng: number, speed?: number, battery?: number, accuracy?: number) =>
      new Promise<{ success: boolean; currentLocation?: PartnerLocationPayload['currentLocation'] }>((resolve) => {
        if (!socket || !isConnected) {
          resolve({ success: false })
          return
        }

        socket.emit(
          'delivery:location:update',
          { lat, lng, speed, battery, accuracy },
          (response: { success: boolean; currentLocation?: PartnerLocationPayload['currentLocation'] }) => {
            if (response?.currentLocation) {
              setPartnerLocation(response.currentLocation)
            }
            resolve(response || { success: false })
          },
        )
      }),
    [socket, isConnected],
  )

  return {
    partnerLocation,
    lastDeliveryLocation,
    pushLocation,
    subscribeToDelivery,
    unsubscribeFromDelivery,
    isSocketReady: Boolean(socket && isConnected),
  }
}
