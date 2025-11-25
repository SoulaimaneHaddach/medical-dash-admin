// components/Layout.tsx
import React, { ReactNode, useEffect, useState } from 'react'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Space, Select } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/router'
import { useTranslation } from '@/lib/i18n'
import type { MenuProps } from 'antd'

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
    },
    {
      key: '/bookings',
      icon: <CalendarOutlined />,
      label: t('layout.bookings'),
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
    '/bookings': `${t('layout.bookings')} ${t('layout.management')}`,
    '/users': `${t('layout.users')} ${t('layout.management')}`,
    '/specialties': `${t('layout.specialties')} ${t('layout.management')}`,
  }

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
          right: 0,
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
          {collapsed ? 'A.D' : t('layout.adminDashboard')}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[router.pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ marginTop: 8 }}
        />
      </Sider>

      <AntLayout style={{ marginRight: collapsed ? 80 : 250 }}>
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
                } catch (e) {}
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