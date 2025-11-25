// pages/bookings/index.tsx
import React, { useState } from 'react'
import { Table, Button, Input, Space, Tag, Row, Col, Select, DatePicker } from 'antd'
import { useTranslation } from '@/lib/i18n'
import { SearchOutlined, FileTextOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import DashboardLayout from '@/components/Layout'
import type { ColumnsType } from 'antd/es/table'

const { RangePicker } = DatePicker

interface Booking {
  id: number
  patient: string
  doctor: string
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  specialty: string
}

const mockBookings: Booking[] = [
  { id: 1, patient: 'John Doe', doctor: 'Dr. Sarah Johnson', date: '2025-11-26', time: '10:00', status: 'confirmed', specialty: 'Cardiology' },
  { id: 2, patient: 'Jane Smith', doctor: 'Dr. Maria Garcia', date: '2025-11-26', time: '14:30', status: 'pending', specialty: 'Pediatrics' },
  { id: 3, patient: 'Mike Brown', doctor: 'Dr. James Wilson', date: '2025-11-27', time: '09:00', status: 'completed', specialty: 'Orthopedics' },
  { id: 4, patient: 'Sarah Davis', doctor: 'Dr. Sarah Johnson', date: '2025-11-27', time: '11:00', status: 'cancelled', specialty: 'Cardiology' },
  { id: 5, patient: 'Ahmed Ali', doctor: 'Dr. Ahmed Hassan', date: '2025-11-28', time: '15:00', status: 'pending', specialty: 'Neurology' },
  { id: 6, patient: 'Emma Wilson', doctor: 'Dr. Li Wei', date: '2025-11-28', time: '16:30', status: 'confirmed', specialty: 'Dermatology' },
  { id: 7, patient: 'Omar Hassan', doctor: 'Dr. Maria Garcia', date: '2025-11-29', time: '10:30', status: 'confirmed', specialty: 'Pediatrics' },
]

export default function BookingsPage() {
  const { t } = useTranslation()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [bookings] = useState(mockBookings)

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.patient.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.doctor.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.specialty.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const columns: ColumnsType<Booking> = [
    {
      title: t('bookings.columns.number'),
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: t('bookings.columns.patient'),
      dataIndex: 'patient',
      key: 'patient',
    },
    {
      title: t('bookings.columns.doctor'),
      dataIndex: 'doctor',
      key: 'doctor',
    },
    {
      title: t('bookings.columns.date'),
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: t('bookings.columns.time'),
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: t('bookings.columns.specialty'),
      dataIndex: 'specialty',
      key: 'specialty',
    },
    {
      title: t('bookings.columns.status'),
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: t('bookings.status.confirmed'), value: 'confirmed' },
        { text: t('bookings.status.pending'), value: 'pending' },
        { text: t('bookings.status.completed'), value: 'completed' },
        { text: t('bookings.status.cancelled'), value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        const colors: Record<string, string> = {
          confirmed: 'green',
          pending: 'orange',
          completed: 'blue',
          cancelled: 'red',
        }
        const labels: Record<string, string> = {
          confirmed: t('bookings.status.confirmed'),
          pending: t('bookings.status.pending'),
          completed: t('bookings.status.completed'),
          cancelled: t('bookings.status.cancelled'),
        }
        return <Tag color={colors[status]}>{labels[status]}</Tag>
      },
    },
    {
      title: t('bookings.columns.actions'),
      key: 'actions',
      width: 150,
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>
            {t('bookings.actions.view')}
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />}>
            {t('bookings.actions.edit')}
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Filters */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Input
              placeholder={t('bookings.placeholders.search')}
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder={t('bookings.placeholders.filter')}
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Select.Option value="all">{t('bookings.status.all')}</Select.Option>
              <Select.Option value="confirmed">{t('bookings.status.confirmed')}</Select.Option>
              <Select.Option value="pending">{t('bookings.status.pending')}</Select.Option>
              <Select.Option value="completed">{t('bookings.status.completed')}</Select.Option>
              <Select.Option value="cancelled">{t('bookings.status.cancelled')}</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <RangePicker style={{ width: '100%' }} placeholder={[t('bookings.placeholders.fromDate'), t('bookings.placeholders.toDate')]} />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Button icon={<FileTextOutlined />} block>
             {t('bookings.actions.export')}
            </Button>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="id"
            pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t('bookings.showTotal', { total }),
          }}
          scroll={{ x: 1000 }}
        />
      </Space>
    </DashboardLayout>
  )
}