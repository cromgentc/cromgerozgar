import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Download, FileSpreadsheet, FileText, Plus, Search, X } from 'lucide-react'

export function AdminCard({ children, className = '' }) {
  return <div className={`rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>
}

export function StatusBadge({ status }) {
  const key = String(status).toLowerCase()
  const tone =
    key.includes('active') || key.includes('approved') || key.includes('paid') || key.includes('selected') || key.includes('verified')
      ? 'bg-teal-50 text-teal-700 ring-teal-100'
      : key.includes('pending') || key.includes('review') || key.includes('interview') || key.includes('open')
        ? 'bg-blue-50 text-blue-700 ring-blue-100'
        : key.includes('blocked') || key.includes('rejected') || key.includes('failed') || key.includes('closed')
          ? 'bg-rose-50 text-rose-700 ring-rose-100'
          : 'bg-violet-50 text-violet-700 ring-violet-100'

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${tone}`}>{status}</span>
}

export function Toolbar({
  title,
  subtitle,
  actionLabel = 'Add New',
  onAction,
  searchValue = '',
  onSearchChange,
  statusValue = '',
  onStatusChange,
}) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
      <div>
        <h2 className="text-2xl font-black text-slate-950">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-500">
          <Search size={17} className="text-blue-600" />
          <input
            className="w-full bg-transparent outline-none"
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search records"
            value={searchValue}
          />
        </label>
        <select
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 outline-none"
          onChange={(event) => onStatusChange?.(event.target.value)}
          value={statusValue}
        >
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Blocked">Blocked</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700" onClick={onAction} type="button">
          <Plus size={17} /> {actionLabel}
        </button>
      </div>
    </div>
  )
}

export function DataTable({ columns, rows, actions }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const start = rows.length ? (page - 1) * pageSize + 1 : 0
  const end = Math.min(page * pageSize, rows.length)
  const visibleRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [page, pageSize, rows])

  useEffect(() => {
    setPage(1)
  }, [rows])

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  return (
    <AdminCard className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => <th className="whitespace-nowrap px-5 py-4 font-bold" key={column.key}>{column.label}</th>)}
              {actions && <th className="px-5 py-4 font-bold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRows.map((row) => (
              <tr className="transition hover:bg-blue-50/40" key={row._id || row.id}>
                {columns.map((column) => (
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600" key={column.key}>
                    {column.badge ? <StatusBadge status={row[column.key]} /> : formatCell(column.key, row[column.key])}
                  </td>
                ))}
                {actions && <td className="px-5 py-4">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-slate-500">Showing {start}-{end} of {rows.length} records</p>
          <select className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 outline-none" onChange={(event) => setPageSize(Number(event.target.value))} value={pageSize}>
            {[5, 10, 20, 50].map((size) => <option key={size} value={size}>{size} / page</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-full bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600 disabled:opacity-40" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">Prev</button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
            <button
              className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${pageNumber === page ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600'}`}
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              type="button"
            >
              {pageNumber}
            </button>
          ))}
          <button className="rounded-full bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600 disabled:opacity-40" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} type="button">Next</button>
        </div>
      </div>
    </AdminCard>
  )
}

function formatCell(key, value) {
  if (Array.isArray(value)) return value.join(', ')
  if (key === '_id' && value) return String(value).slice(-8)
  if (key === 'createdAt' && value) return new Date(value).toLocaleDateString()
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return value
}

export function ActionButtons({ onEdit, onDelete, extra = 'Approve' }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700" onClick={onEdit} type="button">Edit</button>
      <button className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700" type="button">{extra}</button>
      {onDelete && <button className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700" onClick={onDelete} type="button">Delete</button>}
    </div>
  )
}

export function ExportButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="export-btn" type="button"><FileSpreadsheet size={16} /> CSV</button>
      <button className="export-btn" type="button"><Download size={16} /> Excel</button>
      <button className="export-btn" type="button"><FileText size={16} /> PDF</button>
    </div>
  )
}

export function AdminModal({ open, title, children, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/30 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl" initial={{ y: 24, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.96 }}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-950">{title}</h3>
              <button className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500" onClick={onClose} type="button"><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm }) {
  return (
    <AdminModal open={open} title="Confirm delete" onClose={onClose}>
      <p className="text-slate-500">This action will remove the selected record from the admin list.</p>
      <div className="mt-6 flex justify-end gap-2">
        <button className="rounded-full bg-slate-100 px-5 py-2 text-sm font-bold text-slate-700" onClick={onClose} type="button">Cancel</button>
        <button className="rounded-full bg-rose-600 px-5 py-2 text-sm font-bold text-white" onClick={onConfirm || onClose} type="button">Delete</button>
      </div>
    </AdminModal>
  )
}

export function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((item) => <div className="h-32 animate-pulse rounded-[1.5rem] bg-white ring-1 ring-slate-200" key={item} />)}
    </div>
  )
}

export function EmptyAdminState({ title = 'No records found' }) {
  return (
    <AdminCard className="text-center">
      <Search className="mx-auto text-blue-600" size={34} />
      <h3 className="mt-4 text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">Try changing search terms, filters, or date range.</p>
    </AdminCard>
  )
}
