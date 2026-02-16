import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHeadPlacements } from '../hooks/useDashboard'
import CalculationService from '../utils/calculationService'

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

export default function HeadPlacementsView() {
  const [placementView, setPlacementView] = useState('team') // 'team' | 'personal'
  const [teamId, setTeamId] = useState('')
  const [leadId, setLeadId] = useState('')
  const [year, setYear] = useState('all')
  const [placementType, setPlacementType] = useState('')

  const filters = useMemo(
    () => ({
      source: placementView,
      teamId: teamId || undefined,
      leadId: leadId || undefined,
      year: year === 'all' ? undefined : year,
      placementType: placementType || undefined,
    }),
    [placementView, teamId, leadId, year, placementType]
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
  }

  const onTeamChange = (newTeamId) => {
    setTeamId(newTeamId)
    setLeadId('')
  }

  const hasActiveFilters = teamId || leadId || year !== 'all' || placementType

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
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {placements.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="px-4 py-12 text-center text-slate-500">
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
    </motion.div>
  )
}
