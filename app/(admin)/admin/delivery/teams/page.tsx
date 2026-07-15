

'use client'

import { useState, useEffect, useRef } from "react"
import {
  Users, Search, Filter, Plus, Eye, Edit, Trash2,
  Phone, MapPin, Truck, Star, TrendingUp, Shield,
  CheckCircle, XCircle, Clock, Activity, BarChart3,
  RefreshCw, ChevronLeft, ChevronRight, Crown,
  Target, Package, Zap, ArrowUpRight, ArrowDownRight,
  Circle, MoreHorizontal, Map, Layers, Route,
  BadgeCheck, AlertCircle, Timer, Coins, Navigation,
  ChevronDown, X, SlidersHorizontal, Download,
  Award, Bike, Car, Bus
} from "lucide-react"

// ─── Mock data mirroring your API response ───────────────────────────────────
const API_TEAMS = [
  {
    _id: "6a093741d409749e5e66df89",
    name: "Team 1",
    teamCode: "TEAM0001",
    teamLead: {
      _id: "6a089f44232941bea1cb7668",
      employeeId: "DLV2600001",
      user: { profile: { firstName: "Dummy", lastName: "Rider" }, phone: "7908304027" },
      performance: { averageRating: 0, completedDeliveries: 0 },
      vehicle: { type: "bike", number: "WB 0A 42 1978", model: "HF Delux" },
      zone: "north",
      availability: { isAvailable: true, isOnDuty: false },
      status: { isActive: true, isVerified: false, verificationStatus: "pending" }
    },
    members: [
      {
        deliveryPerson: {
          _id: "6a090b49047060ca84f44f07",
          employeeId: "DLP0020",
          user: { profile: { firstName: "Abhishek", lastName: "Yadav" }, phone: "9876541020" },
          performance: { totalDeliveries: 174, completedDeliveries: 207, failedDeliveries: 14, averageRating: 3.8, onTimeRate: 99, totalDistance: 1961, totalEarnings: 21650 },
          vehicle: { type: "scooter", number: "WB401020", model: "Hero Splendor" },
          zone: "north",
          availability: { isAvailable: true, isOnDuty: true },
          status: { isActive: true, isVerified: true, verificationStatus: "verified" }
        },
        role: "helper", joinedAt: "2026-05-17T03:34:25.499Z", isActive: true
      },
      {
        deliveryPerson: {
          _id: "6a090b49047060ca84f44f00",
          employeeId: "DLP0019",
          user: { profile: { firstName: "Manoj", lastName: "Singh" }, phone: "9876541019" },
          performance: { totalDeliveries: 163, completedDeliveries: 221, failedDeliveries: 7, averageRating: 3.1, onTimeRate: 94, totalDistance: 569, totalEarnings: 38860 },
          vehicle: { type: "scooter", number: "WB401019", model: "Hero Splendor" },
          zone: "south",
          availability: { isAvailable: true, isOnDuty: true },
          status: { isActive: true, isVerified: true, verificationStatus: "verified" }
        },
        role: "helper", joinedAt: "2026-05-17T03:34:25.562Z", isActive: true
      },
      {
        deliveryPerson: {
          _id: "6a090b49047060ca84f44ef9",
          employeeId: "DLP0018",
          user: { profile: { firstName: "Vikram", lastName: "Yadav" }, phone: "9876541018" },
          performance: { totalDeliveries: 47, completedDeliveries: 366, failedDeliveries: 9, averageRating: 4.3, onTimeRate: 88, totalDistance: 3773, totalEarnings: 93019 },
          vehicle: { type: "car", number: "WB401018", model: "Hero Splendor" },
          zone: "north",
          availability: { isAvailable: true, isOnDuty: true },
          status: { isActive: true, isVerified: true, verificationStatus: "verified" }
        },
        role: "helper", joinedAt: "2026-05-17T03:34:25.620Z", isActive: true
      }
    ],
    vehicle: { type: "van", number: "DL 02 456789566", model: "HF Delux", capacity: 500, registrationNumber: "DL01AA1234" },
    zone: ["north", "south"],
    serviceablePincodes: ["713210", "713211", "713212"],
    equipment: [
      { name: "Hammer", quantity: 1, description: "Metal" },
      { name: "Plus", quantity: 1, description: "Steel" }
    ],
    availability: { isAvailable: true, isOnDuty: false },
    performance: { totalDeliveries: 0, completedDeliveries: 0, failedDeliveries: 0, averageRating: 0, onTimeRate: 0, totalDistance: 0, totalEarnings: 0 },
    currentDeliveries: [],
    maxConcurrentDeliveries: 10,
    status: { isActive: true, isVerified: false },
    createdAt: "2026-05-17T03:34:25.701Z"
  },
  // Additional seed teams for richer UI
  {
    _id: "seed_team_2",
    name: "Alpha Squad",
    teamCode: "TEAM0002",
    teamLead: {
      _id: "lead2",
      employeeId: "DLV001",
      user: { profile: { firstName: "Rahul", lastName: "Sharma" }, phone: "9876543210" },
      performance: { averageRating: 4.9, completedDeliveries: 312 },
      vehicle: { type: "bike", number: "WB10AB1234", model: "Royal Enfield" },
      zone: "north",
      availability: { isAvailable: true, isOnDuty: true },
      status: { isActive: true, isVerified: true, verificationStatus: "verified" }
    },
    members: [
      {
        deliveryPerson: {
          _id: "m2a", employeeId: "DLP0001",
          user: { profile: { firstName: "Priya", lastName: "Singh" }, phone: "9876540001" },
          performance: { totalDeliveries: 290, completedDeliveries: 278, failedDeliveries: 5, averageRating: 4.8, onTimeRate: 97, totalDistance: 4200, totalEarnings: 54000 },
          vehicle: { type: "scooter", number: "WB10CD5678", model: "Activa" },
          zone: "north",
          availability: { isAvailable: true, isOnDuty: true },
          status: { isActive: true, isVerified: true, verificationStatus: "verified" }
        },
        role: "driver", joinedAt: "2026-01-10T00:00:00Z", isActive: true
      },
      {
        deliveryPerson: {
          _id: "m2b", employeeId: "DLP0002",
          user: { profile: { firstName: "Amit", lastName: "Kumar" }, phone: "9876540002" },
          performance: { totalDeliveries: 180, completedDeliveries: 172, failedDeliveries: 3, averageRating: 4.7, onTimeRate: 96, totalDistance: 2800, totalEarnings: 36000 },
          vehicle: { type: "bike", number: "WB10EF9012", model: "Pulsar" },
          zone: "north",
          availability: { isAvailable: true, isOnDuty: true },
          status: { isActive: true, isVerified: true, verificationStatus: "verified" }
        },
        role: "helper", joinedAt: "2026-01-15T00:00:00Z", isActive: true
      }
    ],
    vehicle: { type: "van", number: "DL 10 XY 7890", model: "Tata Winger", capacity: 800 },
    zone: ["north", "east"],
    serviceablePincodes: ["713201", "713202", "713203"],
    equipment: [{ name: "Hand Truck", quantity: 2, description: "Heavy-duty" }, { name: "Straps", quantity: 4, description: "Cargo securing" }],
    availability: { isAvailable: true, isOnDuty: true },
    performance: { totalDeliveries: 470, completedDeliveries: 450, failedDeliveries: 8, averageRating: 4.8, onTimeRate: 97.1, totalDistance: 7000, totalEarnings: 90000 },
    currentDeliveries: [{ delivery: "DLV001234", status: "assigned" }],
    maxConcurrentDeliveries: 10,
    status: { isActive: true, isVerified: true },
    createdAt: "2026-01-10T00:00:00Z"
  },
  {
    _id: "seed_team_3",
    name: "Beta Force",
    teamCode: "TEAM0003",
    teamLead: {
      _id: "lead3",
      employeeId: "DLV002",
      user: { profile: { firstName: "Suresh", lastName: "Reddy" }, phone: "9876543211" },
      performance: { averageRating: 4.7, completedDeliveries: 188 },
      vehicle: { type: "car", number: "DL20AB3456", model: "Mahindra Bolero" },
      zone: "south",
      availability: { isAvailable: true, isOnDuty: true },
      status: { isActive: true, isVerified: true, verificationStatus: "verified" }
    },
    members: [
      {
        deliveryPerson: {
          _id: "m3a", employeeId: "DLP0005",
          user: { profile: { firstName: "Neha", lastName: "Gupta" }, phone: "9876540005" },
          performance: { totalDeliveries: 200, completedDeliveries: 195, failedDeliveries: 4, averageRating: 4.6, onTimeRate: 95, totalDistance: 3100, totalEarnings: 42000 },
          vehicle: { type: "scooter", number: "DL20CD7890", model: "Jupiter" },
          zone: "south",
          availability: { isAvailable: true, isOnDuty: true },
          status: { isActive: true, isVerified: true, verificationStatus: "verified" }
        },
        role: "driver", joinedAt: "2026-02-01T00:00:00Z", isActive: true
      }
    ],
    vehicle: { type: "truck", number: "DL 20 AB 3456", model: "Mahindra Bolero", capacity: 1200 },
    zone: ["south", "west"],
    serviceablePincodes: ["713204", "713205"],
    equipment: [{ name: "Forklift", quantity: 1, description: "Electric" }],
    availability: { isAvailable: true, isOnDuty: true },
    performance: { totalDeliveries: 388, completedDeliveries: 383, failedDeliveries: 11, averageRating: 4.7, onTimeRate: 96.3, totalDistance: 5400, totalEarnings: 78500 },
    currentDeliveries: [],
    maxConcurrentDeliveries: 8,
    status: { isActive: true, isVerified: true },
    createdAt: "2026-02-01T00:00:00Z"
  },
  {
    _id: "seed_team_4",
    name: "Delta Wing",
    teamCode: "TEAM0004",
    teamLead: {
      _id: "lead4",
      employeeId: "DLV003",
      user: { profile: { firstName: "Kavita", lastName: "Patel" }, phone: "9876543212" },
      performance: { averageRating: 4.5, completedDeliveries: 143 },
      vehicle: { type: "bike", number: "MH04XY1111", model: "Yamaha FZ" },
      zone: "east",
      availability: { isAvailable: false, isOnDuty: false },
      status: { isActive: true, isVerified: true, verificationStatus: "verified" }
    },
    members: [
      {
        deliveryPerson: {
          _id: "m4a", employeeId: "DLP0010",
          user: { profile: { firstName: "Ravi", lastName: "Teja" }, phone: "9876540010" },
          performance: { totalDeliveries: 120, completedDeliveries: 115, failedDeliveries: 3, averageRating: 4.4, onTimeRate: 92, totalDistance: 1900, totalEarnings: 27000 },
          vehicle: { type: "bike", number: "MH04AB2222", model: "Splendor+" },
          zone: "east",
          availability: { isAvailable: false, isOnDuty: false },
          status: { isActive: true, isVerified: true, verificationStatus: "verified" }
        },
        role: "helper", joinedAt: "2026-03-01T00:00:00Z", isActive: false
      }
    ],
    vehicle: { type: "van", number: "MH04CD3333", model: "Force Traveller", capacity: 600 },
    zone: ["east"],
    serviceablePincodes: ["713206", "713207"],
    equipment: [{ name: "Dolly Cart", quantity: 2, description: "Folding" }],
    availability: { isAvailable: false, isOnDuty: false },
    performance: { totalDeliveries: 263, completedDeliveries: 258, failedDeliveries: 5, averageRating: 4.5, onTimeRate: 93.2, totalDistance: 3800, totalEarnings: 54000 },
    currentDeliveries: [],
    maxConcurrentDeliveries: 6,
    status: { isActive: true, isVerified: true },
    createdAt: "2026-03-01T00:00:00Z"
  }
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getInitials = (first = "", last = "") =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()

const fmtCurrency = (n:any) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`

const fmtDate = (iso:any) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

const vehicleIcon = (type:any) => {
  switch (type) {
    case "bike": return <Bike size={14} />
    case "scooter": return <Bike size={14} />
    case "car": return <Car size={14} />
    case "van": return <Bus size={14} />
    case "truck": return <Truck size={14} />
    default: return <Truck size={14} />
  }
}

const getStatus = (avail:any) => {
  if (avail.isOnDuty && avail.isAvailable) return { label: "Active", color: "#10b981", bg: "#d1fae5", dot: "#10b981" }
  if (avail.isOnDuty) return { label: "On Duty", color: "#f59e0b", bg: "#fef3c7", dot: "#f59e0b" }
  return { label: "Off Duty", color: "#94a3b8", bg: "#f1f5f9", dot: "#94a3b8" }
}

type ZoneType = 'north' | 'south' | 'east' | 'west';

const ZONE_COLORS = {
  north: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  south: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
  east: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
  west: { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff" },
}

//const zoneStyle = (zone:any) => ZONE_COLORS[zone?.toLowerCase()] || { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" }
const zoneStyle = (zone?: string) => {
  const key = zone?.toLowerCase() as ZoneType;

  return (
    ZONE_COLORS[key] || {
      bg: "#f8fafc",
      text: "#475569",
      border: "#e2e8f0",
    }
  );
};

// ─── Mini star rating ─────────────────────────────────────────────────────────
const StarRating = ({ value }:any) => {
  const pct = Math.round((value / 5) * 100)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", display: "inline-flex" }}>
        {"★★★★★".split("").map((_, i) => (
          <span key={i} style={{ color: i < Math.floor(value) ? "#f59e0b" : "#e2e8f0", fontSize: 13 }}>★</span>
        ))}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>{value ? value.toFixed(1) : "—"}</span>
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ value, color = "#6366f1", trackColor = "#e2e8f0" }:any) => (
  <div style={{ height: 5, borderRadius: 9999, background: trackColor, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${Math.min(100, value || 0)}%`, borderRadius: 9999, background: color, transition: "width 0.6s ease" }} />
  </div>
)

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 36, color = "#6366f1" }:any) => {
  const initials = name.split(" ").map((n:any) => n[0]).join("").slice(0, 2).toUpperCase()
  const colors = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"]
  const idx = name.charCodeAt(0) % colors.length
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${colors[idx]}, ${colors[(idx + 2) % colors.length]})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
      letterSpacing: 0.5
    }}>
      {initials}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ label, color = "#6366f1", bg = "#eef2ff" }:any) => (
  <span style={{
    padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600,
    color, background: bg, letterSpacing: 0.3, whiteSpace: "nowrap"
  }}>
    {label}
  </span>
)

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, iconColor, trend, trendUp }:any) => (
  <div style={{
    background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9",
    padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.04)"
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `${iconColor}18`, display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <Icon size={18} color={iconColor} />
      </div>
      {trend != null && (
        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: trendUp ? "#10b981" : "#f43f5e" }}>
          {trendUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {trend}%
        </div>
      )}
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
)

