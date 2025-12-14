// components/Layout.tsx
import React, { ReactNode, useEffect, useState, useMemo } from 'react'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Space, Select } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  LogoutOutlined,
  SettingOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/router'
import { useTranslation } from '@/lib/i18n'
import type { MenuProps } from 'antd'
import { hasPermission, hasRole } from '@/lib/auth'

const { Header, Sider, Content } = AntLayout

interface LayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: LayoutProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  // Check authentication
  const { locale, setLocale, t } = useTranslation()

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const [allowedAdmin, setAllowedAdmin] = useState(false)

  useEffect(() => {
    try {
      // consider admin allowed if token has admins:view or has the ADMIN role
      setAllowedAdmin(hasPermission('admins:view') || hasRole('ADMIN'))
    } catch (e) {
      setAllowedAdmin(false)
    }
  }, [])

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: t('layout.controlPanel'),
    },
    {
      key: '/doctors',
      icon: <UserOutlined />,
      label: t('layout.doctors'),
      children: [
        { key: '/doctors', label: t('layout.doctors') },
        { key: '/doctors/bulk-add', icon: <PlusOutlined />, label: 'Bulk add doctors' },
        { key: '/doctors/import-csv', icon: <UploadOutlined />, label: 'Import doctors (CSV)' },
      ],
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: t('layout.users'),
    },
    {
      key: '/specialties',
      icon: <MedicineBoxOutlined />,
      label: t('layout.specialties'),
    },
    // only include admin group when allowed
    ...(allowedAdmin ? [{
      key: '/admin',
      icon: <SettingOutlined />,
      label: 'Admin',
      children: [
        { key: '/admin/users', label: 'Users' },
        { key: '/admin/appointments', label: 'Appointments' },
        { key: '/admin/specialties', label: 'Specialties' },
        { key: '/admin/logs', label: 'Logs' },
        { key: '/admin/messages', label: 'Messages' },
        { key: '/admin/settings', label: 'Settings' },
        { key: '/admin/backup', label: 'Backup' },
        { key: '/admin/maintenance', label: 'Maintenance' },
      ],
    }] : [])
  ]

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('layout.settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('layout.logout'),
      danger: true,
      onClick: handleLogout,
    },
  ]

  const pageTitles: Record<string, string> = {
    '/': t('layout.controlPanel'),
    '/doctors': `${t('layout.doctors')} ${t('layout.management')}`,
    '/users': `${t('layout.users')} ${t('layout.management')}`,
    '/specialties': `${t('layout.specialties')} ${t('layout.management')}`,
  }

  // determine which submenu should be open based on current route
  const initialOpenKey = useMemo(() => {
    if (router.pathname.startsWith('/admin')) return ['/admin']
    if (router.pathname.startsWith('/doctors')) return ['/doctors']
    return []
  }, [router.pathname])

  const [openKeys, setOpenKeys] = useState<string[]>(initialOpenKey)

  useEffect(() => {
    setOpenKeys(initialOpenKey)
  }, [initialOpenKey])

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? 16 : 20,
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {collapsed ? 'A.D' : 'Admin Dashboard'}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[router.pathname]}
          openKeys={openKeys}
          onOpenChange={(keys) => setOpenKeys(keys as string[])}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ marginTop: 8 }}
        />
      </Sider>

      <AntLayout style={{ marginLeft: collapsed ? 80 : 250 }}>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>
              {pageTitles[router.pathname] || t('layout.controlPanel')}
            </h2>

            <Select
              value={locale}
              onChange={(val) => {
                const l = val as 'en' | 'ar' | 'fr'
                setLocale(l)
                try {
                  if (typeof window !== 'undefined') localStorage.setItem('locale', l)
                } catch {}
              }}
              style={{ width: 140 }}
              options={[
                { label: t('specialties.english'), value: 'en' },
                { label: t('specialties.french'), value: 'fr' },
                { label: t('specialties.arabic'), value: 'ar' },
              ]}
            />

            <Dropdown menu={{ items: userMenuItems }} placement="bottomLeft">
              <Space style={{ cursor: 'pointer' }}>
                <span>{t('layout.admin')}</span>
                <Avatar
                  style={{ backgroundColor: '#1890ff' }}
                  icon={<UserOutlined />}
                />
              </Space>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}