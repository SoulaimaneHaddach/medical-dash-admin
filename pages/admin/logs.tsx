import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Table, Button, Input, Select, Row, Col, Pagination } from 'antd'
import { logsAPI } from '@/lib/api'

const { Search } = Input

export default function AdminLogs() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(50)
  const [total, setTotal] = useState(0)
  const [level, setLevel] = useState<string | undefined>(undefined)
  const [query, setQuery] = useState<string | undefined>(undefined)

  useEffect(() => { fetchLogs() }, [page, size, level, query])

  async function fetchLogs() {
    setLoading(true)
    try {
      const res = await logsAPI.list({ page, size, level, q: query })
      const data = res.data || {}
      setItems(data.items || [])
      setTotal(data.total || 0)
    } finally { setLoading(false) }
  }

  const cols = [
    { title: 'Time', dataIndex: 'time', key: 'time', width: 220 },
    { title: 'Level', dataIndex: 'level', key: 'level', width: 100 },
    { title: 'File', dataIndex: 'file', key: 'file', width: 180 },
    { title: 'Message', dataIndex: 'message', key: 'message' },
  ]

  return (
    <AdminLayout title="Logs">
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col>
          <Button onClick={() => { setPage(1); fetchLogs() }}>Refresh</Button>
        </Col>
        <Col>
          <Select allowClear style={{ width: 140 }} placeholder="Level" value={level} onChange={(v) => { setLevel(v); setPage(1) }}>
            <Select.Option value="ERROR">ERROR</Select.Option>
            <Select.Option value="WARN">WARN</Select.Option>
            <Select.Option value="INFO">INFO</Select.Option>
            <Select.Option value="DEBUG">DEBUG</Select.Option>
            <Select.Option value="TRACE">TRACE</Select.Option>
          </Select>
        </Col>
        <Col flex="auto">
          <Search placeholder="Search logs" onSearch={(v) => { setQuery(v || undefined); setPage(1) }} enterButton />
        </Col>
      </Row>

      <Table dataSource={items} columns={cols} rowKey={(r:any)=>r.id} loading={loading} pagination={false} />

      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <Pagination current={page} pageSize={size} total={total} onChange={(p, s) => { setPage(p); setSize(s) }} showSizeChanger />
      </div>
    </AdminLayout>
  )
}
