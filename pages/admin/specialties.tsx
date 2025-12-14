import React, { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Button, Table, Modal, Form, Input, Space, Popconfirm } from 'antd'
import { useSpecialties } from '@/hooks/useSpecialties'

export default function AdminSpecialties() {
  const { specialties = [], isLoading, create, update, remove } = useSpecialties()
  const [modalVisible, setModalVisible] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form] = Form.useForm()

  function openAdd() {
    setEditing(null)
    form.resetFields()
    setModalVisible(true)
  }

  function openEdit(record: any) {
    setEditing(record)
    form.setFieldsValue({ name: record.name, description: record.description })
    setModalVisible(true)
  }

  async function onOk() {
    const values = await form.validateFields()
    if (editing) {
      update({ id: editing.id, data: values })
    } else {
      create(values)
    }
    setModalVisible(false)
  }

  const cols = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Actions', key: 'actions', render: (_: any, record: any) => {
        return (
          <Space>
            <Button onClick={() => openEdit(record)}>Edit</Button>
            <Popconfirm title="Delete specialty?" onConfirm={() => remove(record.id)}>
              <Button danger>Delete</Button>
            </Popconfirm>
          </Space>
        )
      }
    }
  ]

  return (
    <AdminLayout title="Specialties">
      <div style={{ marginBottom: 12 }}>
        <Button type="primary" onClick={openAdd}>Add Specialty</Button>
      </div>
      <Table dataSource={specialties} loading={isLoading} columns={cols} rowKey="id" />

      <Modal open={modalVisible} onOk={onOk} onCancel={() => setModalVisible(false)} title={editing ? 'Edit Specialty' : 'Add Specialty'}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  )
}
