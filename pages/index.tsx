// pages/index.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Card, Statistic, Row, Col, Button, Space, Tag } from 'antd'
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
import { useDoctors } from '@/hooks/useDoctors'

// Content from Ant Layout is not used directly here

// Data comes from API via hooks

export default function DashboardPage() {
  const { t } = useTranslation()
  const { doctors = [] } = useDoctors()

  const totalDoctors = doctors.length || 0
  const todayStr = new Date().toISOString().slice(0, 10)
  const pendingApprovals = (doctors || []).filter((d: any) => d.status === 'pending' || d.status === 'inactive').length
  const activeDoctors = (doctors || []).filter((d: any) => d.status === 'active').length
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const newRegistrations7d = (doctors || []).filter((d: any) => d.createdAt && new Date(d.createdAt).getTime() >= sevenDaysAgo).length


  const pendingDoctors = (doctors || []).filter((d: any) => d.status === 'pending' || d.status === 'inactive').slice(0, 5)
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
      render: (_: any) => {
        void _
        return (
          <Space>
            <Button size="small" type="primary" icon={<CheckOutlined />}>
              {t('dashboard.actions.approve')}
            </Button>
            <Button size="small" danger icon={<CloseOutlined />}>
              {t('dashboard.actions.reject')}
            </Button>
          </Space>
        )
      }
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
                value={totalDoctors}
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
                title={t('dashboard.cards.activeDoctors')}
                value={activeDoctors}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('dashboard.cards.newRegistrations7d')}
                value={newRegistrations7d}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
          </Col>
          <Col xs={24} sm={12} lg={6}>
          </Col>
        </Row>
        {/* Tables removed per request; three new cards added above */}
      </Space>
    </DashboardLayout>
  )
}