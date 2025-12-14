import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Table, Button, Space, Modal, Input, message } from 'antd'
import { bookingsAPI } from '@/lib/api'

export default function AdminAppointments() {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const [canceling, setCanceling] = useState<any | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await bookingsAPI.getAll()
      // backend may return either an array or a wrapper { items, total }
      const d = res?.data
      if (Array.isArray(d)) setRows(d)
      else if (d && Array.isArray(d.items)) setRows(d.items)
      else setRows([])
    } catch (err) {
      console.error('Failed loading bookings', err)
      message.error('Failed to load bookings')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function doConfirm(id: string) {
    try {
      setLoading(true)
      await bookingsAPI.confirm(id)
      message.success('Booking confirmed')
      await load()
    } catch (err) { message.error('Failed to confirm') } finally { setLoading(false) }
  }

  function openCancel(row: any) {
    setCanceling(row)
    setCancelReason('')
  }

  async function doCancel() {
    if (!canceling) return
    try {
      setLoading(true)
      await bookingsAPI.cancel(canceling.id, { reason: cancelReason })
      message.success('Booking canceled')
      setCanceling(null)
      await load()
    } catch (err) { message.error('Failed to cancel') }
    finally { setLoading(false) }
  }

  const cols = [
    { title: 'Patient', dataIndex: 'patientName', key: 'patientName', render: (_: any, r: any) => r.emailUser || r.patientName || '—' },
    { title: 'Doctor', dataIndex: 'doctorName', key: 'doctorName', render: (_: any, r: any) => r.doctorName || '—' },
    { title: 'Appointment Time', dataIndex: 'appointmentTime', key: 'appointmentTime' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Actions', key: 'actions', render: (_: any, record: any) => {
        return (
          <Space>
            <Button onClick={() => doConfirm(record.id)}>Confirm</Button>
            <Button danger onClick={() => openCancel(record)}>Cancel</Button>
          </Space>
        )
      }
    }
  ]

  return (
    <AdminLayout title="Appointments">
      <div style={{ marginBottom: 12 }}>
        <Button onClick={load}>Refresh</Button>
      </div>
      <Table dataSource={rows} loading={loading} columns={cols} rowKey="id" />

      <Modal open={!!canceling} onOk={doCancel} onCancel={() => setCanceling(null)} title="Cancel Booking">
        <p>Cancel booking for <b>{canceling?.patientName || canceling?.emailUser}</b></p>
        <Input.TextArea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason (optional)" />
      </Modal>
    </AdminLayout>
  )
}
