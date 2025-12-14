import React from 'react'
import Link from 'next/link'
import { Layout, Menu, Breadcrumb, Button } from 'antd'
import { useRouter } from 'next/router'
import {
  DashboardOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  SettingOutlined,
  ScheduleOutlined,
  FileTextOutlined,
  InboxOutlined,
  ToolOutlined,
  NotificationOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  FileSearchOutlined,
} from '@ant-design/icons'

const { Header, Content, Sider } = Layout

type Props = {
  children: React.ReactNode
  title?: string
}

export default function AdminLayout({ children, title = 'Admin' }: Props) {
  const router = useRouter()
  const selected = [router.pathname]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: 48, margin: 16, color: 'white', fontWeight: 700 }}>
          Admin
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={selected}>
          <Menu.Item key="/admin/users" icon={<UserOutlined />}>
            <Link href="/admin/users">Users</Link>
          </Menu.Item>
          <Menu.Item key="/admin/appointments" icon={<ScheduleOutlined />}>
            <Link href="/admin/appointments">Appointments</Link>
          </Menu.Item>
          <Menu.Item key="/admin/specialties" icon={<FileSearchOutlined />}>
            <Link href="/admin/specialties">Specialties</Link>
          </Menu.Item>
          <Menu.Item key="/admin/logs" icon={<FileTextOutlined />}>
            <Link href="/admin/logs">Logs</Link>
          </Menu.Item>
          <Menu.Item key="/admin/messages" icon={<NotificationOutlined />}>
            <Link href="/admin/messages">Messages</Link>
          </Menu.Item>
          <Menu.Item key="/admin/settings" icon={<SettingOutlined />}>
            <Link href="/admin/settings">Settings</Link>
          </Menu.Item>
          <Menu.Item key="/admin/backup" icon={<CloudUploadOutlined />}>
            <Link href="/admin/backup">Backup</Link>
          </Menu.Item>
          <Menu.Item key="/admin/maintenance" icon={<ToolOutlined />}>
            <Link href="/admin/maintenance">Maintenance</Link>
          </Menu.Item>
                    <Menu.Item key="/" icon={<ArrowLeftOutlined />}>
            <Link href="/">Back</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0, paddingLeft: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>{title}</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ marginRight: 16 }}>
            <Link href="/">
              <Button type="default">Back to site</Button>
            </Link>
          </div>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  )
}
