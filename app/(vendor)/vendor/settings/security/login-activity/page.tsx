// app/vendor/security/login-activity/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Monitor, Smartphone, Tablet, Globe, MapPin,
  Clock, CheckCircle, XCircle, AlertTriangle,
  ChevronLeft, ChevronRight, Filter, Download,
  LogOut, Shield
} from 'lucide-react'
import { format } from 'date-fns'

interface LoginSession {
  id: string
  device: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  ip: string
  location: string
  lastActive: string
  isCurrent: boolean
  status: 'active' | 'expired'
}

const sessions: LoginSession[] = [
  {
    id: '1',
    device: 'Chrome on Windows',
    deviceType: 'desktop',
    browser: 'Chrome 120',
    os: 'Windows 11',
    ip: '103.58.154.78',
    location: 'Mumbai, India',
    lastActive: '2024-01-15T10:30:00',
    isCurrent: true,
    status: 'active'
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    deviceType: 'mobile',
    browser: 'Safari',
    os: 'iOS 17',
    ip: '203.192.245.12',
    location: 'Delhi, India',
    lastActive: '2024-01-14T15:20:00',
    isCurrent: false,
    status: 'active'
  },
  {
    id: '3',
    device: 'Firefox on Mac',
    deviceType: 'desktop',
    browser: 'Firefox 121',
    os: 'macOS 14',
    ip: '45.118.167.34',
    location: 'Bangalore, India',
    lastActive: '2024-01-10T09:15:00',
    isCurrent: false,
    status: 'expired'
  }
]

const loginHistory = [
  { date: '2024-01-15 10:30:00', device: 'Chrome on Windows', ip: '103.58.154.78', location: 'Mumbai, India', status: 'success' },
  { date: '2024-01-14 15:20:00', device: 'Safari on iPhone', ip: '203.192.245.12', location: 'Delhi, India', status: 'success' },
  { date: '2024-01-13 08:45:00', device: 'Chrome on Windows', ip: '103.58.154.78', location: 'Mumbai, India', status: 'success' },
  { date: '2024-01-12 22:10:00', device: 'Unknown Device', ip: '45.118.167.99', location: 'Unknown', status: 'failed' },
  { date: '2024-01-11 11:30:00', device: 'Firefox on Mac', ip: '45.118.167.34', location: 'Bangalore, India', status: 'success' }
]

const getDeviceIcon = (type: string) => {
  switch(type) {
    case 'desktop': return Monitor
    case 'mobile': return Smartphone
    case 'tablet': return Tablet
    default: return Monitor
  }
}

export default function LoginActivityPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Review Your Sessions</p>
            <p className="text-sm text-blue-700">
              If you see any unfamiliar devices or locations, end the session immediately and change your password.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'active'
                ? 'bg-[#2874f0] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active Sessions ({sessions.filter(s => s.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-[#2874f0] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Login History
          </button>
        </div>
      </div>

      {activeTab === 'active' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">Active Sessions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Devices currently logged into your account</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="h-4 w-4" />
              Log Out All Devices
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {sessions.filter(s => s.status === 'active').map((session) => {
              const DeviceIcon = getDeviceIcon(session.deviceType)
              return (
                <div key={session.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      session.isCurrent ? 'bg-green-100' : 'bg-slate-100'
                    }`}>
                      <DeviceIcon className={`h-5 w-5 ${session.isCurrent ? 'text-green-600' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-800">{session.device}</p>
                        {session.isCurrent && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Current Session</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>{session.browser}</span>
                        <span>•</span>
                        <span>{session.os}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {session.ip}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last active: {format(new Date(session.lastActive), 'dd MMM, hh:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      Log Out
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">Login History</h2>
              <p className="text-xs text-slate-500 mt-0.5">Last 30 days of login activity</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#2874f0] hover:bg-[#ebf3fb] rounded-lg transition-colors">
              <Download className="h-4 w-4" />
              Download Logs
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Date & Time</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Device</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">IP Address</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Location</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loginHistory.map((login, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {format(new Date(login.date), 'dd MMM yyyy, hh:mm a')}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">{login.device}</td>
                    <td className="px-6 py-3 text-sm font-mono text-slate-500">{login.ip}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{login.location}</td>
                    <td className="px-6 py-3">
                      {login.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Successful
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600">
                          <XCircle className="h-3 w-3" />
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing 5 of 23 entries</p>
            <div className="flex gap-1.5">
              <button className="p-2 rounded-lg border border-slate-200 disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="px-3 py-1 rounded-lg bg-[#2874f0] text-white text-sm">1</button>
              <button className="px-3 py-1 rounded-lg hover:bg-slate-100 text-sm">2</button>
              <button className="px-3 py-1 rounded-lg hover:bg-slate-100 text-sm">3</button>
              <button className="p-2 rounded-lg border border-slate-200">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">Security Recommendations</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Enable 2FA for all devices
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                End unused sessions regularly
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Never share login credentials
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Report suspicious activity immediately
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}