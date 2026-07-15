// src/app/admin/settings/backup/types/backup.types.ts

export interface Backup {
  _id: string
  name: string
  size: number
  type: 'full' | 'incremental' | 'schema'
  status: 'completed' | 'failed' | 'in-progress' | 'pending'
  createdAt: string
  completedAt?: string
  createdBy: {
    _id: string
    name: string
    email: string
  }
  metadata: {
    collections: string[]
    documentsCount: number
    compression: 'gzip' | 'none'
    encryption: boolean
  }
  downloadUrl: string
}

export interface BackupSchedule {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  dayOfWeek?: number
  dayOfMonth?: number
  retentionDays: number
  backupType: 'full' | 'incremental'
  lastRun?: string
  nextRun?: string
}

export interface StorageStats {
  totalBackups: number
  totalSize: number
  availableSpace: number
  usedSpace: number
  backupsByDay: Array<{
    date: string
    count: number
    size: number
  }>
  averageBackupSize: number
  oldestBackup: string
  newestBackup: string
}

export interface RestoreOptions {
  backupId: string
  collections?: string[]
  options: {
    dropExisting: boolean
    createBackupBeforeRestore: boolean
    sendNotification: boolean
  }
}