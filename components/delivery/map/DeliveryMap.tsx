'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { PartnerDelivery } from '@/lib/api/delivery'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface DeliveryMapProps {
  partnerLocation: [number, number] | null
  stops: PartnerDelivery[]
  selectedStop: PartnerDelivery | null
  onStopSelect: (stop: PartnerDelivery) => void
}

function getRouteLatLngs(stop: PartnerDelivery, partnerLocation: [number, number]): L.LatLngExpression[] {
  const geometry = stop.route?.geometry ?? stop.route?.polyline
  if (geometry && typeof geometry === 'object' && 'coordinates' in geometry) {
    const coords = (geometry as { coordinates: [number, number][] }).coordinates
    if (Array.isArray(coords) && coords.length > 1) {
      return coords.map(([lng, lat]) => [lat, lng] as L.LatLngExpression)
    }
  }

  const dest = stop.address.coordinates?.coordinates
  if (!dest) return []
  return [
    [partnerLocation[1], partnerLocation[0]],
    [dest[1], dest[0]],
  ]
}

export default function DeliveryMap({
  partnerLocation,
  stops,
  selectedStop,
  onStopSelect,
}: DeliveryMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const partnerMarkerRef = useRef<L.Marker | null>(null)
  const routeLayerRef = useRef<L.LayerGroup | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([12.9716, 77.5946], 13)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OSM &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !partnerLocation) return

    const position: L.LatLngExpression = [partnerLocation[1], partnerLocation[0]]

    if (partnerMarkerRef.current) {
      partnerMarkerRef.current.setLatLng(position)
    } else {
      const customIcon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;width:20px;height:20px">
            <div style="background:#3b82f6;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px #3b82f6;position:absolute;top:3px;left:3px"></div>
            <div style="position:absolute;top:-6px;left:-6px;width:32px;height:32px;border-radius:50%;background:#3b82f6;opacity:.35;animation:deliveryPulse 1.8s infinite"></div>
          </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      partnerMarkerRef.current = L.marker(position, { icon: customIcon, zIndexOffset: 1000 })
        .addTo(mapRef.current)
        .bindPopup('<strong>You</strong>')
    }
  }, [partnerLocation])

  useEffect(() => {
    if (!mapRef.current) return

    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    const priorityColors: Record<string, string> = {
      urgent: '#ef4444',
      high: '#f97316',
      medium: '#fbbf24',
      low: '#94a3b8',
    }

    stops.forEach((stop, index) => {
      const coords = stop.address.coordinates?.coordinates
      if (!coords) return

      const isSelected = selectedStop?._id === stop._id
      const sequence = stop.optimizedSequence || index + 1
      const color = priorityColors[stop.priority] || '#f97316'

      const customIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            background:${isSelected ? color : '#1a0900'};
            width:36px;height:36px;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-weight:800;font-size:13px;
            color:${isSelected ? '#fff' : color};
            border:2.5px solid ${color};
            box-shadow:0 4px 12px rgba(0,0,0,.4);
          ">${sequence}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      const marker = L.marker([coords[1], coords[0]], { icon: customIcon })
        .addTo(mapRef.current!)
        .bindPopup(`<strong>${stop.address.contactName}</strong><br/><span style="font-size:11px;color:#666">${stop.deliveryNumber}</span>`)

      marker.on('click', () => onStopSelect(stop))
      markersRef.current[stop._id] = marker
    })

    const allPoints: L.LatLngExpression[] = []
    if (partnerLocation) allPoints.push([partnerLocation[1], partnerLocation[0]])
    stops.forEach((stop) => {
      const c = stop.address.coordinates?.coordinates
      if (c) allPoints.push([c[1], c[0]])
    })

    if (allPoints.length > 0) {
      mapRef.current.fitBounds(L.latLngBounds(allPoints), { padding: [60, 60], maxZoom: 15 })
    }
  }, [stops, partnerLocation, selectedStop, onStopSelect])

  useEffect(() => {
    if (!mapRef.current) return

    if (routeLayerRef.current) {
      routeLayerRef.current.remove()
      routeLayerRef.current = null
    }

    if (!selectedStop || !partnerLocation) return

    const latLngs = getRouteLatLngs(selectedStop, partnerLocation)
    if (latLngs.length < 2) return

    const group = L.layerGroup()

    L.polyline(latLngs, {
      color: '#f97316',
      weight: 5,
      opacity: 0.85,
      lineJoin: 'round',
      lineCap: 'round',
    }).addTo(group)

    L.polyline(latLngs, {
      color: '#fbbf24',
      weight: 2,
      opacity: 0.5,
      dashArray: '8, 12',
    }).addTo(group)

    group.addTo(mapRef.current)
    routeLayerRef.current = group
  }, [selectedStop, partnerLocation])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `@keyframes deliveryPulse{0%{transform:scale(1);opacity:.4}70%{transform:scale(2.2);opacity:0}100%{transform:scale(1);opacity:0}}`
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  return <div ref={mapContainerRef} className="h-full w-full rounded-none" />
}
