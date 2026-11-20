import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Plus, Pencil, Trash2, MapPin, Paperclip } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { admin } from '../../services/api'

const eventTone = {
  exam: 'bg-navy-600', meeting: 'bg-gold-500', sports: 'bg-emerald-600', islamic: 'bg-teal-700', resumption: 'bg-sky-600',
}
const eventLabel = {
  exam: 'Examination', meeting: 'Meeting', sports: 'Sports', islamic: 'Islamic', resumption: 'Resumption',
}
const inputCls = 'w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-sm outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100'
const emptyForm = { title: '', eventDate: '', type: 'exam', description: '', location: '' }
const attachmentAccept = '.jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv'

const formatBytes = (bytes) => {
  const value = Number(bytes) || 0
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminEvents() {
  const [rows, setRows] = useState([])
  const [type, setType] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [create, setCreate] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [attachment, setAttachment] = useState(null)
  const [removeAttachment, setRemoveAttachment] = useState(false)
  const fileRef = useRef(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await admin.events(type ? { type } : undefined)
      setRows(res.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [type])

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const openCreate = () => {
    setForm({ ...emptyForm, eventDate: new Date().toISOString().slice(0, 10) })
    setFormError(null)
    setAttachment(null)
    setRemoveAttachment(false)
    if (fileRef.current) fileRef.current.value = ''
    setCreate(true)
  }

  const openEdit = (row) => {
    setForm({ title: row.title, eventDate: row.rawDate, type: row.type, description: row.description || '', location: row.location || '' })
    setFormError(null)
    setAttachment(null)
    setRemoveAttachment(false)
    if (fileRef.current) fileRef.current.value = ''
    setEditing(row)
  }

  const closeForm = () => {
    setCreate(false)
    setEditing(null)
    setForm(emptyForm)
    setFormError(null)
    setAttachment(null)
    setRemoveAttachment(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null
    setFormError(null)

    if (!file) {
      setAttachment(null)
      return
    }

    const isImage = file.type.startsWith('image/')
    const limit = isImage ? 100 * 1024 : 2 * 1024 * 1024

    if (file.size > limit) {
      setAttachment(null)
      event.target.value = ''
      setFormError(isImage ? 'Images must not be larger than 100 KB.' : 'Documents and PDFs must not be larger than 2 MB.')
      return
    }

    setAttachment(file)
  }

  const handleSave = async () => {
    setSaving(true)
    setFormError(null)
    try {
      const payload = new FormData()
      payload.append('title', form.title)
      payload.append('eventDate', form.eventDate)
      payload.append('type', form.type)
      payload.append('description', form.description || '')
      payload.append('location', form.location || '')

      if (attachment) payload.append('attachment', attachment)

      if (editing) {
        payload.append('_method', 'PUT')
        if (removeAttachment) payload.append('removeAttachment', '1')
        await admin.updateEvent(editing.id, payload)
      } else {
        await admin.createEvent(payload)
      }

      closeForm()
      load()
    } catch (e) {
      setFormError(e.errors ? Object.values(e.errors).flat().join(' ') : e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete "${row.title}"?`)) return
    try {
      await admin.deleteEvent(row.id)
      load()
    } catch (e) {
      window.alert(e.message)
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-navy-100 border-t-navy-700" /></div>
  }

  return (
    <div>
      <PageHeader title="School Events" subtitle="Manage calendar of activities and competitions" actions={<Button tone="primary" onClick={openCreate}><Plus size={16} /> Add Event</Button>} />

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          <span>{error}</span>
          <Button tone="ghost" size="sm" onClick={load}>Retry</Button>
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        <button onClick={() => setType('')} className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${!type ? 'bg-navy-800 text-white' : 'bg-white text-slate-500 hover:bg-navy-50'}`}>All Events</button>
        {Object.keys(eventLabel).map((t) => (
          <button key={t} onClick={() => setType(t)} className={`rounded-xl px-3.5 py-2 text-sm font-semibold capitalize transition ${type === t ? 'bg-navy-800 text-white' : 'bg-white text-slate-500 hover:bg-navy-50'}`}>{eventLabel[t]}</button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((e) => (
          <Card key={e.id} className="p-6" hover>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <span className={`grid h-14 w-14 place-items-center rounded-2xl ${eventTone[e.type] || 'bg-navy-600'} text-white`}>
                  <CalendarDays size={24} />
                </span>
                <div>
                  <h3 className="font-bold text-navy-900">{e.title}</h3>
                  <p className="text-xs font-semibold text-gold-600">{e.date}</p>
                </div>
              </div>
              <Badge color="navy">{eventLabel[e.type] || e.type}</Badge>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">{e.description || 'No description provided.'}</p>
            {e.location && <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><MapPin size={12} /> {e.location}</p>}
            {e.attachment && (
              <a
                href={e.attachment.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-navy-600 transition hover:text-navy-900"
              >
                <Paperclip size={12} /> {e.attachment.name}
                <span className="font-normal text-slate-400">({formatBytes(e.attachment.size)})</span>
              </a>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button tone="ghost" size="sm" onClick={() => openEdit(e)}><Pencil size={13} /> Edit</Button>
              <Button tone="outline" size="sm" onClick={() => handleDelete(e)}><Trash2 size={13} /> Delete</Button>
            </div>
          </Card>
        ))}
        {!rows.length && <Card className="p-8 text-center text-sm text-slate-400 sm:col-span-2 lg:col-span-3">No events scheduled.</Card>}
      </div>

      <Modal open={create || !!editing} onClose={closeForm} title={editing ? 'Edit Event' : 'Add Event'} wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Event Title</span>
            <input className={inputCls} value={form.title} onChange={setField('title')} placeholder="e.g. Inter-House Sports" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Date</span>
            <input type="date" className={inputCls} value={form.eventDate} onChange={setField('eventDate')} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Type</span>
            <select className={inputCls} value={form.type} onChange={setField('type')}>
              {Object.entries(eventLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Location</span>
            <input className={inputCls} value={form.location} onChange={setField('location')} placeholder="e.g. School Main Field" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Description</span>
            <textarea rows={3} className={inputCls} value={form.description} onChange={setField('description')} />
          </label>
          <div className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Attachment (optional)</span>
            <input
              ref={fileRef}
              type="file"
              accept={attachmentAccept}
              onChange={handleFileChange}
              className="w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-navy-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-navy-700"
            />
            <p className="mt-1 text-xs text-slate-400">Images up to 100 KB. PDF and documents up to 2 MB.</p>
            {attachment && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <Paperclip size={12} /> {attachment.name} ({formatBytes(attachment.size)})
              </p>
            )}
            {editing?.attachment && !attachment && (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-navy-50/60 px-3 py-2">
                <a href={editing.attachment.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-700">
                  <Paperclip size={12} /> {editing.attachment.name} ({formatBytes(editing.attachment.size)})
                </a>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                  <input type="checkbox" checked={removeAttachment} onChange={(e) => setRemoveAttachment(e.target.checked)} />
                  Remove
                </label>
              </div>
            )}
          </div>
        </div>
        {formError && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">{formError}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button tone="ghost" onClick={closeForm}>Cancel</Button>
          <Button tone="primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Event'}</Button>
        </div>
      </Modal>
    </div>
  )
}
