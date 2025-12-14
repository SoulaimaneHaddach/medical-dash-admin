// pages/users/index.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { Table, Button, Input, Space, Tag, Avatar, Row, Col, Select } from 'antd'
import { SearchOutlined, UserOutlined, LockOutlined, UnlockOutlined, EyeOutlined } from '@ant-design/icons'
import DashboardLayout from '@/components/Layout'
import { useTranslation } from '@/lib/i18n'
import type { ColumnsType } from 'antd/es/table'
import { useUsers } from '@/hooks/useUsers'
import { extractRolesFromUser } from '@/lib/auth'

interface User {
  id: number
  name: string
  email: string
  // phone removed per request
  // status replaced by role in the public listing
  role?: string
  bookings?: number
  joinedDate?: string
  createdAt?: string
}

export default function UsersPage() {
  const { t } = useTranslation()
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const { users = [], ban, unban } = useUsers()

  const handleBanUser = (id: number) => {
    ban(id)
  }

  const handleUnbanUser = (id: number) => {
    unban(id)
  }

  function resolveJoined(u: any) {
    const candidates = [u?.joinedDate, u?.createdAt, u?.joined_at, u?.created_at]
    for (const c of candidates) {
      if (c) return c
    }
    return undefined
  }

  function resolveRole(u: any) {
    try {
      const roles = extractRolesFromUser(u)
      if (!roles || roles.length === 0) return 'USER'
      return String(roles[0]).toUpperCase()
    } catch (e) {
      return 'USER'
    }
  }

  const filteredUsers = (users || []).filter((user: any) => {
    const matchesSearch =
      (user.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (String((extractRolesFromUser(user)[0]) || '')).toLowerCase().includes(searchText.toLowerCase())

    const matchesRole = roleFilter === 'all' || (extractRolesFromUser(user).includes(roleFilter))

    return matchesSearch && matchesRole
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
      title: t('users.role') || 'Role',
      key: 'role',
      render: (_, record) => {
        const r = resolveRole(record) || 'USER'
        const colors: Record<string, string> = { ADMIN: 'red', DOCTOR: 'blue', PATIENT: 'green' }
        return <Tag color={colors[r] || 'default'}>{r}</Tag>
      }
    },
    {
      title: t('users.joinedDate'),
      dataIndex: 'joinedDate',
      key: 'joinedDate',
      sorter: (a, b) => new Date(resolveJoined(a) || 0).getTime() - new Date(resolveJoined(b) || 0).getTime(),
      render: (_: any, record: any) => {
        const d = resolveJoined(record)
        try {
          if (!d) return '-'
          const dt = new Date(d)
          if (isNaN(dt.getTime())) return d
          return dt.toLocaleDateString()
        } catch { return d }
      }
    },
    {
      title: t('users.actionsLabel') || 'Actions',
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
              value={roleFilter}
              onChange={setRoleFilter}
            >
              <Select.Option value="all">{t('users.all')}</Select.Option>
              <Select.Option value="ADMIN">ADMIN</Select.Option>
              <Select.Option value="DOCTOR">DOCTOR</Select.Option>
              <Select.Option value="PATIENT">PATIENT</Select.Option>
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