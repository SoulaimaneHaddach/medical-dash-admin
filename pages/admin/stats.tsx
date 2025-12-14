import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Card, Row, Col, Button, message } from 'antd'

export default function AdminStats() {
  const [stats, setStats] = useState<any>(null)

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      message.error('Failed to load stats')
    }
  }

  useEffect(() => { fetchStats() }, [])

  return (
    <AdminLayout title="Statistics">
      <Row gutter={[16, 16]}>
        <Col span={6}><Card title="Indicators">{stats?.indicators ?? '—'}</Card></Col>
        <Col span={6}><Card title="Patients">{stats?.patients ?? '—'}</Card></Col>
        <Col span={6}><Card title="Daily Appointments">{stats?.dailyAppointments ?? '—'}</Card></Col>
        <Col span={6}><Card title="Favorite Users">{stats?.favoriteUsers ?? '—'}</Card></Col>
      </Row>
      <div style={{ marginTop: 24 }}>
        <Button onClick={fetchStats}>Refresh</Button>
      </div>
    </AdminLayout>
  )
}