// ─── Team detail drawer ───────────────────────────────────────────────────────
const TeamDrawer = ({ team, onClose }:any) => {
  if (!team) return null
  const status = getStatus(team.availability)
  const totalMembers = team.members.length + 1
  const teamPerf = team.performance

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50, display: "flex", justifyContent: "flex-end",
      background: "rgba(15,23,42,0.35)", backdropFilter: "blur(2px)"
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: "min(520px, 92vw)", height: "100%", background: "#fff",
        overflowY: "auto", display: "flex", flexDirection: "column",
        boxShadow: "-20px 0 60px rgba(0,0,0,0.12)"
      }}>
        {/* Drawer header */}
        <div style={{
          padding: "28px 28px 20px", borderBottom: "1px solid #f1f5f9",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          position: "sticky", top: 0, zIndex: 10
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar name={team.name} size={52} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 20, margin: 0 }}>{team.name}</h2>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                    background: status.bg, color: status.color
                  }}>● {status.label}</span>
                </div>
                <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0", fontFamily: "monospace" }}>{team.teamCode}</p>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}><X size={14} /></button>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            {team.zone.map((z:any) => {
              const zs = zoneStyle(z)
              return <span key={z} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: zs.bg, color: zs.text }}>{z.toUpperCase()}</span>
            })}
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>
              {totalMembers} Members
            </span>
          </div>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Performance metrics */}
          <section>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 16px" }}>Performance Overview</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Completed", value: teamPerf.completedDeliveries, color: "#10b981" },
                { label: "On-Time Rate", value: `${teamPerf.onTimeRate || 0}%`, color: "#6366f1" },
                { label: "Total Distance", value: `${(teamPerf.totalDistance || 0).toLocaleString()} km`, color: "#f59e0b" },
                { label: "Total Earnings", value: fmtCurrency(teamPerf.totalEarnings || 0), color: "#0ea5e9" },
              ].map(m => (
                <div key={m.label} style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{m.value || "—"}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, fontWeight: 500 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Team Lead */}
          <section>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 14px" }}>Team Lead</h3>
            <div style={{ background: "#f8fafc", borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={`${team.teamLead.user.profile.firstName} ${team.teamLead.user.profile.lastName}`} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>
                      {team.teamLead.user.profile.firstName} {team.teamLead.user.profile.lastName}
                    </span>
                    <Crown size={13} color="#f59e0b" />
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{team.teamLead.employeeId}</div>
                </div>
                {team.teamLead.status.isVerified
                  ? <BadgeCheck size={18} color="#10b981" />
                  : <AlertCircle size={18} color="#f59e0b" />}
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0", display: "flex", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                  <Phone size={12} />
                  {team.teamLead.user.phone}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                  <Truck size={12} />
                  {team.teamLead.vehicle?.type} · {team.teamLead.vehicle?.number}
                </div>
              </div>
            </div>
          </section>

          {/* Members */}
          <section>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 14px" }}>Members ({team.members.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {team.members.map((m:any) => {
                const dp = m.deliveryPerson
                const mStatus = getStatus(dp.availability)
                return (
                  <div key={dp._id} style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={`${dp.user.profile.firstName} ${dp.user.profile.lastName}`} size={36} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>
                            {dp.user.profile.firstName} {dp.user.profile.lastName}
                          </span>
                          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#e0e7ff", color: "#4338ca", fontWeight: 600 }}>{m.role}</span>
                          {dp.status.isVerified && <BadgeCheck size={12} color="#10b981" />}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{dp.employeeId}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: mStatus.color, fontWeight: 600 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: mStatus.dot }} />
                        {mStatus.label}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{dp.performance.completedDeliveries}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>Deliveries</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#6366f1" }}>{dp.performance.onTimeRate}%</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>On-Time</div>
                      </div>
                      <div>
                        <StarRating value={dp.performance.averageRating} />
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>Rating</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Vehicle & Equipment */}
          <section>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 14px" }}>Vehicle & Equipment</h3>
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Truck size={16} color="#6366f1" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", textTransform: "capitalize" }}>{team.vehicle.model} ({team.vehicle.type})</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{team.vehicle.number}</div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: "#6366f1", background: "#eef2ff", padding: "3px 10px", borderRadius: 999 }}>
                  Cap: {team.vehicle.capacity} kg
                </span>
              </div>
              {team.equipment.length > 0 && (
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>EQUIPMENT</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {team.equipment.map((eq:any, i:any) => (
                      <span key={i} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "#fff", border: "1px solid #e2e8f0", color: "#475569", fontWeight: 500 }}>
                        {eq.name} ×{eq.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Pincodes */}
          <section>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px" }}>Serviceable Pincodes</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {team.serviceablePincodes.map((p:any) => (
                <span key={p} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "#f1f5f9", color: "#475569", fontWeight: 600, fontFamily: "monospace" }}>{p}</span>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
            <button style={{
              flex: 1, padding: "11px 0", borderRadius: 12, border: "1px solid #e2e8f0",
              background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6
            }}>
              <Edit size={15} /> Edit Team
            </button>
            <button style={{
              flex: 1, padding: "11px 0", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6
            }}>
              <Route size={15} /> Assign Delivery
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Team Card ────────────────────────────────────────────────────────────────
const TeamCard = ({ team, onView, onEdit, onDelete }:any) => {
  const status = getStatus(team.availability)
  const totalMembers = team.members.length + 1
  const perf = team.performance
  const leadName = `${team.teamLead.user.profile.firstName} ${team.teamLead.user.profile.lastName}`
  const successRate = perf.totalDeliveries > 0
    ? Math.round((perf.completedDeliveries / perf.totalDeliveries) * 100)
    : 0

  return (
    <div style={{
      background: "#fff", borderRadius: 20, border: "1px solid #f1f5f9",
      overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.2s, transform 0.2s",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.08)"
        e.currentTarget.style.transform = "translateY(-2px)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"
        e.currentTarget.style.transform = "translateY(0)"
      }}
      onClick={() => onView(team)}
    >
      {/* Card accent stripe */}
      <div style={{
        height: 4,
        background: status.label === "Active"
          ? "linear-gradient(90deg, #10b981, #34d399)"
          : status.label === "On Duty"
            ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
            : "linear-gradient(90deg, #94a3b8, #cbd5e1)"
      }} />

      <div style={{ padding: "20px 22px" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <Avatar name={team.name} size={48} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{team.name}</h3>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                  background: status.bg, color: status.color
                }}>● {status.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{team.teamCode}</span>
                {team.status.isVerified
                  ? <BadgeCheck size={12} color="#10b981" />
                  : <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 600 }}>⚠ Pending</span>}
              </div>
            </div>
          </div>
          {/* Action buttons */}
          <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => onEdit(team)} style={{
              width: 30, height: 30, borderRadius: 8, border: "1px solid #f1f5f9",
              background: "#f8fafc", color: "#64748b", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center"
            }} title="Edit"><Edit size={12} /></button>
            <button onClick={() => onDelete(team)} style={{
              width: 30, height: 30, borderRadius: 8, border: "1px solid #fee2e2",
              background: "#fef2f2", color: "#f43f5e", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center"
            }} title="Delete"><Trash2 size={12} /></button>
          </div>
        </div>

        {/* Lead info */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14, padding: "8px 12px", background: "#fffbeb", borderRadius: 10, border: "1px solid #fef3c7" }}>
          <Crown size={13} color="#f59e0b" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>Lead:</span>
          <span style={{ fontSize: 12, color: "#78350f" }}>{leadName}</span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
            <Users size={11} /> {totalMembers}
          </span>
        </div>

        {/* Zone + Vehicle chips */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {team.zone.map((z:any) => {
            const zs = zoneStyle(z)
            return (
              <span key={z} style={{
                fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999,
                background: zs.bg, color: zs.text, border: `1px solid ${zs.border}`
              }}><MapPin size={9} style={{ display: "inline", marginRight: 3 }} />{z.toUpperCase()}</span>
            )
          })}
          <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 999, background: "#f1f5f9", color: "#475569", display: "flex", alignItems: "center", gap: 4 }}>
            {vehicleIcon(team.vehicle.type)} {team.vehicle.type}
          </span>
        </div>

        {/* Performance metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Deliveries", value: perf.completedDeliveries, color: "#0f172a" },
            { label: "On-Time", value: `${perf.onTimeRate || 0}%`, color: "#6366f1" },
            { label: "Earnings", value: fmtCurrency(perf.totalEarnings || 0), color: "#10b981" },
          ].map(m => (
            <div key={m.label} style={{ textAlign: "center", padding: "10px 8px", background: "#f8fafc", borderRadius: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.value || "0"}</div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, fontWeight: 500 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Success rate bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Success Rate</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: successRate >= 90 ? "#10b981" : successRate >= 70 ? "#f59e0b" : "#f43f5e" }}>{successRate}%</span>
          </div>
          <ProgressBar value={successRate} color={successRate >= 90 ? "#10b981" : successRate >= 70 ? "#f59e0b" : "#f43f5e"} />
        </div>

        {/* Rating + Active deliveries */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <StarRating value={perf.averageRating} />
          {team.currentDeliveries.length > 0 ? (
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "#dbeafe", color: "#1d4ed8", display: "flex", alignItems: "center", gap: 4 }}>
              <Activity size={10} /> {team.currentDeliveries.length} active
            </span>
          ) : (
            <span style={{ fontSize: 11, color: "#cbd5e1" }}>No active deliveries</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DeliveryTeamsPage() {
  const [teams, setTeams] = useState(API_TEAMS)
  const [search, setSearch] = useState("")
  const [filterZone, setFilterZone] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [page, setPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const PER_PAGE = 6

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1200)
  }

  const filtered = teams.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = t.name.toLowerCase().includes(q) ||
      t.teamCode.toLowerCase().includes(q) ||
      `${t.teamLead.user.profile.firstName} ${t.teamLead.user.profile.lastName}`.toLowerCase().includes(q)
    const matchZone = filterZone === "all" || t.zone.map(z => z.toLowerCase()).includes(filterZone)
    const s = getStatus(t.availability).label.toLowerCase()
    const matchStatus = filterStatus === "all" || s === filterStatus.toLowerCase()
    return matchSearch && matchZone && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const allActive = teams.filter(t => t.availability.isAvailable && t.availability.isOnDuty).length
  const allOnDuty = teams.filter(t => t.availability.isOnDuty).length
  const avgRating = teams.length
    ? (teams.reduce((s, t) => s + (t.performance.averageRating || 0), 0) / teams.length).toFixed(1)
    : "—"
  const totalDeliveries = teams.reduce((s, t) => s + t.performance.completedDeliveries, 0)

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif" }}>

      {/* Top header bar */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #f1f5f9",
        padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 30
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#94a3b8" }}>
          <span>Delivery Management</span>
          <span>/</span>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>Teams</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={handleRefresh} style={{
            width: 36, height: 36, borderRadius: 10, border: "1px solid #e2e8f0",
            background: "#f8fafc", color: "#64748b", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <RefreshCw size={14} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }} />
          </button>
          <button style={{
            height: 36, padding: "0 14px", borderRadius: 10, border: "1px solid #e2e8f0",
            background: "#f8fafc", color: "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 500,
            display: "flex", alignItems: "center", gap: 6
          }}>
            <Download size={13} /> Export
          </button>
          <button style={{
            height: 36, padding: "0 16px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
            cursor: "pointer", fontSize: 13, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)"
          }}>
            <Plus size={14} /> Create Team
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: -0.5 }}>
            Delivery Teams
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>
            Manage group delivery operations, track performance and assign routes.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
          <StatCard label="Total Teams" value={teams.length} icon={Users} iconColor="#6366f1" trend={12} trendUp />
          <StatCard label="Active Teams" value={allActive} sub="Available & on duty" icon={Activity} iconColor="#10b981" trend={5} trendUp />
          <StatCard label="On Duty Now" value={allOnDuty} icon={Truck} iconColor="#f59e0b" />
          <StatCard label="Avg Team Rating" value={avgRating} icon={Star} iconColor="#f43f5e" />
          <StatCard label="Total Deliveries" value={totalDeliveries.toLocaleString()} icon={Package} iconColor="#0ea5e9" trend={8} trendUp />
        </div>

        {/* Performance summary strip */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: 20, padding: "24px 28px", marginBottom: 28,
          display: "flex", gap: 0, overflow: "hidden", position: "relative"
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(99,102,241,0.15)" }} />
          <div style={{ position: "absolute", bottom: -50, right: 120, width: 150, height: 150, borderRadius: "50%", background: "rgba(139,92,246,0.1)" }} />
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Fleet Overview</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
              {filtered.length} <span style={{ fontSize: 16, fontWeight: 500, color: "#94a3b8" }}>teams shown</span>
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
              {allActive} active · {allOnDuty} on duty · {teams.length - allOnDuty} off duty
            </div>
          </div>
          <div style={{ display: "flex", gap: 32, zIndex: 1, alignItems: "center" }}>
            {[
              { label: "Total Earnings", value: fmtCurrency(teams.reduce((s, t) => s + t.performance.totalEarnings, 0)), color: "#10b981" },
              { label: "Total Distance", value: `${teams.reduce((s, t) => s + t.performance.totalDistance, 0).toLocaleString()} km`, color: "#6366f1" },
            ].map(m => (
              <div key={m.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 3, fontWeight: 500 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9",
          padding: "16px 20px", marginBottom: 24, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center"
        }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name, code, or team lead…"
              style={{
                width: "100%", paddingLeft: 36, paddingRight: 12, height: 38,
                borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13,
                color: "#0f172a", background: "#f8fafc", outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>
          <select value={filterZone} onChange={e => { setFilterZone(e.target.value); setPage(1) }}
            style={{ height: 38, padding: "0 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#374151", background: "#f8fafc", cursor: "pointer" }}>
            <option value="all">All Zones</option>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="east">East</option>
            <option value="west">West</option>
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            style={{ height: 38, padding: "0 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#374151", background: "#f8fafc", cursor: "pointer" }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on duty">On Duty</option>
            <option value="off duty">Off Duty</option>
          </select>
          {(search || filterZone !== "all" || filterStatus !== "all") && (
            <button onClick={() => { setSearch(""); setFilterZone("all"); setFilterStatus("all"); setPage(1) }}
              style={{ height: 38, padding: "0 14px", borderRadius: 10, border: "1px solid #fee2e2", background: "#fef2f2", color: "#f43f5e", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <X size={12} /> Clear
            </button>
          )}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Teams grid */}
        {paged.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f1f5f9", padding: "64px 32px", textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: 20, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Users size={28} color="#94a3b8" />
            </div>
            <h3 style={{ color: "#0f172a", fontWeight: 700, fontSize: 18, margin: "0 0 8px" }}>No teams found</h3>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 20px" }}>Try adjusting your search or filter criteria.</p>
            <button onClick={() => { setSearch(""); setFilterZone("all"); setFilterStatus("all") }}
              style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {paged.map(team => (
              <TeamCard key={team._id} team={team}
                onView={(t:any) => setSelectedTeam(t)}
                onEdit={(t:any) => console.log("edit", t._id)}
                onDelete={(t:any) => confirm(`Delete "${t.name}"?`) && setTeams(prev => prev.filter(x => x._id !== t._id))}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, padding: "14px 20px", background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>
              Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid #e2e8f0", background: page === 1 ? "#f8fafc" : "#fff", color: page === 1 ? "#cbd5e1" : "#374151", cursor: page === 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  style={{ width: 34, height: 34, borderRadius: 9, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", background: page === n ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#f8fafc", color: page === n ? "#fff" : "#64748b" }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid #e2e8f0", background: page === totalPages ? "#f8fafc" : "#fff", color: page === totalPages ? "#cbd5e1" : "#374151", cursor: page === totalPages ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Tips banner */}
        <div style={{
          marginTop: 28, borderRadius: 20, padding: "22px 26px",
          background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)",
          border: "1px solid #dbeafe", display: "flex", alignItems: "flex-start", gap: 16
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Target size={20} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#1e40af", fontSize: 15, marginBottom: 5 }}>Best Practices for Team Management</div>
            <div style={{ fontSize: 13, color: "#3b82f6", lineHeight: 1.6 }}>
              Teams with 2–3 verified members deliver <strong>31% faster</strong> on average. Assign a dedicated team lead with a capacity vehicle (van/truck) for bulk delivery zones. Monitor on-time rates weekly and re-assign underperforming members promptly.
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedTeam && <TeamDrawer team={selectedTeam} onClose={() => setSelectedTeam(null)} />}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { margin: 0; }
        input:focus { border-color: #6366f1 !important; outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
        select:focus { border-color: #6366f1 !important; outline: none; }
        button:active { transform: scale(0.97); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
      `}</style>
    </div>
  )
}