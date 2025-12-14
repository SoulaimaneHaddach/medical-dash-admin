import React from 'react'
import Link from 'next/link'
import { Button, Result } from 'antd'

export default function NotAuthorized() {
  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={(
        <Button type="primary">
          <Link href="/">Back to dashboard</Link>
        </Button>
      )}
    />
  )
}
