import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHeadPlacements } from '../hooks/useDashboard'
import CalculationService from '../utils/calculationService'
import { apiRequest } from '../api/client'

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = [
  { value: 'all', label: 'All years' },
  ...Array.from({ length: 6 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  })),
]

const formatDate = (d) => {
  if (!d) return '-'
  const date = typeof d === 'string' ? new Date(d) : d
  return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const toInputDate = (d) => {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const BILLING_OPTIONS = ['PENDING', 'BILLED', 'CANCELLED', 'HOLD']
const TYPE_OPTIONS = ['PERMANENT', 'CONTRACT']

export default function HeadPlacementsView({ allowEdit = false }) {
  const [placementView, setPlacementView] = useState('team') // 'team' | 'personal'
  const [teamId, setTeamId] = useState('')
  const [leadId, setLeadId] = useState('')
  const [year, setYear] = useState('all')
  const [placementType, setPlacementType] = useState('')
  const [plcIdSearch, setPlcIdSearch] = useState('')
  const [editingRow, setEditingRow] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)

  const filters = useMemo(
    () => ({
      source: placementView,
      teamId: teamId || undefined,
      leadId: leadId || undefined,
      year: year === 'all' ? undefined : year,
      placementType: placementType || undefined,
      plcId: plcIdSearch.trim() || undefined,
    }),
    [placementView, teamId, leadId, year, placementType, plcIdSearch]
  )

  const { data, isLoading, error, refetch } = useHeadPlacements(filters)
  const placements = data?.placements ?? []
  const teams = data?.teams ?? []
  const availableLeads = data?.availableLeads ?? []
  const availablePlacementTypes = data?.availablePlacementTypes ?? []
  const placementTypeOptions = useMemo(() => {
    const options = [{ value: '', label: 'All types' }]
    availablePlacementTypes.forEach((t) => {
      options.push({ value: t, label: t })
    })
    if (availablePlacementTypes.length === 0) {
      options.push({ value: 'PERMANENT', label: 'Permanent' }, { value: 'CONTRACT', label: 'Contract' })
    }
    return options
  }, [availablePlacementTypes])

  const clearFilters = () => {
    setTeamId('')
    setLeadId('')
    setYear('all')
    setPlacementType('')
    setPlcIdSearch('')
  }

  const onTeamChange = (newTeamId) => {
    setTeamId(newTeamId)
    setLeadId('')
  }

  const hasActiveFilters = teamId || leadId || year !== 'all' || placementType || plcIdSearch.trim()

  const openEdit = (row) => {
    setEditingRow(row)
    setEditForm({
      candidateName: row.candidateName ?? '',
      recruiterName: row.recruiterName ?? '',
      leadName: row.leadName ?? '',
      placementYear: row.placementYear != null ? String(row.placementYear) : '',
      doj: toInputDate(row.doj),
      doq: toInputDate(row.doq),
      client: row.client ?? '',
      plcId: row.plcId ?? '',
      placementType: row.placementType ?? 'PERMANENT',
      billingStatus: row.billingStatus ?? 'PENDING',
      collectionStatus: row.collectionStatus ?? '',
      totalBilledHours: row.totalBilledHours != null ? String(row.totalBilledHours) : '',
      revenueUsd: row.revenueUsd != null ? String(row.revenueUsd) : '',
      incentiveInr: row.incentiveInr != null ? String(row.incentiveInr) : '',
      incentivePaidInr: row.incentivePaidInr != null ? String(row.incentivePaidInr) : '',
    })
    setSaveError(null)
  }

  const closeEdit = () => {
    setEditingRow(null)
    setSaveError(null)
  }

  const updateEditForm = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveEdit = async () => {
    if (!editingRow) return
    setSaving(true)
    setSaveError(null)
    try {
      const payload = {
        ...editForm,
        placementYear: editForm.placementYear === '' ? undefined : editForm.placementYear,
        totalBilledHours: editForm.totalBilledHours === '' ? undefined : editForm.totalBilledHours,
        revenueUsd: editForm.revenueUsd === '' ? undefined : editForm.revenueUsd,
        incentiveInr: editForm.incentiveInr === '' ? undefined : editForm.incentiveInr,
        incentivePaidInr: editForm.incentivePaidInr === '' ? undefined : editForm.incentivePaidInr,
        collectionStatus: editForm.collectionStatus === '' ? undefined : editForm.collectionStatus,
      }
      const res = await apiRequest(`/placements/${editingRow.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || errData.message || 'Failed to update placement')
      }
      await refetch()
      closeEdit()
    } catch (err) {
      setSaveError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative z-10 space-y-6"
    >
      {/* View toggle: Team Placements | Personal Placements */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 shadow-inner">
          {[
            { id: 'team', label: 'Team Placements' },
            { id: 'personal', label: 'Personal Placements' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => setPlacementView(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                placementView === tab.id
                  ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200/50'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Filters bar */}
      <motion.div
        layout
        className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm"
      >
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filters</label>
          <select
            value={teamId}
            onChange={(e) => onTeamChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
          >
            <option value="">All teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {teamId && (
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
            >
              <option value="">All leads</option>
              {availableLeads.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          )}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
          >
            {YEAR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={placementType}
            onChange={(e) => setPlacementType(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
          >
            {placementTypeOptions.map((o) => (
              <option key={o.value || 'all'} value={o.value}>{o.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by PLC ID"
            value={plcIdSearch}
            onChange={(e) => setPlcIdSearch(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 min-w-[140px]"
          />
          {hasActiveFilters && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={clearFilters}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear filters
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Content */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {error.message}
        </motion.div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading placements…
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 font-semibold text-slate-700">Team</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Lead</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Recruiter</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Candidate</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Year</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">DOJ</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">DOQ</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Client</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">PLC ID</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Type</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Billing</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Revenue (USD)</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Incentive (INR)</th>
                  {allowEdit && <th className="px-4 py-3 font-semibold text-slate-700 w-24">Actions</th>}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {placements.length === 0 ? (
                    <tr>
                      <td colSpan={allowEdit ? 14 : 13} className="px-4 py-12 text-center text-slate-500">
                        No {placementView === 'team' ? 'team' : 'personal'} placements found. Try changing filters.
                      </td>
                    </tr>
                  ) : (
                    placements.map((row, i) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02, duration: 0.2 }}
                        whileHover={{ backgroundColor: 'rgba(248, 250, 252, 0.9)' }}
                        className="border-b border-slate-100 transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-700">{row.teamName ?? '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{row.leadName ?? '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{row.recruiterName ?? '-'}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{row.candidateName ?? '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{row.placementYear ?? '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{formatDate(row.doj)}</td>
                        <td className="px-4 py-3 text-slate-700">{formatDate(row.doq)}</td>
                        <td className="px-4 py-3 text-slate-700">{row.client ?? '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{row.plcId ?? '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            (row.placementType || '').toUpperCase().includes('CONTRACT') ? 'bg-amber-100 text-amber-800' : 'bg-violet-100 text-violet-800'
                          }`}>
                            {row.placementType ?? '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            (row.billingStatus || '').toUpperCase() === 'BILLED' ? 'bg-emerald-100 text-emerald-800' :
                            (row.billingStatus || '').toUpperCase() === 'PENDING' ? 'bg-slate-100 text-slate-700' :
                            (row.billingStatus || '').toUpperCase() === 'HOLD' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {row.billingStatus ?? '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {row.revenueUsd != null ? CalculationService.formatCurrency(row.revenueUsd) : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {row.incentiveInr != null ? CalculationService.formatCurrency(row.incentiveInr, 'INR') : '-'}
                        </td>
                        {allowEdit && (
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => openEdit(row)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                          </td>
                        )}
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {placements.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-2 text-xs text-slate-500">
              {placements.length} placement{placements.length !== 1 ? 's' : ''} shown
            </div>
          )}
        </motion.div>
      )}

      {/* Edit placement modal */}
      <AnimatePresence>
        {allowEdit && editingRow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            onClick={closeEdit}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                <h3 className="text-lg font-semibold text-slate-800">Edit placement</h3>
                <button type="button" onClick={closeEdit} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-4 p-6">
                {saveError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{saveError}</div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">Candidate name</span>
                    <input type="text" value={editForm.candidateName} onChange={(e) => updateEditForm('candidateName', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">Recruiter name</span>
                    <input type="text" value={editForm.recruiterName} onChange={(e) => updateEditForm('recruiterName', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20" />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-medium text-slate-500">Lead name</span>
                    <input type="text" value={editForm.leadName} onChange={(e) => updateEditForm('leadName', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">Placement year</span>
                    <input type="number" value={editForm.placementYear} onChange={(e) => updateEditForm('placementYear', e.target.value)} placeholder="e.g. 2024" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">DOJ</span>
                    <input type="date" value={editForm.doj} onChange={(e) => updateEditForm('doj', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">DOQ</span>
                    <input type="date" value={editForm.doq} onChange={(e) => updateEditForm('doq', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">Client</span>
                    <input type="text" value={editForm.client} onChange={(e) => updateEditForm('client', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">PLC ID</span>
                    <input type="text" value={editForm.plcId} onChange={(e) => updateEditForm('plcId', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">Placement type</span>
                    <select value={editForm.placementType} onChange={(e) => updateEditForm('placementType', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20">
                      {TYPE_OPTIONS.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">Billing status</span>
                    <select value={editForm.billingStatus} onChange={(e) => updateEditForm('billingStatus', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20">
                      {BILLING_OPTIONS.map((b) => (<option key={b} value={b}>{b}</option>))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">Collection status</span>
                    <input type="text" value={editForm.collectionStatus} onChange={(e) => updateEditForm('collectionStatus', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">Total billed hours</span>
                    <input type="number" value={editForm.totalBilledHours} onChange={(e) => updateEditForm('totalBilledHours', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">Revenue (USD)</span>
                    <input type="number" step="any" value={editForm.revenueUsd} onChange={(e) => updateEditForm('revenueUsd', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">Incentive (INR)</span>
                    <input type="number" step="any" value={editForm.incentiveInr} onChange={(e) => updateEditForm('incentiveInr', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">Incentive paid (INR)</span>
                    <input type="number" step="any" value={editForm.incentivePaidInr} onChange={(e) => updateEditForm('incentivePaidInr', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20" />
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50/80 px-6 py-4">
                <button type="button" onClick={closeEdit} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveEdit} disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
