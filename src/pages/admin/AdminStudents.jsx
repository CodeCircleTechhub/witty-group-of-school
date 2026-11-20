import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserPlus, Mail, Phone, Pencil, Trash2, Eye, Users, ArrowUpRight, UploadCloud, Download, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Badge, { statusColor } from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import ProgressBar from '../../components/ui/ProgressBar'
import DataTable, { TableToolbar } from '../../components/ui/DataTable'
import StatCard from '../../components/ui/StatCard'
import { admin } from '../../services/api'

const inputCls = 'w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-sm outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100'

const emptyForm = { name: '', dob: '', phone: '', email: '', password: '', classId: '', house: '', parentName: '', parentPhone: '', gender: '', session: '' }

export default function AdminStudents() {
  const [searchParams] = useSearchParams()
  const searchParam = searchParams.get('search') || ''
  const studentParam = searchParams.get('student') || ''
  const [query, setQuery] = useState(searchParam)
  const [selected, setSelected] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [classId, setClassId] = useState('')
  const [rows, setRows] = useState([])
  const [stats, setStats] = useState(null)
  const [classes, setClasses] = useState([])
  const [sessions, setSessions] = useState([])
  const [promoteOpen, setPromoteOpen] = useState(false)
  const [promoteIds, setPromoteIds] = useState([])
  const [repeatIds, setRepeatIds] = useState([])
  const [promoteClassId, setPromoteClassId] = useState('')
  const [promoteSession, setPromoteSession] = useState('')
  const [promoting, setPromoting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [editError, setEditError] = useState(null)
  const [editSaving, setEditSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [note, setNote] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkClassId, setBulkClassId] = useState('')
  const [bulkSession, setBulkSession] = useState('')
  const [bulkFile, setBulkFile] = useState(null)
  const [bulkError, setBulkError] = useState(null)
  const [bulkResult, setBulkResult] = useState(null)
  const [bulkDownloading, setBulkDownloading] = useState(false)
  const [bulkUploading, setBulkUploading] = useState(false)
  const bulkFileRef = useRef(null)

  useEffect(() => {
    Promise.all([admin.classes(), admin.sessions()])
      .then(([classesRes, sessionsRes]) => {
        setClasses(classesRes.data || [])
        setSessions(sessionsRes.data || [])
      })
      .catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!classId && !searchParam) {
      setRows([])
      setStats(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    admin.students({ classId: classId || undefined, search: searchParam || undefined })
      .then((res) => {
        if (cancelled) return
        setRows(res.data || [])
        setStats(res.stats || null)
        if (res.classes) setClasses(res.classes)
        if (res.sessions) setSessions(res.sessions)
      })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [classId, searchParam, reloadKey])

  const reload = () => setReloadKey((key) => key + 1)

  useEffect(() => {
    setSelectedIds([])
  }, [classId, searchParam, query, reloadKey])

  useEffect(() => {
    setQuery(searchParam)
  }, [searchParam])

  useEffect(() => {
    if (!studentParam) return
    let cancelled = false
    admin.showStudent(studentParam)
      .then((res) => {
        if (cancelled) return
        const student = res.data
        setSelected(student)
        if (student?.classId) setClassId(String(student.classId))
      })
      .catch((e) => { if (!cancelled) setError(e.message) })
    return () => { cancelled = true }
  }, [studentParam])

  const filtered = useMemo(
    () => rows.filter((s) => (s.name + s.studentId + s.className).toLowerCase().includes(query.toLowerCase())),
    [rows, query],
  )

  const promoteRows = useMemo(
    () => rows.filter((s) => promoteIds.includes(s.id)),
    [rows, promoteIds],
  )

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const defaultSession = () => sessions.find((s) => s.isCurrent)?.name || sessions[0]?.name || ''

  const openAdd = () => {
    setForm({ ...emptyForm, session: defaultSession() })
    setFormError(null)
    setAddOpen(true)
  }

  const openBulkUpload = () => {
    setBulkClassId(classId || '')
    setBulkSession(defaultSession())
    setBulkFile(null)
    setBulkError(null)
    setBulkResult(null)
    if (bulkFileRef.current) bulkFileRef.current.value = ''
    setBulkOpen(true)
  }

  const closeBulkUpload = () => {
    setBulkOpen(false)
    setBulkFile(null)
    setBulkError(null)
    setBulkResult(null)
    if (bulkFileRef.current) bulkFileRef.current.value = ''
  }

  const handleBulkTemplate = async () => {
    if (!bulkClassId) {
      setBulkError('Select a class before downloading the template.')
      return
    }

    setBulkDownloading(true)
    setBulkError(null)
    try {
      await admin.downloadStudentTemplate({ classId: bulkClassId, session: bulkSession || undefined })
    } catch (e) {
      setBulkError(e.message)
    } finally {
      setBulkDownloading(false)
    }
  }

  const handleBulkFile = (event) => {
    setBulkFile(event.target.files?.[0] || null)
    setBulkError(null)
    setBulkResult(null)
  }

  const handleBulkUpload = async () => {
    if (!bulkClassId) {
      setBulkError('Select the class these students should be added to.')
      return
    }

    if (!bulkFile) {
      setBulkError('Choose the completed template file first.')
      return
    }

    setBulkUploading(true)
    setBulkError(null)
    setBulkResult(null)
    try {
      const formData = new FormData()
      formData.append('classId', bulkClassId)
      if (bulkSession) formData.append('session', bulkSession)
      formData.append('file', bulkFile)
      const res = await admin.uploadStudents(formData)
      setBulkResult(res)
      setBulkFile(null)
      if (bulkFileRef.current) bulkFileRef.current.value = ''
      setNote(res.message)
      if (String(classId) !== String(bulkClassId)) setClassId(bulkClassId)
      else reload()
    } catch (e) {
      setBulkError(e.errors ? Object.values(e.errors).flat().join(' ') : e.message)
    } finally {
      setBulkUploading(false)
    }
  }

  const openPromote = (ids) => {
    setPromoteIds(ids)
    setRepeatIds([])
    setPromoteClassId('')
    setPromoteSession(defaultSession())
    setPromoteOpen(true)
  }

  const toggleRepeat = (id) => {
    setRepeatIds((ids) => (ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]))
  }

  const handlePromote = async () => {
    if (!promoteIds.length || !promoteClassId) {
      window.alert('Select the class to promote the selected students into.')
      return
    }

    setPromoting(true)
    try {
      const res = await admin.promoteStudents({
        ids: promoteIds,
        classId: Number(promoteClassId),
        repeatIds,
        session: promoteSession || undefined,
      })
      setPromoteOpen(false)
      setPromoteIds([])
      setRepeatIds([])
      setSelectedIds([])
      setNote(res.message)
      reload()
    } catch (e) {
      window.alert(e.errors ? Object.values(e.errors).flat().join(' ') : e.message)
    } finally {
      setPromoting(false)
    }
  }

  const handleSave = async () => {
    setFormError(null)

    if (!form.password || form.password.length < 6) {
      setFormError('Set a login password of at least 6 characters for the student.')
      return
    }

    setSaving(true)
    try {
      const targetClassId = form.classId
      await admin.createStudent({ ...form, classId: targetClassId ? Number(targetClassId) : '' })
      setAddOpen(false)
      setForm(emptyForm)
      if (targetClassId && String(targetClassId) !== String(classId)) setClassId(String(targetClassId))
      else reload()
    } catch (e) {
      setFormError(e.errors ? Object.values(e.errors).flat().join(' ') : e.message)
    } finally {
      setSaving(false)
    }
  }

  const dateToInput = (value) => {
    const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    return match ? `${match[3]}-${match[2]}-${match[1]}` : String(value || '').slice(0, 10)
  }

  const openEdit = (student) => {
    setSelected(null)
    setEditing(student)
    setEditForm({
      name: student.name || '',
      dob: dateToInput(student.dob),
      gender: student.gender || '',
      classId: student.classId ? String(student.classId) : '',
      session: student.session || '',
      house: student.house || '',
      parentName: student.parent?.name && student.parent.name !== '—' ? student.parent.name : '',
      parentPhone: student.parent?.phone && student.parent.phone !== '—' ? student.parent.phone : '',
      status: student.status || 'Active',
      password: '',
    })
    setEditError(null)
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!editing) return

    if (!editForm.name.trim()) {
      setEditError('Student name is required.')
      return
    }

    if (!editForm.classId) {
      setEditError('Select a class for the student.')
      return
    }

    if (editForm.password && editForm.password.length < 6) {
      setEditError('The new password must be at least 6 characters.')
      return
    }

    setEditSaving(true)
    setEditError(null)
    try {
      const payload = {
        name: editForm.name.trim(),
        gender: editForm.gender || undefined,
        dob: editForm.dob || null,
        classId: Number(editForm.classId),
        house: editForm.house || null,
        parentName: editForm.parentName || null,
        parentPhone: editForm.parentPhone || null,
        status: editForm.status || undefined,
        session: editForm.session || undefined,
      }

      if (editForm.password) payload.password = editForm.password

      const res = await admin.updateStudent(editing.id, payload)
      setEditOpen(false)
      setEditing(null)
      setNote(`Student updated successfully${res.data?.studentId ? ` • Admission number: ${res.data.studentId}` : ''}.`)
      reload()
    } catch (e) {
      setEditError(e.errors ? Object.values(e.errors).flat().join(' ') : e.message)
    } finally {
      setEditSaving(false)
    }
  }

  const removeStudents = async (ids, label) => {
    if (!ids.length) return
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return

    try {
      await admin.bulkDeleteStudents(ids)
      setSelectedIds([])
      reload()
    } catch (e) {
      window.alert(e.message)
    }
  }

  const handleDelete = (student) => removeStudents([student.id], student.name)

  const toggleSelected = (student) => setSelectedIds((ids) => (
    ids.includes(student.id) ? ids.filter((id) => id !== student.id) : [...ids, student.id]
  ))

  const toggleAll = (checked, rows) => setSelectedIds(checked ? rows.map((student) => student.id) : [])

  const columns = [
    { key: 'name', label: 'Student', render: (s) => (
      <div className="flex items-center gap-3">
        <Avatar initials={s.initials} color={s.color} size="sm" />
        <div>
          <p className="font-semibold text-navy-900">{s.name}</p>
          <p className="text-xs text-slate-400">{s.email}</p>
        </div>
      </div>
    ) },
    { key: 'studentId', label: 'Admission No.', render: (s) => <span className="font-mono text-xs font-semibold text-navy-700">{s.studentId}</span> },
    { key: 'class', label: 'Class', render: (s) => <Badge color="navy">{s.className}</Badge> },
    { key: 'gender', label: 'Gender' },
    { key: 'parent', label: 'Parent / Guardian', render: (s) => (
      <div>
        <p className="font-medium text-navy-800">{s.parent?.name}</p>
        <p className="text-xs text-slate-400">{s.parent?.phone}</p>
      </div>
    ) },
    { key: 'house', label: 'House', render: (s) => <Badge color="gold" dot>{s.house}</Badge> },
    { key: 'status', label: 'Status', render: (s) => <Badge color={statusColor(s.status)} dot>{s.status}</Badge> },
    { key: 'actions', label: '', right: true, render: (s) => (
      <div className="flex justify-end gap-1">
        <button onClick={(e) => { e.stopPropagation(); setSelected(s) }} className="grid h-8 w-8 place-items-center rounded-lg text-navy-600 transition hover:bg-navy-50"><Eye size={15} /></button>
        <button onClick={(e) => { e.stopPropagation(); openEdit(s) }} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-gold-600"><Pencil size={15} /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(s) }} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
      </div>
    ) },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy-100 border-t-navy-700" />
      </div>
    )
  }

  const malePct = stats && stats.total ? Math.round(stats.male / stats.total * 100) : 0
  const femalePct = stats && stats.total ? Math.round(stats.female / stats.total * 100) : 0
  const selectedClass = classes.find((c) => String(c.id) === String(classId))
  const className = selectedClass?.name || ''

  return (
    <div>
      <PageHeader
        title="Student Management"
        subtitle={classId ? `${stats?.total ?? rows.length} students in ${className}` : searchParam ? `${rows.length} result${rows.length === 1 ? '' : 's'} for "${searchParam}"` : 'Select a class to view its students'}
        actions={(
          <div className="flex flex-wrap gap-2">
            <Button tone="outline" onClick={openBulkUpload}><UploadCloud size={16} /> Bulk Upload</Button>
            <Button tone="primary" onClick={openAdd}><UserPlus size={16} /> Add Student</Button>
          </div>
        )}
      />

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          <span>{error}</span>
          <Button tone="ghost" size="sm" onClick={reload}>Retry</Button>
        </div>
      )}
      {note && <div className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">{note}</div>}

      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="block w-full sm:max-w-xs">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Select Class</span>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className={inputCls}>
              <option value="">Select a class…</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{typeof c.studentCount === 'number' ? ` (${c.studentCount})` : ''}
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm text-slate-500">
            {classId ? `${rows.length} student${rows.length === 1 ? '' : 's'} loaded for ${className}.` : 'Students load one class at a time so the list stays easy to browse.'}
          </p>
        </div>
      </Card>

      {classId && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard icon={Users} label="Active Students" value={stats?.active ?? '—'} sub={stats ? `${stats.total} in class` : 'select a class'} tone="navy" index={0} />
          <StatCard icon={Users} label="Male / Female" value={stats ? `${stats.male} / ${stats.female}` : '—'} sub={`${malePct}% / ${femalePct}%`} tone="sky" index={1} />
          <StatCard icon={Users} label="Suspended" value={stats?.suspended ?? '—'} sub="review" tone="rose" index={2} />
        </div>
      )}

      {classId || searchParam ? (
        <Card>
          <TableToolbar
            title={classId ? `${className} Students` : 'Search Results'}
            subtitle={classId ? 'Search, edit, promote, transfer or manage records' : `Showing matches for "${searchParam}"`}
            onSearch={setQuery}
            placeholder="Search student or ID..."
            actions={(
              <div className="flex flex-wrap items-center gap-2">
                {selectedIds.length > 0 && (
                  <>
                    <Button
                      tone="emerald"
                      size="sm"
                      onClick={() => openPromote(selectedIds)}
                    >
                      <ArrowUpRight size={14} /> Promote Selected ({selectedIds.length})
                    </Button>
                    <Button
                      tone="danger"
                      size="sm"
                      onClick={() => removeStudents(selectedIds, `${selectedIds.length} selected student${selectedIds.length === 1 ? '' : 's'}`)}
                    >
                      <Trash2 size={14} /> Delete Selected ({selectedIds.length})
                    </Button>
                  </>
                )}
                {classId && (
                  <Button
                    tone="emerald"
                    size="sm"
                    disabled={!rows.length}
                    onClick={() => openPromote(rows.map((student) => student.id))}
                  >
                    <ArrowUpRight size={14} /> Promote Whole Class
                  </Button>
                )}
                <Button
                  tone="outline"
                  size="sm"
                  disabled={!filtered.length}
                  onClick={() => removeStudents(filtered.map((student) => student.id), `all ${filtered.length} student${filtered.length === 1 ? '' : 's'} shown`)}
                >
                  <Trash2 size={14} /> Delete All
                </Button>
              </div>
            )}
          />
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey="id"
            onRowClick={(s) => setSelected(s)}
            selectable
            selectedIds={selectedIds}
            onSelect={toggleSelected}
            onSelectAll={toggleAll}
          />
        </Card>
      ) : (
        <Card className="p-10 text-center">
          <Users size={36} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-navy-800">Select a class to view its students</p>
          <p className="mt-1 text-xs text-slate-400">Choose a class from the dropdown above to load only that class.</p>
        </Card>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Student Profile" wide>
        {selected && (
          <div>
            <div className="flex flex-wrap items-center gap-5">
              <Avatar initials={selected.initials} color={selected.color} size="xl" />
              <div className="min-w-0 flex-1">
                <h4 className="text-xl font-extrabold text-navy-900">{selected.name}</h4>
                <p className="font-mono text-xs font-semibold text-navy-600">{selected.studentId}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge color="navy">{selected.className}</Badge>
                  <Badge color="gold" dot>{selected.house}</Badge>
                  <Badge color={statusColor(selected.status)} dot>{selected.status}</Badge>
                </div>
              </div>
              <Button tone="outline" size="sm" onClick={() => openEdit(selected)}><Pencil size={14} /> Edit</Button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[['Gender', selected.gender], ['Date of Birth', selected.dob], ['Session', selected.session], ['Admission Type', selected.admission], ['Phone', selected.phone], ['Email', selected.email]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-navy-50/50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{k}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-navy-900">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-navy-100 p-4">
              <div className="flex items-center gap-3">
                <Avatar initials={(selected.parent?.name || '').split(' ').map(x => x[0]).slice(0, 2).join('')} color="bg-gold-500" />
                <div>
                  <p className="text-sm font-bold text-navy-900">{selected.parent?.name}</p>
                  <p className="text-xs text-slate-400">Parent / Guardian • {selected.parent?.phone}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-navy-100 p-4">
                <p className="text-sm font-bold text-navy-900">Attendance (Term)</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Attendance rate</span>
                  <span className="font-bold text-emerald-600">{selected.attendanceRate ?? 0}%</span>
                </div>
                <ProgressBar value={selected.attendanceRate ?? 0} color="bg-emerald-500" className="mt-2" />
              </div>
              <div className="rounded-xl border border-navy-100 p-4">
                <p className="text-sm font-bold text-navy-900">Fees Balance</p>
                <p className="mt-2 text-2xl font-extrabold text-rose-600">₦{(selected.fees?.balance ?? 0).toLocaleString()}</p>
                <p className="text-xs text-slate-400">of ₦{(selected.fees?.due ?? 0).toLocaleString()} total • paid ₦{(selected.fees?.paid ?? 0).toLocaleString()}</p>
                <ProgressBar value={selected.fees?.due ? Math.round(selected.fees.paid / selected.fees.due * 100) : 0} color="bg-gold-500" className="mt-2" />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button tone="outline" size="sm" onClick={() => openPromote([selected.id])}><ArrowUpRight size={14} /> Promote</Button>
              <Button tone="outline" size="sm"><Phone size={14} /> Transfer</Button>
              <Button tone="gold" size="sm"><Mail size={14} /> Notify Parent</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={promoteOpen} onClose={() => setPromoteOpen(false)} title="Promote Students" wide>
        <p className="text-sm text-slate-500">
          Choose the class to promote into. Promoted students keep their serial number — only the class code in the
          admission number changes (for example <span className="font-mono font-semibold text-navy-700">WGS/2026/JSS1A/001</span> becomes{' '}
          <span className="font-mono font-semibold text-navy-700">WGS/2026/JSS2A/001</span>). Tick{' '}
          <span className="font-semibold text-navy-800">Repeat</span> for any student who should stay in the current class;
          repeat students keep their exact admission number. If a serial is already taken in the target class, the next
          available number is used and you will be told how many were adjusted.
        </p>

        {promoteRows.length > 0 && (
          <div className="mt-4 max-h-56 space-y-2 overflow-y-auto rounded-xl border border-navy-100 p-3">
            {promoteRows.map((student) => (
              <label key={student.id} className="flex items-center justify-between gap-3 rounded-lg bg-navy-50/40 px-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-navy-900">{student.name}</span>
                  <span className="block truncate font-mono text-[11px] text-slate-400">{student.studentId}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-500">
                  <input
                    type="checkbox"
                    checked={repeatIds.includes(student.id)}
                    onChange={() => toggleRepeat(student.id)}
                    className="h-4 w-4 rounded border-navy-200 accent-navy-700"
                  />
                  Repeat
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="mt-5 grid gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Promote Into</span>
            <select className="w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-sm outline-none focus:border-navy-400" value={promoteClassId} onChange={(e) => setPromoteClassId(e.target.value)}>
              <option value="">Select target class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">New Session</span>
            {sessions.length ? (
              <select className="w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-sm outline-none focus:border-navy-400" value={promoteSession} onChange={(e) => setPromoteSession(e.target.value)}>
                <option value="">Keep current session</option>
                {sessions.map((s) => <option key={s.id} value={s.name}>{s.name}{s.isCurrent ? ' (current)' : ''}</option>)}
              </select>
            ) : (
              <input className="w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-sm outline-none focus:border-navy-400" placeholder="e.g. 2026/2027" value={promoteSession} onChange={(e) => setPromoteSession(e.target.value)} />
            )}
          </label>
          {promoteClassId && promoteRows.length > 0 && promoteRows.every((student) => String(student.classId) === String(promoteClassId)) && (
            <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
              These students are already in this class, so they will be marked as repeating and will keep their admission numbers.
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button tone="ghost" onClick={() => setPromoteOpen(false)}>Cancel</Button>
          <Button tone="emerald" disabled={promoting || !promoteClassId} onClick={handlePromote}>
            {promoting ? 'Promoting...' : `Promote ${Math.max(0, promoteIds.length - repeatIds.length)} Student${promoteIds.length - repeatIds.length === 1 ? '' : 's'}`}
          </Button>
        </div>
      </Modal>

      <Modal open={editOpen} onClose={() => { setEditOpen(false); setEditing(null); setEditError(null) }} title={editing ? `Edit ${editing.name}` : 'Edit Student'} wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Full Name</span>
            <input className={inputCls} placeholder="Enter full name" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Date of Birth</span>
            <input type="date" className={inputCls} value={editForm.dob} onChange={(e) => setEditForm((f) => ({ ...f, dob: e.target.value }))} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Gender</span>
            <select className={inputCls} value={editForm.gender} onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Class</span>
            <select className={inputCls} value={editForm.classId} onChange={(e) => setEditForm((f) => ({ ...f, classId: e.target.value }))}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Admission Session / Year</span>
            {sessions.length ? (
              <select className={inputCls} value={editForm.session} onChange={(e) => setEditForm((f) => ({ ...f, session: e.target.value }))}>
                <option value="">Select session</option>
                {editForm.session && !sessions.some((s) => s.name === editForm.session) && (
                  <option value={editForm.session}>{editForm.session}</option>
                )}
                {sessions.map((s) => <option key={s.id} value={s.name}>{s.name}{s.isCurrent ? ' (current)' : ''}</option>)}
              </select>
            ) : (
              <input className={inputCls} placeholder="e.g. 2026/2027" value={editForm.session} onChange={(e) => setEditForm((f) => ({ ...f, session: e.target.value }))} />
            )}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Status</span>
            <select className={inputCls} value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">House</span>
            <input className={inputCls} placeholder="Enter house" value={editForm.house} onChange={(e) => setEditForm((f) => ({ ...f, house: e.target.value }))} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Parent / Guardian Name</span>
            <input className={inputCls} placeholder="Enter parent name" value={editForm.parentName} onChange={(e) => setEditForm((f) => ({ ...f, parentName: e.target.value }))} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Parent / Guardian Phone</span>
            <input className={inputCls} placeholder="Enter parent phone" value={editForm.parentPhone} onChange={(e) => setEditForm((f) => ({ ...f, parentPhone: e.target.value }))} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">New Password</span>
            <input
              type="password"
              minLength={6}
              autoComplete="new-password"
              className={inputCls}
              placeholder="Leave blank to keep current password"
              value={editForm.password}
              onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
            />
          </label>
        </div>
        <p className="mt-4 rounded-xl bg-navy-50/60 px-4 py-3 text-xs text-slate-500">
          Changing the class updates the class code in the admission number while keeping the serial number.
          For example WGS/2026/JSS1A/001 becomes WGS/2026/JSS2A/001. If that serial is already taken in the new class,
          the next available number is assigned.
        </p>
        {editError && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">{editError}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button tone="ghost" onClick={() => { setEditOpen(false); setEditing(null); setEditError(null) }}>Cancel</Button>
          <Button tone="primary" disabled={editSaving} onClick={handleEditSave}>{editSaving ? 'Saving…' : 'Save Changes'}</Button>
        </div>
      </Modal>

      <Modal open={addOpen} onClose={() => { setAddOpen(false); setForm(emptyForm); setFormError(null) }} title="Add New Student" wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Full Name</span>
            <input className={inputCls} placeholder="Enter full name" value={form.name} onChange={setField('name')} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Date of Birth</span>
            <input type="date" className={inputCls} placeholder="Enter date of birth" value={form.dob} onChange={setField('dob')} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Phone Number</span>
            <input className={inputCls} placeholder="Enter phone number" value={form.phone} onChange={setField('phone')} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Email Address</span>
            <input type="email" className={inputCls} placeholder="Optional student email" value={form.email} onChange={setField('email')} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Login Password</span>
            <input
              type="password"
              minLength={6}
              autoComplete="new-password"
              className={inputCls}
              placeholder="At least 6 characters"
              value={form.password}
              onChange={setField('password')}
            />
            <span className="mt-1 block text-xs text-slate-400">The student signs in with their admission number (shown after saving) and this password.</span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Class</span>
            <select className={inputCls} value={form.classId} onChange={setField('classId')}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Admission Session / Year</span>
            {sessions.length ? (
              <select className={inputCls} value={form.session} onChange={setField('session')}>
                <option value="">Select session</option>
                {sessions.map((s) => <option key={s.id} value={s.name}>{s.name}{s.isCurrent ? ' (current)' : ''}</option>)}
              </select>
            ) : (
              <input className={inputCls} placeholder="e.g. 2026/2027" value={form.session} onChange={setField('session')} />
            )}
            <span className="mt-1 block text-xs text-slate-400">
              Admission number is generated per class and year, e.g. WGS/{String(form.session || '').slice(0, 4) || '2026'}/{String(classes.find((c) => String(c.id) === String(form.classId))?.name || 'JSS1A').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}/001
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Gender</span>
            <select className={inputCls} value={form.gender} onChange={setField('gender')}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">House</span>
            <input className={inputCls} placeholder="Enter house" value={form.house} onChange={setField('house')} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Parent Name</span>
            <input className={inputCls} placeholder="Enter parent name" value={form.parentName} onChange={setField('parentName')} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Parent Phone</span>
            <input className={inputCls} placeholder="Enter parent phone" value={form.parentPhone} onChange={setField('parentPhone')} />
          </label>
        </div>
        {formError && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">{formError}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button tone="ghost" onClick={() => { setAddOpen(false); setFormError(null); setForm(emptyForm) }}>Cancel</Button>
          <Button tone="primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Save Student'}</Button>
        </div>
      </Modal>

      <Modal open={bulkOpen} onClose={closeBulkUpload} title="Bulk Upload Students" wide>
        <div className="rounded-xl border border-navy-100 bg-navy-50/40 p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-navy-600 shadow-card"><FileSpreadsheet size={18} /></span>
            <div>
              <p className="text-sm font-bold text-navy-900">Download the class template, fill it in, then upload.</p>
              <p className="mt-1 text-xs text-slate-500">
                Columns: Admission Number, Full Name, Gender, Date of Birth, House, Parent / Guardian Name, Parent / Guardian Phone, Admission Session and Login Password.
                Admission Numbers are pre-generated in the selected class format, and every row already has the default password 123456.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Class</span>
            <select
              className={inputCls}
              value={bulkClassId}
              onChange={(e) => { setBulkClassId(e.target.value); setBulkResult(null); setBulkError(null) }}
            >
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-800">Admission Session / Year</span>
            {sessions.length ? (
              <select className={inputCls} value={bulkSession} onChange={(e) => setBulkSession(e.target.value)}>
                <option value="">Use current session</option>
                {sessions.map((s) => <option key={s.id} value={s.name}>{s.name}{s.isCurrent ? ' (current)' : ''}</option>)}
              </select>
            ) : (
              <input className={inputCls} placeholder="e.g. 2026/2027" value={bulkSession} onChange={(e) => setBulkSession(e.target.value)} />
            )}
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button tone="outline" onClick={handleBulkTemplate} disabled={!bulkClassId || bulkDownloading}>
            <Download size={15} /> {bulkDownloading ? 'Preparing...' : 'Download Template'}
          </Button>
          <input ref={bulkFileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkFile} className="hidden" />
          <Button tone="outline" onClick={() => bulkFileRef.current?.click()}>
            <UploadCloud size={15} /> {bulkFile ? 'Change File' : 'Choose File'}
          </Button>
          <span className="min-w-0 truncate text-xs text-slate-400">{bulkFile ? bulkFile.name : 'XLSX, XLS or CSV - max 10MB'}</span>
        </div>

        {bulkError && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">{bulkError}</p>}

        {bulkResult && (
          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 size={16} /> {bulkResult.message}</p>
              <Badge color="emerald" dot>{bulkResult.created} added</Badge>
              {bulkResult.skipped > 0 && <Badge color="gold" dot>{bulkResult.skipped} skipped</Badge>}
            </div>

            {!!bulkResult.students?.length && (
              <div className="mt-3 max-h-48 overflow-y-auto rounded-lg bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-navy-50 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Student</th>
                      <th className="px-3 py-2">Admission No.</th>
                      <th className="px-3 py-2">Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResult.students.map((student) => (
                      <tr key={student.row} className="border-t border-navy-50">
                        <td className="px-3 py-2 font-medium text-navy-900">{student.name}</td>
                        <td className="px-3 py-2 font-mono text-navy-700">{student.studentId}</td>
                        <td className="px-3 py-2 text-slate-500">{student.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!!bulkResult.skippedRows?.length && (
              <div className="mt-3 max-h-40 space-y-1.5 overflow-y-auto rounded-lg bg-white p-3">
                {bulkResult.skippedRows.map((row) => (
                  <p key={row.row} className="flex items-start gap-2 text-xs text-amber-700">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    <span>Row {row.row} ({row.name}): {row.reason}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button tone="ghost" onClick={closeBulkUpload}>Close</Button>
          <Button tone="primary" onClick={handleBulkUpload} disabled={!bulkFile || !bulkClassId || bulkUploading}>
            <UploadCloud size={15} /> {bulkUploading ? 'Uploading...' : 'Upload Students'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
