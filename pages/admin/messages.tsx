import React, { useEffect, useState, useRef } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Form, Input, Button, Select, message, Space, Table, Pagination } from 'antd'
import { messagesAPI, usersAPI } from '@/lib/api'

const TEMPLATES = [
  { key: 'welcome', name: 'Welcome message', body: 'Hello {{name}}, welcome to our clinic.' },
  { key: 'reminder', name: 'Appointment reminder', body: 'Reminder: you have an appointment on {{date}}.' }
]

export default function AdminMessages() {
  const [form] = Form.useForm()
  const [users, setUsers] = useState<any[]>([])
  const [loadingRecipients, setLoadingRecipients] = useState(false)
  const [messagesList, setMessagesList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [q, setQ] = useState<string | undefined>(undefined)

  const searchRef = useRef<number | null>(null)

  useEffect(() => {
    // do not preload all users by default; wait for admin to search
    setUsers([])
  }, [])

  async function loadRecipients(q?: string) {
    setLoadingRecipients(true)
    try {
      const params: any = { size: 50 }
      if (q && q.length > 0) params.q = q
      const res = await usersAPI.getAll(params)
      const d = res?.data
      let list: any[] = []
      if (Array.isArray(d)) list = d
      else if (d && Array.isArray(d.items)) list = d.items
      setUsers(list)
    } catch (err) {
      // ignore
    } finally { setLoadingRecipients(false) }
  }

  async function onFinish(values:any) {
    try {
      const payload = {
        recipients: values.recipients || [],
        template: values.template || null,
        subject: values.subject || null,
        body: values.body || null,
        channel: values.channel || 'email'
      }
      const res = await messagesAPI.send(payload)
      const data = res?.data || {}
      message.success(data.message || (data.sent ? 'Message sent' : 'Request completed'))
      form.resetFields()
      // reload messages after sending
      loadMessages();
    } catch (err) { message.error('Failed to send') }
  }

  async function loadMessages(p = page, s = size, search?: string) {
    setLoadingMessages(true)
    try {
      const res = await messagesAPI.list({ q: search, page: p, size: s })
      const d = res?.data || {}
      const items = Array.isArray(d) ? d : (Array.isArray(d.items) ? d.items : [])
      setMessagesList(items)
      setTotal(d.total || 0)
      setPage(d.page || p)
      setSize(d.size || s)
    } catch (err) {
      // ignore
    } finally { setLoadingMessages(false) }
  }

  return (
    <AdminLayout title="Messages">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="recipients" label="Recipients">
          <Select
            mode="multiple"
            loading={loadingRecipients}
            options={users.map(u => ({ label: u.name ? `${u.name} <${u.email || u.id}>` : (u.email || u.id), value: (u.email || u.id) }))}
            showSearch
            filterOption={false}
            onSearch={(val) => {
              if (searchRef.current) window.clearTimeout(searchRef.current)
              // debounce server calls
              searchRef.current = window.setTimeout(() => {
                loadRecipients(val)
              }, 300)
            }}
            onFocus={() => {
              // load some recent users when focused if empty
              if (!users || users.length === 0) loadRecipients()
            }}
          />
        </Form.Item>

        <Form.Item name="template" label="Template">
          <Select options={TEMPLATES.map(t => ({ label: t.name, value: t.key }))} onChange={(val) => {
            const t = TEMPLATES.find(tt => tt.key === val)
            if (t) form.setFieldsValue({ body: t.body })
          }} />
        </Form.Item>

        <Form.Item name="subject" label="Subject">
          <Input />
        </Form.Item>

        <Form.Item name="body" label="Body">
          <Input.TextArea rows={6} />
        </Form.Item>

        <Form.Item name="channel" label="Channel" initialValue="email">
          <Select options={[{label:'Email', value:'email'}, {label:'SMS', value:'sms'}]} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">Send</Button>
            <Button onClick={() => { const v = form.getFieldsValue(); message.info(JSON.stringify(v)) }}>Preview</Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ marginTop: 24 }}>
        <h3>Sent Messages</h3>
        <Space style={{ marginBottom: 12 }}>
          <Input.Search placeholder="Search subject/body/template" onSearch={(val) => { setQ(val); loadMessages(0, size, val) }} allowClear />
        </Space>
        <Table
          dataSource={messagesList.map((r:any)=>({ key: r.id, ...r }))}
          loading={loadingMessages}
          pagination={false}
          columns={[
            { title: 'Time', dataIndex: 'timestamp', key: 'timestamp' },
            { title: 'Subject', dataIndex: 'subject', key: 'subject' },
            { title: 'Recipients', dataIndex: 'recipients', key: 'recipients', render: (r:any)=> Array.isArray(r)?r.join(', '):String(r) },
            { title: 'Channel', dataIndex: 'channel', key: 'channel' },
            { title: 'Body', dataIndex: 'body', key: 'body', render: (b:any)=> <div style={{maxWidth:400, whiteSpace:'pre-wrap'}}>{String(b)}</div> }
          ]}
        />
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <Pagination current={page+1} pageSize={size} total={total} onChange={(p, ps)=>{ loadMessages(p-1, ps, q) }} showSizeChanger />
        </div>
      </div>
    </AdminLayout>
  )
}
