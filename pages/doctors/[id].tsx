 
import React from 'react'
import Layout from '@/components/Layout'
import { useRouter } from 'next/router'

export default function DoctorDetailPage() {
  const router = useRouter()
  const { id } = router.query

  return (
    <Layout>
      <div>
        <h2>Doctor {id}</h2>
        <p>This page is a placeholder for doctor details.</p>
      </div>
    </Layout>
  )
}
