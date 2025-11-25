// pages/login.tsx
import React, { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useRouter } from 'next/router'
import { useTranslation } from '@/lib/i18n'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const onFinish = async (values: any) => {
    setLoading(true)
    
    try {
      // TODO: Replace with real API call
      // const response = await authAPI.login(values.email, values.password)
      
      // Mock login
      if (values.email === 'admin@hospital.com' && values.password === 'admin123') {
        localStorage.setItem('adminToken', 'mock-token-12345')
        message.success(t('login.success'))
        router.push('/')
      } else {
        message.error(t('login.invalid'))
      }
    } catch (error) {
      message.error('A login error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        title={
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0 }}>{t('login.title')}</h2>
            <p style={{ margin: '8px 0 0', color: '#888', fontSize: 14 }}>
              {t('login.subtitle')}
            </p>
          </div>
        }
        style={{ 
          width: 400, 
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)' 
        }}
      >
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('login.validation.emailRequired') },
              { type: 'email', message: t('login.validation.emailInvalid') },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('login.emailPlaceholder')}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: t('login.validation.passwordRequired') },
              { min: 6, message: t('login.validation.passwordMin') },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('login.passwordPlaceholder')}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
            >
              {t('login.signIn')}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <p style={{ color: '#888', fontSize: 12 }}>
              {t('login.demo')}
            </p>
          </div>
        </Form>
      </Card>
    </div>
  )
}