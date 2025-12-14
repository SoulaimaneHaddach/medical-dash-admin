import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Form, Input, Switch, Button, message, Spin } from 'antd'
import { settingsAPI } from '@/lib/api'

export default function AdminSettings() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await settingsAPI.get()
        if (!mounted) return
        form.setFieldsValue(res.data)
      } catch (err) {
        // noop
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [form])

  async function onFinish(values: any) {
    setSaving(true)
    try {
      await settingsAPI.update(values)
      if (typeof values.maintenanceMode !== 'undefined') {
        await settingsAPI.setMaintenance({ maintenanceMode: !!values.maintenanceMode })
      }
      message.success('Settings updated')
    } catch (err) {
      message.error('Failed')
    } finally { setSaving(false) }
  }

  return (
    <AdminLayout title="Settings">
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="maintenanceMode" label="Maintenance Mode" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="emailFrom" label="Email From">
            <Input />
          </Form.Item>
          <Form.Item name="theme" label="Theme">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>Save</Button>
          </Form.Item>
        </Form>
      </Spin>
    </AdminLayout>
  )
}
