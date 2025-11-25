// pages/users/index.tsx
import React, { useState } from 'react'
import { Table, Button, Input, Space, Tag, Avatar, Row, Col, Select } from 'antd'
import { SearchOutlined, UserOutlined, LockOutlined, UnlockOutlined, EyeOutlined } from '@ant-design/icons'
import DashboardLayout from '@/components/Layout'
import { useTranslation } from '@/lib/i18n'
import type { ColumnsType } from 'antd/es/table'

interface User {
  id: number
  name: string
  email: string
  phone: string
  status: 'active' | 'banned' | 'pending'
  bookings: number
  joinedDate: string
}

const mockUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', status: 'active', bookings: 5, joinedDate: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', status: 'active', bookings: 8, joinedDate: '2024-02-20' },
  { id: 3, name: 'Mike Brown', email: 'mike@example.com', phone: '+1234567892', status: 'banned', bookings: 2, joinedDate: '2024-03-10' },
  { id: 4, name: 'Sarah Davis', email: 'sarah@example.com', phone: '+1234567893', status: 'active', bookings: 12, joinedDate: '2024-01-05' },
  { id: 5, name: 'Ahmed Ali', email: 'ahmed@example.com', phone: '+1234567894', status: 'pending', bookings: 0, joinedDate: '2024-11-20' },
]

export default function UsersPage() {
  const { t } = useTranslation()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [users, setUsers] = useState(mockUsers)

  const handleBanUser = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'banned' as const } : u))
  }

  const handleUnbanUser = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'active' as const } : u))
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.phone.includes(searchText)
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const columns: ColumnsType<User> = [
    {
      title: t('users.user'),
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />}>
            {record.name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: t('users.phone'),
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: t('users.status'),
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: t('users.active'), value: 'active' },
        { text: t('users.banned'), value: 'banned' },
        { text: t('users.pending'), value: 'pending' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: 'green',
          banned: 'red',
          pending: 'orange',
        }
        const labels: Record<string, string> = {
          active: t('users.active'),
          banned: t('users.banned'),
          pending: t('users.pending'),
        }
        return <Tag color={colors[status]}>{labels[status]}</Tag>
      },
    },
    {
      title: t('users.bookings'),
      dataIndex: 'bookings',
      key: 'bookings',
      sorter: (a, b) => a.bookings - b.bookings,
    },
    {
      title: t('users.joinedDate'),
      dataIndex: 'joinedDate',
      key: 'joinedDate',
      sorter: (a, b) => new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime(),
    },
    {
      title: t('users.actions'),
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>
            {t('users.actions.view')}
          </Button>
          {record.status === 'active' ? (
            <Button
              type="link"
              size="small"
              danger
              icon={<LockOutlined />}
              onClick={() => handleBanUser(record.id)}
            >
              {t('users.actions.ban')}
            </Button>
          ) : record.status === 'banned' ? (
            <Button
              type="link"
              size="small"
              style={{ color: 'green' }}
              icon={<UnlockOutlined />}
              onClick={() => handleUnbanUser(record.id)}
            >
              {t('users.actions.unban')}
            </Button>
          ) : null}
        </Space>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Filters */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={16} lg={12}>
            <Input
              placeholder={t('users.searchPlaceholder')}
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Select
              placeholder={t('users.filter')}
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Select.Option value="all">{t('users.all')}</Select.Option>
              <Select.Option value="active">{t('users.active')}</Select.Option>
              <Select.Option value="banned">{t('users.banned')}</Select.Option>
              <Select.Option value="pending">{t('users.pending')}</Select.Option>
            </Select>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t('users.showTotal', { total }),
          }}
          scroll={{ x: 900 }}
        />
      </Space>
    </DashboardLayout>
  )
}