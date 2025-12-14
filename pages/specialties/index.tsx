// pages/specialties/index.tsx
import React, { useState } from 'react'
import { Table, Button, Space, Tag, Modal, Input, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import DashboardLayout from '@/components/Layout'
import { useTranslation } from '@/lib/i18n'
import { useSpecialties } from '@/hooks/useSpecialties'
import { specialtiesAPI } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'

interface Specialty {
  id: string
  name: string
  description?: string
  category?: string
  icon?: string
  createdAt?: string
}

export default function SpecialtiesPage() {
  const { t } = useTranslation()
  const { specialties = [], create, update, remove } = useSpecialties()
  const queryClient = useQueryClient()
  const [multiModalVisible, setMultiModalVisible] = useState(false)
  const [multiText, setMultiText] = useState('')
  const [multiProcessing, setMultiProcessing] = useState(false)
  const [multiResults, setMultiResults] = useState<Array<{ name: string; ok: boolean; message?: string }>>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    icon: '',
  })

  const handleAdd = () => {
    setEditingSpecialty(null)
    setFormData({ name: '', description: '', category: '', icon: '' })
    setIsModalVisible(true)
  }

  const handleEdit = (record: Specialty) => {
    setEditingSpecialty(record)
    setFormData({
      name: record.name,
      description: record.description || '',
      category: record.category || '',
      icon: record.icon || '',
    })
    setIsModalVisible(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: t('specialties.deleteConfirmTitle'),
      content: t('specialties.deleteConfirmContent'),
      okText: t('specialties.actions.delete'),
      cancelText: t('specialties.cancel'),
      okType: 'danger',
      onOk: () => {
        remove(id)
      },
    })
  }

  const handleSave = () => {
    if (!formData.name) {
      message.error(t('specialties.fillFields') || 'Please fill the name')
      return
    }

    if (editingSpecialty) {
      update({ id: editingSpecialty.id, data: { name: formData.name, description: formData.description, category: formData.category, icon: formData.icon } })
    } else {
      create({ name: formData.name, description: formData.description, category: formData.category, icon: formData.icon })
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
      title: t('specialties.value') || 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value) => <code style={{ color: '#1890ff' }}>{value}</code>,
    },
    {
      title: t('specialties.description') || 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span>{text}</span>,
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
      title: t('specialties.actionsLabel') || 'Actions',
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
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              {t('specialties.add')}
            </Button>
            <Button onClick={() => {
              // initialize textarea with default specialties
              const defaults = [
                'Cardiology','Dermatology','Neurology','Pediatrics','Orthopedics','Gynecology','Oncology','Radiology','Psychiatry','Anesthesiology','Urology','Endocrinology','Gastroenterology','Ophthalmology','ENT'
              ]
              setMultiText(defaults.join('\n'))
              setMultiModalVisible(true)
            }}>
              {t('specialties.addMultiple') || 'Add Multiple'}
            </Button>
          </Space>
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
            <label style={{ display: 'block', marginBottom: 8 }}>{t('specialties.labels.name') || 'Name'}</label>
            <Input
              value={(formData as any).name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('specialties.placeholders.name') || 'e.g. Cardiology'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>{t('specialties.labels.description') || 'Description'}</label>
            <Input
              value={(formData as any).description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('specialties.placeholders.description') || 'Optional description'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>{t('specialties.labels.category') || 'Category'}</label>
            <Input
              value={(formData as any).category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder={t('specialties.placeholders.category') || 'medical'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>{t('specialties.labels.icon') || 'Icon'}</label>
            <Input
              value={(formData as any).icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="❤️"
              maxLength={2}
            />
          </div>
        </Space>
      </Modal>

      {/* Multi-add Modal */}
      <Modal
        title={t('specialties.addMultipleTitle') || 'Add Multiple Specialties'}
        open={multiModalVisible}
        onOk={async () => {
          const allLines = (multiText || '')
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(Boolean)

          if (allLines.length === 0) {
            message.warning(t('specialties.multiEmpty') || 'No specialties provided')
            return
          }

          // detect duplicates against existing specialties (case-insensitive)
          const existingNames = (Array.isArray(specialties) ? specialties : []).map((sp: any) => {
            const name = sp && (sp.name ?? sp.value ?? sp.labelEn) ? (sp.name ?? sp.value ?? sp.labelEn) : ''
            return String(name).toLowerCase()
          })
          const duplicates = allLines.filter(n => existingNames.includes(n.toLowerCase()))
          const toCreate = allLines.filter(n => !existingNames.includes(n.toLowerCase()))

          if (duplicates.length > 0) {
            message.warning((t('specialties.duplicatesWarning') || 'The following specialties are already added:') + ' ' + duplicates.join(', '))
          }

          if (toCreate.length === 0) {
            // nothing new to create
            setMultiResults(duplicates.map(d => ({ name: d, ok: false, message: 'Already exists' })))
            return
          }

          setMultiProcessing(true)
          setMultiResults([])
          const results: Array<{ name: string; ok: boolean; message?: string }> = []

          const promises = toCreate.map(async (name) => {
            try {
              // backend expects { name, description }
              const res = await specialtiesAPI.create({ name, description: '' })
              results.push({ name, ok: true, message: (res?.data?.name || 'Created') })
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || 'Error'
              results.push({ name, ok: false, message: String(msg) })
            }
          })

          await Promise.all(promises)

          // include duplicate entries as results (marked as already exists)
          const dupResults = duplicates.map(d => ({ name: d, ok: false, message: 'Already exists' }))
          const finalResults = [...results, ...dupResults]
          setMultiResults(finalResults)
          setMultiProcessing(false)
          // refresh specialties list
          try { await queryClient.invalidateQueries({ queryKey: ['specialties'] }) } catch {}
          // show summary
          const okCount = results.filter(r => r.ok).length
          const errCount = finalResults.length - okCount
          if (okCount > 0) message.success(`${okCount} specialties added`)
          if (errCount > 0) message.error(`${errCount} failed`)
        }}
        onCancel={() => { setMultiModalVisible(false); setMultiText(''); setMultiResults([]) }}
        okText={t('specialties.saveAll') || 'Save All'}
        cancelText={t('specialties.cancel')}
        width={700}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>{t('specialties.multiLabel') || 'Enter one specialty name per line'}</label>
            <Input.TextArea rows={8} value={multiText} onChange={e => setMultiText(e.target.value)} placeholder={t('specialties.multiPlaceholder') || 'Cardiology\nDermatology\nNeurology'} />
          </div>

          {multiProcessing && <div>{t('specialties.processing') || 'Processing...'}</div>}

          {multiResults.length > 0 && (
            <div style={{ maxHeight: 200, overflow: 'auto', borderTop: '1px solid #eee', paddingTop: 8 }}>
              {multiResults.map(r => (
                <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <div>{r.name}</div>
                  <div style={{ color: r.ok ? 'green' : 'red' }}>{r.ok ? (r.message || 'Created') : (r.message || 'Error')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  )
}