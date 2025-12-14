/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Table, Button, Input, Space, Tag, Badge, Avatar, Modal } from 'antd';
import { useTranslation } from '@/lib/i18n'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useDoctors } from '@/hooks/useDoctors';
import { useRouter } from 'next/router';

export default function DoctorsPage() {
  const [searchText, setSearchText] = useState('');
  const { t } = useTranslation()
  const router = useRouter()

  const { doctors, isLoading, approve, reject, approveLoading, rejectLoading, delete: deleteDoctor, deleteLoading } = useDoctors()
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const columns: any = [
    {
      title: t('doctors.columns.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1890ff' }}>
            {text?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: t('doctors.columns.specialty'),
      dataIndex: 'specialty',
      key: 'specialty',
    },
    {
      title: t('doctors.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status === 'active' ? t('doctors.status.active') : t('doctors.status.inactive')}
        </Tag>
      ),
    },
    {
      title: t('doctors.columns.bookings'),
      dataIndex: 'bookings',
      key: 'bookings',
      render: (bookings: number) => (
        <Badge 
          count={bookings} 
          style={{ backgroundColor: '#52c41a' }} 
        />
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'active' ? (
            <Button
              danger
              loading={actionLoadingId === record.id && rejectLoading}
              onClick={async () => {
                try {
                  setActionLoadingId(record.id)
                  await reject(String(record.id))
                } catch (e) {
                  if (typeof console !== 'undefined') console.error('Hide click error', e)
                } finally {
                  setActionLoadingId(null)
                }
              }}
            >
              {t('doctors.actions.hide') || 'Hide'}
            </Button>
          ) : (
            <Button
              type="default"
              loading={actionLoadingId === record.id && approveLoading}
              onClick={async () => {
                try {
                  setActionLoadingId(record.id)
                  await approve(String(record.id))
                } catch (e) {
                  if (typeof console !== 'undefined') console.error('Show click error', e)
                } finally {
                  setActionLoadingId(null)
                }
              }}
            >
              {t('doctors.actions.show') || 'Show'}
            </Button>
          )}

          {/* Delete button with confirmation */}
          <Button
            danger
            loading={actionLoadingId === record.id && deleteLoading}
            onClick={() => {
              Modal.confirm({
                title: t('doctors.confirmDelete') || 'Delete doctor?',
                content: t('doctors.confirmDeleteText') || 'This action cannot be undone.',
                okText: t('common.delete') || 'Delete',
                okType: 'danger',
                cancelText: t('common.cancel') || 'Cancel',
                onOk: async () => {
                  try {
                    setActionLoadingId(record.id)
                    await deleteDoctor(String(record.id))
                  } catch (e) {
                    if (typeof console !== 'undefined') console.error('Delete error', e)
                  } finally {
                    setActionLoadingId(null)
                  }
                }
              })
            }}
          >
            {t('common.delete') || 'Delete'}
          </Button>
        </Space>
      ),
    }
  ];

  const filtered = (doctors || []).filter((d: any) =>
    !searchText || (d.name || '').toLowerCase().includes(searchText.toLowerCase()) || (d.email || '').toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <Layout>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Input
            placeholder={t('doctors.searchPlaceholder')}
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/doctors/add')}>
             {t('doctors.add')}
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={isLoading}
        />
      </Space>
    </Layout>
  );
}