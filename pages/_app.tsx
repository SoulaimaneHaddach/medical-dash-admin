/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/_app.tsx
import '@/styles/globals.css'
import 'antd/dist/reset.css'
import type { AppProps } from 'next/app'
import { ConfigProvider } from 'antd'
import arEG from 'antd/locale/ar_EG'
import enUS from 'antd/locale/en_US'
import frFR from 'antd/locale/fr_FR'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { I18nProvider, useTranslation } from '@/lib/i18n'

function InnerApp(props: any) {
  const { Component, pageProps } = props as AppProps
  const { locale } = useTranslation()

  const antdLocale = locale === 'ar' ? arEG : locale === 'fr' ? frFR : enUS
  const direction = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <ConfigProvider
      locale={antdLocale}
      direction={direction}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
          fontSize: 14,
        },
        components: {
          Layout: {
            bodyBg: '#f0f2f5',
          },
          Table: {
            headerBg: '#fafafa',
          },
        },
      }}
    >
      <Component {...pageProps} />
    </ConfigProvider>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <InnerApp Component={Component} pageProps={pageProps} />
      </I18nProvider>
    </QueryClientProvider>
  )
}