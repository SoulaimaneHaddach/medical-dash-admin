/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Layout from '@/components/Layout';
import { Form, Input, Button, Select, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { doctorsAPI } from '@/lib/api';
import { useRouter } from 'next/router';
import { useTranslation } from '@/lib/i18n'
import { useSpecialties } from '@/hooks/useSpecialties'

export default function AddDoctorPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: any) => doctorsAPI.create(data),
    onSuccess: () => {
      message.success(t('doctors.messages.created') || 'Doctor created')
      router.push('/doctors')
    },
    onError: (err: any) => {
      const text = err?.response?.data?.message || t('doctors.messages.error') || 'Failed to create doctor'
      message.error(text)
    }
  })

  const onFinish = (values: any) => {
    mutation.mutate(values)
  }

  const { specialties = [], isLoading } = useSpecialties()

  const fallbackSpecialties = [
    { name: 'Cardiology' },
    { name: 'Dermatology' },
    { name: 'Neurology' },
    { name: 'Pediatrics' },
    { name: 'Orthopedics' },
    { name: 'Gynecology' },
    { name: 'Oncology' },
    { name: 'Radiology' },
    { name: 'Psychiatry' },
    { name: 'Anesthesiology' },
    { name: 'Urology' },
    { name: 'Endocrinology' },
    { name: 'Gastroenterology' },
    { name: 'Ophthalmology' },
    { name: 'ENT' }
  ]

  const specialtyOptions = specialties.length > 0 ? specialties : fallbackSpecialties

  // prepare Select options outside of JSX to avoid parser edge-cases
  const selectOptions = isLoading
    ? [<Select.Option key="loading" value="">Loading...</Select.Option>]
    : specialtyOptions.map((s: any) => (
        <Select.Option key={s.name} value={s.name}>
          {s.name}
        </Select.Option>
      ))
  return (
    <Layout>
      <div style={{ maxWidth: 700 }}>
        <h2>{t('doctors.add') || 'Add doctor'}</h2>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label={t('doctors.form.name') || 'Name'} name="name" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>

          <Form.Item label={t('doctors.form.email') || 'Email'} name="email" rules={[{ required: true, type: 'email' }]}> 
            <Input />
          </Form.Item>

          <Form.Item
            label={t('doctors.form.specialty') || 'Specialty'}
            name="specialty"
            rules={[{ required: true }]}
          >
            <Select>
              {selectOptions}
            </Select>
          </Form.Item>

          <Form.Item label={t('password') || 'Password'} name="password" rules={[{ required: true }]}> 
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={mutation.status === 'pending'}>
              {t('doctors.form.submit') || 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Layout>
  )
}
