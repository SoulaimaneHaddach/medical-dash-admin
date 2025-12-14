import React from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Button, message } from 'antd'

export default function AdminMaintenance() {
  async function restart() {
    try {
      const res = await fetch('/api/admin/restart', { method: 'POST' })
      const data = await res.json()
      message.success(data.message || 'Restart requested')
    } catch (err) { message.error('Failed') }
  }

  async function clearCache() {
    try {
      const res = await fetch('/api/admin/clear-cache', { method: 'POST' })
      const data = await res.json()
      const count = data?.count ?? data?.cleared?.length ?? 0
      message.success(`Cleared ${count} caches`)
    } catch (err) { message.error('Failed') }
  }

  async function cleanTemp() {
    try {
      const res = await fetch('/api/admin/clean-temp', { method: 'POST' })
      const data = await res.json()
      const count = data?.count ?? 0
      message.success(`Deleted ${count} temp files`)
    } catch (err) { message.error('Failed') }
  }

  return (
    <AdminLayout title="Maintenance Tools">
      <div style={{ display: 'flex', gap: 12 }}>
        <Button type="primary" danger onClick={restart}>Restart App</Button>
        <Button onClick={clearCache}>Clear Cache</Button>
        <Button onClick={cleanTemp}>Clean Temp</Button>
      </div>
    </AdminLayout>
  )
}
