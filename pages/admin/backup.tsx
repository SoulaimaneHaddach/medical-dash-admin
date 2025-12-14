import React, { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Button, message, Upload } from 'antd'
import { backupAPI } from '@/lib/api'
import { UploadOutlined } from '@ant-design/icons'

export default function AdminBackup() {
  const [creating, setCreating] = useState(false)

  async function create() {
    try {
      setCreating(true)
      const res = await backupAPI.create()
      const data = res?.data || {}
      message.success('Backup created: ' + (data.name || 'ok'))
    } catch (err) { message.error('Failed to create backup') }
    finally { setCreating(false) }
  }

  async function restore() {
    try {
      // simple restore from latest backup on server
      const res = await backupAPI.restore({ confirm: true })
      const data = res?.data || {}
      message.success('Restore completed: ' + (data.restored || 'ok'))
    } catch (err) { message.error('Failed to restore') }
  }

  return (
    <AdminLayout title="Backup & Restore">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button type="primary" loading={creating} onClick={create}>Create Backup</Button>
        <Button danger onClick={restore}>Restore Latest Backup</Button>
      </div>
      <div style={{ marginTop: 12 }}>
        <Upload
          accept=".zip"
          showUploadList={false}
          customRequest={async ({ file, onSuccess, onError }) => {
            try {
              const fd = new FormData()
              fd.append('file', file as any)
              const res = await fetch('/api/admin/backup/restore', { method: 'POST', body: fd })
              if (!res.ok) throw new Error('Upload failed')
              onSuccess && onSuccess(null as any)
              message.success('Restore from uploaded backup started')
            } catch (e) {
              onError && onError(e as any)
              message.error('Upload failed')
            }
          }}>
          <Button icon={<UploadOutlined />}>Upload & Restore</Button>
        </Upload>
      </div>
    </AdminLayout>
  )
}
