import React, { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, Input, Button, message, Space, Checkbox, Modal, Table, Tag } from 'antd'
import { doctorsAPI } from '@/lib/api'

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (!lines.length) return { rows: [], headers: [] }
  const header = lines[0].split(',').map(h => h.trim())
  const headerLower = header.map(h => h.toLowerCase())
  const rows = lines.slice(1)
  const parsed = rows.map(r => {
    const cols = r.split(',').map(c => c.trim())
    const obj: any = {}
    for (let i = 0; i < headerLower.length; i++) {
      obj[headerLower[i]] = cols[i] || ''
    }
    return obj
  })
  return { rows: parsed, headers: headerLower }
}

export default function ImportCsvDoctors() {
  const [csv, setCsv] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [transactional, setTransactional] = useState(true)
  const [results, setResults] = useState<any[] | null>(null)
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [errorsMap, setErrorsMap] = useState<Record<number, string[]>>({})
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValues, setEditingValues] = useState<Record<string, any>>({})

  function validateRow(row: any) {
    const errs: string[] = []
    const name = (row.name || row.fullname || '').trim()
    const email = (row.email || '').trim()
    if (!name) errs.push('Missing name')
    if (!email) errs.push('Missing email')
    else {
      const re = /\S+@\S+\.\S+/
      if (!re.test(email)) errs.push('Invalid email')
    }
    return errs
  }

  function validateAll(rows: any[]) {
    const map: Record<number, string[]> = {}
    rows.forEach((r, i) => {
      const e = validateRow(r)
      if (e.length) map[i] = e
    })
    setErrorsMap(map)
    return map
  }

  const proceedImport = async (parsed: any[], password: string) => {
    setProcessing(true)
    try {
      const payload = { doctors: parsed.map((row: any) => ({
        name: row.name || row.fullname || '',
        email: row.email || '',
        specialty: row.specialty || row.specialization || '',
        phone: row.phone || '',
        bio: row.bio || row.about || '',
      })), passwordForAll: password, transactional: transactional }

      const resp = await doctorsAPI.batch(payload)
      const details = resp?.data?.details || []
      const succeeded = details.filter((d: any) => d.updated).length
      if (transactional) {
        message.success(`Imported ${succeeded} / ${details.length} doctors (transactional).`)
      } else {
        message.success(`Imported ${succeeded} / ${details.length} doctors (per-row).`)
      }
      if (succeeded > 0) setCsv('')
      setResults(details)
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Import failed'
      message.error(msg)
      // if server returned details for non-transactional case, capture them
      if (err?.response?.data?.details) setResults(err.response.data.details)
    } finally {
      setProcessing(false)
    }
  }

  const onImport = async () => {
    let parsed: any[] = []
    const txt = csv.trim()
    if (parsedRows && parsedRows.length) {
      parsed = parsedRows
    } else {
      if (txt) {
        const out = parseCsv(txt)
        parsed = out.rows
        setParsedRows(out.rows)
        setHeaders(out.headers)
      }
    }
    if (!txt && !parsed.length) return message.warning('Paste CSV with header: name,email,specialty,phone,bio or upload a file')
    if (!parsed.length) return message.warning('No rows parsed')

    // Validate before prompting
    const errs = validateAll(parsed)
    if (Object.keys(errs).length > 0) {
      return message.error('Please fix invalid rows before importing')
    }

    // Prompt for a single password to apply to all rows
    const password = prompt('Enter password (applied to all doctors, min 6 chars):', '') || ''
    if (!password || password.length < 6) return message.warning('Password (min 6 chars) required')

    // If transactional, confirm with the admin before proceeding
    if (transactional) {
      Modal.confirm({
        title: 'Confirm transactional import',
        content: 'This will import all doctors in a single transaction. If any row fails the entire import will be rolled back. Proceed?',
        onOk: async () => {
          await proceedImport(parsed, password)
        },
      })
    } else {
      // non-transactional: proceed directly
      await proceedImport(parsed, password)
    }
  }

  const onFileChange = async (f?: File) => {
    if (!f) return
    setFileName(f.name)

    // Try dynamic import of papaparse at runtime to avoid SSR/bundler issues
    try {
      const papaparseModule: any = await import('papaparse')
      const Papa: any = papaparseModule && papaparseModule.default ? papaparseModule.default : papaparseModule
      Papa.parse(f, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          // Re-serialize parsed CSV preserving header order
          const rows = results.data as any[]
          const fields = (results.meta && (results.meta as any).fields) || []
          const outLines: string[] = []
          if (!fields || fields.length === 0) {
            if (rows.length > 0) fields.push(...Object.keys(rows[0]))
          }
          // normalize keys to lower-case for preview and processing
          const fieldsLower = fields.map((f: string) => String(f).toLowerCase())
          if (fieldsLower.length) outLines.push(fieldsLower.join(','))
          const normalizedRows = rows.map((r: any) => {
            const nr: any = {}
            for (let i = 0; i < fields.length; i++) {
              const rawKey = fields[i]
              const key = String(rawKey).toLowerCase()
              nr[key] = r[rawKey] ?? ''
            }
            return nr
          })
          for (const r of normalizedRows) {
            const vals = fieldsLower.map((f: string) => {
              const v = r[f]
              if (v == null) return ''
              const s = String(v)
              if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
              return s
            })
            outLines.push(vals.join(','))
          }
          setCsv(outLines.join('\n'))
          setParsedRows(normalizedRows)
          setHeaders(fieldsLower)
        },
        error: (err: any) => {
          message.error('Failed to parse CSV: ' + (err?.message || String(err)))
        }
      })
      return
    } catch (e) {
      // dynamic import or parse failed — fall back to a simple text parse
      console.warn('papaparse dynamic import failed, falling back to simple parser', e)
    }

    try {
      const text = await f.text()
      const out = parseCsv(text)
      setCsv(out.rows.length ? out.rows.map((r: any) => {
        return Object.keys(r).map(k => {
          const v = r[k] ?? ''
          const s = String(v)
          if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
          return s
        }).join(',')
      }).join('\n') : '')
      setParsedRows(out.rows)
      setHeaders(out.headers)
    } catch (err: any) {
      message.error('Failed to read CSV file: ' + (err?.message || String(err)))
    }
  }

  function serializeToCsv(rows: any[], fields?: string[]) {
    if (!rows || rows.length === 0) return ''
    const cols = fields && fields.length ? fields : Object.keys(rows[0])
    const lines = [cols.join(',')]
    for (const r of rows) {
      const vals = cols.map((c: string) => {
        const v = r[c] ?? ''
        const s = String(v)
        if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
        return s
      })
      lines.push(vals.join(','))
    }
    return lines.join('\n')
  }

  function downloadCsv(rows: any[], file = 'failed_rows.csv') {
    const csvText = serializeToCsv(rows, headers.length ? headers : undefined)
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function getFailedRowsFromResults() {
    if (!results || !results.length) return []
    const fails = (results as any[]).filter(r => !r.updated)
    // Try to match failed rows back to parsedRows by email
    const out: any[] = []
    for (const f of fails) {
      const email = f.email
      const match = parsedRows.find(r => (r.email || '').toLowerCase() === (email || '').toLowerCase())
      if (match) out.push(match)
      else out.push({ email: email || '', message: f.message || '' })
    }
    return out
  }


  return (
    <Layout>
      <Card title="Import doctors from CSV" style={{ maxWidth: 900 }}>
        <p>CSV must include a header row. Example header: <code>name,email,specialty,phone,bio</code></p>
        <div style={{ marginBottom: 8 }}>
          <input type="file" accept=".csv" onChange={(e) => onFileChange(e.target.files ? e.target.files[0] : undefined)} />
          {fileName ? <div style={{ marginTop: 6, color: '#555' }}>Loaded: {fileName}</div> : null}
        </div>
        <div style={{ marginBottom: 8 }}>
          <Checkbox checked={transactional} onChange={(e) => setTransactional(e.target.checked)}>Transactional (all-or-nothing)</Checkbox>
        </div>
        <Input.TextArea rows={10} value={csv} onChange={e => setCsv(e.target.value)} placeholder={'name,email,specialty,phone,bio\nDr One,one@example.com,Cardiology,123456789,About'} />
        <Space style={{ marginTop: 12 }}>
          <Button type="primary" onClick={onImport} loading={processing}>Import CSV</Button>
          <Button onClick={() => setCsv('')}>Clear</Button>
        </Space>

        {parsedRows && parsedRows.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4>Parsed preview ({parsedRows.length} rows) {Object.keys(errorsMap).length > 0 ? <Tag color="red">{Object.keys(errorsMap).length} invalid</Tag> : null}</h4>
            <div style={{ marginBottom: 8 }}>
              <Button onClick={() => validateAll(parsedRows)} size="small">Validate</Button>
            </div>
            <Table
              dataSource={parsedRows.map((r, i) => ({ key: i, ...r }))}
              pagination={false}
              rowClassName={(record, idx) => errorsMap[idx as number] ? 'invalid-row' : ''}
              columns={[
                ...headers.map(h => ({
                  title: h,
                  dataIndex: h,
                  key: h,
                  render: (val: any, record: any, idx?: number) => {
                    const rowIndex = idx as number
                    if (editingIndex === rowIndex) {
                      return (
                        <Input value={editingValues[h] ?? ''} onChange={e => setEditingValues(prev => ({ ...prev, [h]: e.target.value }))} />
                      )
                    }
                    return <span>{val}</span>
                  }
                })),
                {
                  title: 'Errors',
                  key: 'errors',
                  render: (_: any, __: any, idx?: number) => {
                    const e = errorsMap[idx as number]
                    if (!e || !e.length) return null
                    return e.map((x, i) => <div key={i}><Tag color="red">{x}</Tag></div>)
                  }
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_: any, record: any, idx?: number) => {
                    const i = idx as number
                    if (editingIndex === i) {
                      return (
                        <Space>
                          <Button size="small" type="primary" onClick={() => {
                            // save
                            const updated = [...parsedRows]
                            updated[i] = { ...updated[i], ...editingValues }
                            setParsedRows(updated)
                            // revalidate this row
                            const e = validateRow(updated[i])
                            setErrorsMap(prev => { const copy = { ...prev }; if (e.length) copy[i] = e; else delete copy[i]; return copy })
                            setEditingIndex(null)
                            setEditingValues({})
                          }}>Save</Button>
                          <Button size="small" onClick={() => { setEditingIndex(null); setEditingValues({}) }}>Cancel</Button>
                        </Space>
                      )
                    }
                    return (
                      <Space>
                        <Button size="small" onClick={() => { setEditingIndex(i); setEditingValues(parsedRows[i] || {}) }}>Edit</Button>
                      </Space>
                    )
                  }
                }
              ]}
            />
          </div>
        )}

        {results && (
          <div style={{ marginTop: 16 }}>
            <h4>Import results</h4>
            <div style={{ marginBottom: 8 }}>
              <Button onClick={() => {
                const failed = getFailedRowsFromResults()
                if (!failed.length) return message.info('No failed rows')
                setParsedRows(failed)
                setCsv(serializeToCsv(failed, headers.length ? headers : undefined))
                message.success('Loaded failed rows into preview for editing')
              }}>Load failed rows</Button>
              <Button style={{ marginLeft: 8 }} onClick={() => {
                const failed = getFailedRowsFromResults()
                if (!failed.length) return message.info('No failed rows')
                downloadCsv(failed, 'failed_rows.csv')
              }}>Download failed rows</Button>
            </div>
            <Table dataSource={results.map((r, i) => ({ key: i, ...r }))} pagination={false}>
              <Table.Column title="Email" dataIndex="email" key="email" />
              <Table.Column title="ID" dataIndex="id" key="id" />
              <Table.Column title="Status" key="status" render={(v, record: any) => (
                record.updated ? <Tag color="green">Success</Tag> : <Tag color="red">Failed</Tag>
              )} />
              <Table.Column title="Message" dataIndex="message" key="message" />
            </Table>
          </div>
        )}
      </Card>
    </Layout>
  )
}
