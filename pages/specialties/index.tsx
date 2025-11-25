// pages/specialties/index.tsx
import React, { useState } from 'react'
import { Table, Button, Space, Tag, Modal, Input, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import DashboardLayout from '@/components/Layout'
import { useTranslation } from '@/lib/i18n'
import type { ColumnsType } from 'antd/es/table'

interface Specialty {
  id: number
  value: string
  labelEn: string
  labelFr: string
  labelAr: string
  category: string
  icon: string
}

const mockSpecialties: Specialty[] = [
  { id: 1, value: 'cardiology', labelEn: 'Cardiology', labelFr: 'Cardiology', labelAr: 'Cardiology', category: 'medical', icon: '❤️' },
  { id: 2, value: 'neurology', labelEn: 'Neurology', labelFr: 'Neurology', labelAr: 'Neurology', category: 'medical', icon: '🧠' },
  { id: 3, value: 'pediatrics', labelEn: 'Pediatrics', labelFr: 'PPediatrics', labelAr: 'Pediatrics', category: 'medical', icon: '👶' },
  { id: 4, value: 'orthopedics', labelEn: 'Orthopedics', labelFr: 'Orthopedics', labelAr: 'Orthopedics', category: 'surgical', icon: '🦴' },
  { id: 5, value: 'dermatology', labelEn: 'Dermatology', labelFr: 'Dermatology', labelAr: 'Dermatology', category: 'medical', icon: '🩺' },
]

export default function SpecialtiesPage() {
  const { t } = useTranslation()
  const [specialties, setSpecialties] = useState(mockSpecialties)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null)
  const [formData, setFormData] = useState({
    value: '',
    labelEn: '',
    labelFr: '',
    labelAr: '',
    category: '',
    icon: '',
  })

  const handleAdd = () => {
    setEditingSpecialty(null)
    setFormData({ value: '', labelEn: '', labelFr: '', labelAr: '', category: '', icon: '' })
    setIsModalVisible(true)
  }

  const handleEdit = (record: Specialty) => {
    setEditingSpecialty(record)
    setFormData({
      value: record.value,
      labelEn: record.labelEn,
      labelFr: record.labelFr,
      labelAr: record.labelAr,
      category: record.category,
      icon: record.icon,
    })
    setIsModalVisible(true)
  }

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: t('specialties.deleteConfirmTitle'),
      content: t('specialties.deleteConfirmContent'),
      okText: t('specialties.actions.delete'),
      cancelText: t('specialties.cancel'),
      okType: 'danger',
      onOk: () => {
        setSpecialties(specialties.filter(s => s.id !== id))
        message.success(t('specialties.deleted'))
      },
    })
  }

  const handleSave = () => {
    if (!formData.value || !formData.labelEn || !formData.labelFr || !formData.labelAr) {
      message.error(t('specialties.fillFields'))
      return
    }

    if (editingSpecialty) {
      // Update existing
      setSpecialties(
        specialties.map(s =>
          s.id === editingSpecialty.id ? { ...s, ...formData } : s
        )
      )
      message.success(t('specialties.updated'))
    } else {
      // Add new
      const newSpecialty: Specialty = {
        id: Math.max(...specialties.map(s => s.id)) + 1,
        ...formData,
      }
      setSpecialties([...specialties, newSpecialty])
      message.success(t('specialties.added'))
    }

    setIsModalVisible(false)
  }

  const columns: ColumnsType<Specialty> = [
    {
      title: t('specialties.icon'),
      dataIndex: 'icon',
      key: 'icon',
      width: 80,
      render: (icon) => <span style={{ fontSize: 24 }}>{icon}</span>,
    },
    {
      title: t('specialties.value'),
      dataIndex: 'value',
      key: 'value',
      render: (value) => <code style={{ color: '#1890ff' }}>{value}</code>,
    },
    {
      title: t('specialties.english'),
      dataIndex: 'labelEn',
      key: 'labelEn',
    },
    {
      title: t('specialties.french'),
      dataIndex: 'labelFr',
      key: 'labelFr',
    },
    {
      title: t('specialties.arabic'),
      dataIndex: 'labelAr',
      key: 'labelAr',
      render: (text) => <span dir="rtl">{text}</span>,
    },
    {
      title: t('specialties.category'),
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: t('specialties.categories.medical'), value: 'medical' },
        { text: t('specialties.categories.surgical'), value: 'surgical' },
      ],
      onFilter: (value, record) => record.category === value,
      render: (category) => (
        <Tag color={category === 'medical' ? 'blue' : 'green'}>
          {category === 'medical' ? t('specialties.categories.medical') : t('specialties.categories.surgical')}
        </Tag>
      ),
    },
    {
      title: t('specialties.actions'),
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('specialties.actions.edit')}
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            {t('specialties.actions.delete')}
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('specialties.add')}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={specialties}
          rowKey="id"
          pagination={false}
        />
      </Space>

      {/* Add/Edit Modal */}
      <Modal
        title={editingSpecialty ? t('specialties.editTitle') : t('specialties.addNew')}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        okText={t('specialties.save')}
        cancelText={t('specialties.cancel')}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>{t('specialties.labels.value')}</label>
            <Input
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder={t('specialties.placeholders.value')}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>{t('specialties.labels.nameEn')}</label>
            <Input
              value={formData.labelEn}
              onChange={(e) => setFormData({ ...formData, labelEn: e.target.value })}
              placeholder={t('specialties.placeholders.exampleEn')}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>{t('specialties.labels.nameFr')}</label>
            <Input
              value={formData.labelFr}
              onChange={(e) => setFormData({ ...formData, labelFr: e.target.value })}
              placeholder={t('specialties.placeholders.exampleFr')}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>{t('specialties.labels.nameAr')}</label>
            <Input
              value={formData.labelAr}
              onChange={(e) => setFormData({ ...formData, labelAr: e.target.value })}
              placeholder={t('specialties.placeholders.exampleAr')}
              dir="rtl"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>{t('specialties.labels.category')}</label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder={t('specialties.placeholders.category')}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>{t('specialties.labels.icon')}</label>
            <Input
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="❤️"
              maxLength={2}
            />
          </div>
        </Space>
      </Modal>
    </DashboardLayout>
  )
}