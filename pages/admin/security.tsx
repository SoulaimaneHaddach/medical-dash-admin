import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Form, Switch, Button, message, Card } from 'antd'
import { securityAPI } from '@/lib/api'

export default function AdminSecurity() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await securityAPI.get()
      const d = res?.data || {}
      form.setFieldsValue({
        twoFactorEnabled: !!d.twoFactorEnabled,
        allowPasswordLogin: d.allowPasswordLogin !== false,
      })
    } catch (err) {
      // ignore
    } finally { setLoading(false) }
  }

  async function onFinish(values:any) {
    setLoading(true)
    try {
      await securityAPI.update(values)
      message.success('Security settings updated')
    } catch (err) { message.error('Failed to save') }
    finally { setLoading(false) }
  }

  return (
    <AdminLayout title="Security Settings">
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ twoFactorEnabled: false, allowPasswordLogin: true }}>
          <Form.Item name="twoFactorEnabled" label="Two-Factor Authentication" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="allowPasswordLogin" label="Allow Password Login" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
          </Form.Item>
        </Form>
      </Card>
    </AdminLayout>
  )
}
