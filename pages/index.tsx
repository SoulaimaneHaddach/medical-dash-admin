// pages/index.tsx
import React from 'react'
import { Layout, Card, Statistic, Row, Col, Table, Tag, Button, Space } from 'antd'
import { useTranslation } from '@/lib/i18n'
import { 
  UserOutlined, 
  CalendarOutlined, 
  TeamOutlined, 
  BarChartOutlined,
  RiseOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import DashboardLayout from '@/components/Layout'

const { Content } = Layout

// Mock data
const mockStats = {
  totalDoctors: 45,
  todayBookings: 12,
  pendingApprovals: 3,
  totalBookings: 234,
}

const recentBookings = [
  { id: 1, patient: 'John Doe', doctor: 'Dr. Sarah Johnson', date: '2025-11-26', status: 'confirmed' },
  { id: 2, patient: 'Jane Smith', doctor: 'Dr. Maria Garcia', date: '2025-11-26', status: 'pending' },
  { id: 3, patient: 'Mike Brown', doctor: 'Dr. James Wilson', date: '2025-11-27', status: 'completed' },
]

const pendingDoctors = [
  { id: 1, name: 'Dr. Ahmed Hassan', specialty: 'Neurology' },
  { id: 2, name: 'Dr. Li Wei', specialty: 'Dermatology' },
]

export default function DashboardPage() {
  const { t } = useTranslation()
  const bookingColumns = [
    { title: t('dashboard.columns.patient'), dataIndex: 'patient', key: 'patient' },
    { title: t('dashboard.columns.doctor'), dataIndex: 'doctor', key: 'doctor' },
    { title: t('dashboard.columns.date'), dataIndex: 'date', key: 'date' },
    {
      title: t('dashboard.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          confirmed: 'green',
          pending: 'orange',
          completed: 'blue',
        }
        const labels: Record<string, string> = {
          confirmed: t('bookings.status.confirmed'),
          pending: t('bookings.status.pending'),
          completed: t('bookings.status.completed'),
        }
        return <Tag color={colors[status]}>{labels[status]}</Tag>
      },
    },
  ]

  const doctorColumns = [
    { title: t('dashboard.columns.name'), dataIndex: 'name', key: 'name' },
    { title: t('dashboard.columns.specialty'), dataIndex: 'specialty', key: 'specialty' },
    {
      title: t('dashboard.columns.actions'),
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" type="primary" icon={<CheckOutlined />}>
            {t('dashboard.actions.approve')}
          </Button>
          <Button size="small" danger icon={<CloseOutlined />}>
            {t('dashboard.actions.reject')}
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Statistics Cards */}
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('dashboard.cards.totalDoctors')}
                value={mockStats.totalDoctors}
                prefix={<UserOutlined />}
                suffix={
                  <RiseOutlined style={{ color: '#3f8600', fontSize: 14 }} />
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('dashboard.cards.todaysBookings')}
                value={mockStats.todayBookings}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('dashboard.cards.pendingApprovals')}
                value={mockStats.pendingApprovals}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('dashboard.cards.totalBookings')}
                value={mockStats.totalBookings}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Tables */}
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card 
              title={t('dashboard.tables.recentBookings')} 
              extra={<Button type="link">{t('dashboard.viewAll')}</Button>}
            >
              <Table
                dataSource={recentBookings}
                columns={bookingColumns}
                pagination={false}
                size="small"
                rowKey="id"
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card 
              title={t('dashboard.tables.pendingDoctors')} 
              extra={<Button type="link">{t('dashboard.viewAll')}</Button>}
            >
              <Table
                dataSource={pendingDoctors}
                columns={doctorColumns}
                pagination={false}
                size="small"
                rowKey="id"
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </DashboardLayout>
  )
}