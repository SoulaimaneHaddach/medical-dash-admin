import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Table, Input, Button, Space, Modal, Form, Select, Popconfirm, Tag, message } from 'antd'
import { usersAPI } from '@/lib/api'
import { extractRolesFromUser } from '@/lib/auth'

// role display normalization: use `extractRolesFromUser` to show 'admin,doctor' etc.

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(0) // 0-based
  const [total, setTotal] = useState(0)
  const [editing, setEditing] = useState<any | null>(null)
  const [visible, setVisible] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([])

  const [form] = Form.useForm()

  const load = async (page = currentPage, size = pageSize) => {
    setLoading(true)
    try {
      // include sorting params if any
      const resp = await usersAPI.getAll({ q: query, page, size, sortBy: sortByRef.current, sortDir: sortDirRef.current })
      const respData = resp?.data
      // Debug: log server response so we can see the exact shape
      // eslint-disable-next-line no-console
      console.debug('usersAPI.getAll response:', respData)

      // Accept either a paginated wrapper { items, total, page, size }
      // or a direct array of users (legacy behavior)
      if (Array.isArray(respData)) {
        setUsers(respData)
        setTotal(respData.length)
        setCurrentPage(0)
        setPageSize(respData.length)
      } else {
        const data = respData || {}
        setUsers(data.items || [])
        setTotal(Number(data.total || 0))
        setCurrentPage(Number(data.page || page))
        setPageSize(Number(data.size || size))
      }
    } catch (err) {
      console.error('Failed loading users', err)
      setUsers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(0, pageSize) }, [])

  const onSearch = () => { setCurrentPage(0); load(0, pageSize) }

  // sorting refs
  const sortByRef = React.useRef<string | null>(null)
  const sortDirRef = React.useRef<string>('asc')

  // debounce search
  const searchTimer = React.useRef<any>(null)
  const onQueryChange = (v: string) => {
    setQuery(v)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setCurrentPage(0)
      load(0, pageSize)
    }, 400)
  }

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setVisible(true)
  }

  const openEdit = (row: any) => {
    setEditing(row)
    form.setFieldsValue({ name: row.name, email: row.email, role: row.role })
    setVisible(true)
  }

  const onDelete = async (id: string) => {
    // Optimistic UI: remove the user immediately and rollback on failure
    const prev = users
    setUsers(prev.filter(u => u.id !== id))
    setSelectedKeys(keys => keys.filter(k => k !== id))
    try {
      await usersAPI.delete(id)
      message.success('User deleted')
      // refresh to keep pagination/total consistent
      await load()
    } catch (err) {
      console.error('Delete failed', err)
      message.error('Failed to delete user')
      // rollback
      setUsers(prev)
    }
  }

  const onBulkDelete = async () => {
    if (!selectedKeys || selectedKeys.length === 0) return message.info('No users selected')
    Modal.confirm({
      title: `Delete ${selectedKeys.length} users?`,
      content: 'This action cannot be undone. Are you sure?',
      onOk: async () => {
        const ids = selectedKeys as string[]
        try {
          const resp = await usersAPI.bulkDelete(ids)
          const deleted = resp?.data?.deleted ?? ids.length
          message.success(`Deleted ${deleted} / ${ids.length} users.`)
        } catch (err) {
          // fallback to per-id deletes if bulk fails
          const results = await Promise.allSettled(ids.map(id => usersAPI.delete(id)))
          const succeeded = results.filter(r => r.status === 'fulfilled').length
          const failed = results.length - succeeded
          message.success(`Deleted ${succeeded} / ${results.length} users. ${failed} failed.`)
        }
        setSelectedKeys([])
        await load()
      }
    })
  }

  const onBanToggle = async (row: any) => {
    try {
      if (row.banned) await usersAPI.unban(row.id)
      else await usersAPI.ban(row.id)
      await load()
    } catch (e) {}
  }

  const onFinish = async (vals: any) => {
    try {
      if (editing) {
        await usersAPI.update(editing.id, vals)
      } else {
        await usersAPI.create(vals)
      }
      setVisible(false)
      await load()
    } catch (err) {
      // error shown by api wrapper
    }
  }

  return (
    <AdminLayout title="Users">
      <Space style={{ marginBottom: 12 }}>
        <Input.Search placeholder="Search by name or email" enterButton onSearch={onSearch} onChange={e => onQueryChange(e.target.value)} />
        <Button type="primary" onClick={openCreate}>Add user</Button>
        <Button danger onClick={onBulkDelete} disabled={selectedKeys.length === 0}>Delete selected</Button>
      </Space>

      <Table
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: (keys) => setSelectedKeys(keys),
        }}
        dataSource={users.map(u => ({ key: u.id, ...u }))}
        loading={loading}
        pagination={{
          current: currentPage + 1,
          pageSize: pageSize,
          total: total,
          onChange: (page, size) => {
            const p = Math.max(0, page - 1)
            setCurrentPage(p)
            setPageSize(size)
            load(p, size)
          }
        }}
        onChange={(pagination, filters, sorter: any) => {
          // handle server-side sorting
          if (sorter && sorter.field) {
            sortByRef.current = sorter.field
            sortDirRef.current = sorter.order === 'descend' ? 'desc' : 'asc'
          } else {
            sortByRef.current = null
            sortDirRef.current = 'asc'
          }
          // reload first page
          setCurrentPage(0)
          load(0, pageSize)
        }}
      >
        <Table.Column title="Name" dataIndex="name" key="name" />
        <Table.Column title="Email" dataIndex="email" key="email" />
        <Table.Column
          title="Role"
          dataIndex="role"
          key="role"
          render={(_: any, record: any) => {
            const roles = extractRolesFromUser(record)
            const text = roles.length ? roles.join(',') : 'user'
            return <Tag>{text}</Tag>
          }}
        />
        <Table.Column title="Status" key="banned" render={(_: any, record: any) => record.banned ? <Tag color="red">Banned</Tag> : <Tag color="green">Active</Tag>} />
        <Table.Column title="Actions" key="actions" render={(_: any, record: any) => (
          <Space>
            <Button size="small" onClick={() => openEdit(record)}>Edit</Button>
            <Popconfirm title="Delete user?" onConfirm={() => onDelete(record.id)}>
              <Button size="small" danger>Delete</Button>
            </Popconfirm>
            <Button size="small" onClick={() => onBanToggle(record)}>{record.banned ? 'Unban' : 'Ban'}</Button>
          </Space>
        )} />
      </Table>

      <Modal title={editing ? 'Edit user' : 'Add user'} open={visible} onCancel={() => setVisible(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select options={[{ label: 'ADMIN', value: 'ADMIN' }, { label: 'DOCTOR', value: 'DOCTOR' }, { label: 'PATIENT', value: 'PATIENT' }]} />
          </Form.Item>
          <Form.Item name="password" label="Password" help="Only set when creating or changing password">
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  )
}
