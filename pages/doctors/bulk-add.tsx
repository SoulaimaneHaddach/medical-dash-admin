import React from 'react'
import Layout from '@/components/Layout'
import { Form, Input, Button, Space, message, Card } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { doctorsAPI } from '@/lib/api'

export default function BulkAddDoctors() {
  const [form] = Form.useForm()

  const onFinish = async (values: any) => {
    const entries = values.doctors || []
    if (!entries.length) return message.warning('Add at least one doctor')

    const pw = (values.password || '').trim()
    if (!pw || pw.length < 6) return message.warning('Password (min 6 chars) required')

    const results = await Promise.allSettled(entries.map((d: any) => {
      const body = {
        name: d.name || '',
        email: d.email || '',
        specialty: d.specialty || '',
        phone: d.phone || '',
        bio: d.bio || '',
        password: pw
      }
      return doctorsAPI.create(body)
    }))

    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.length - succeeded
    message.success(`Created ${succeeded} / ${results.length} doctors. ${failed} failed.`)
    // Optionally clear form
    if (succeeded > 0) form.resetFields()
  }

  return (
    <Layout>
      <Card title="Bulk add doctors" style={{ maxWidth: 900 }}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item label="Password for all doctors" name="password" rules={[{ required: true, min: 6 }]}> 
            <Input.Password />
          </Form.Item>

          <Form.List name="doctors">
            {(fields, { add, remove }) => (
              <>
                {fields.map(field => (
                  <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item {...field} name={[field.name, 'name']} rules={[{ required: true }]}>
                      <Input placeholder="Name" />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'email']} rules={[{ required: true, type: 'email' }]}>
                      <Input placeholder="Email" />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'specialty']}>
                      <Input placeholder="Specialty" />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'phone']}>
                      <Input placeholder="Phone" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}

                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add doctor</Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit">Create doctors</Button>
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  )
}
