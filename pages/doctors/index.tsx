import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Table, Button, Input, Space, Tag, Badge, Avatar } from 'antd';
import { useTranslation } from '@/lib/i18n'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';

export default function DoctorsPage() {
  const [searchText, setSearchText] = useState('');
  const { t } = useTranslation()

  // Use fake data temporarily
  const mockDoctors = [
    { 
      id: 1, 
      name: 'Dr. Sarah Johnson', 
      email: 'sarah@hospital.com', 
      specialty: 'Cardiology', 
      status: 'active', 
      bookings: 45 
    },
   // ...more data
  ];

  const columns = [
    {
      title: t('doctors.columns.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1890ff' }}>
            {text.charAt(0)}
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
  ];

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
          <Button type="primary" icon={<PlusOutlined />}>
           {t('doctors.add')}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={mockDoctors}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Space>
    </Layout>
  );
}