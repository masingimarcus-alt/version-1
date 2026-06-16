'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createRentalConsole, updateRentalConsole } from '@/app/actions/rentals'

export type ConsoleFormValues = {
  id: string
  name: string
  model: string
  condition: string
  pricePerHour: number
  pricePerDay: number
  deposit: number
  available: boolean
  image: string
  features: string[]
}

const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Fair']

export function ConsoleFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: ConsoleFormValues | null
  onClose: () => void
  onSaved: (values: ConsoleFormValues) => void
}) {
  const isEdit = Boolean(initial)
  const [name, setName] = useState(initial?.name ?? '')
  const [model, setModel] = useState(initial?.model ?? '')
  const [condition, setCondition] = useState(initial?.condition ?? 'Excellent')
  const [pricePerHour, setPricePerHour] = useState(initial?.pricePerHour ?? 0)
  const [pricePerDay, setPricePerDay] = useState(initial?.pricePerDay ?? 0)
  const [deposit, setDeposit] = useState(initial?.deposit ?? 0)
  const [available, setAvailable] = useState(initial?.available ?? true)
  const [image, setImage] = useState(initial?.image ?? '')
  const [featuresText, setFeaturesText] = useState((initial?.features ?? []).join(', '))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    if (!name.trim() || !model.trim()) {
      setError('Name and model are required')
      return
    }
    const features = featuresText
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)

    const values: ConsoleFormValues = {
      id: initial?.id ?? `console-${Date.now()}`,
      name: name.trim(),
      model: model.trim(),
      condition,
      pricePerHour: Number(pricePerHour) || 0,
      pricePerDay: Number(pricePerDay) || 0,
      deposit: Number(deposit) || 0,
      available,
      image: image.trim() || '/placeholder.svg',
      features,
    }

    setSaving(true)
    try {
      if (isEdit) {
        const { id, ...rest } = values
        await updateRentalConsole(id, rest)
      } else {
        await createRentalConsole(values)
      }
      onSaved(values)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save console')
    } finally {
      setSaving(false)
    }
  }

  const fieldClass =
    'w-full glass rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none border border-transparent focus:border-[var(--blue)]/50 transition-colors'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full glass border-t border-[var(--glass-border)] rounded-t-3xl p-5 pb-10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-white">{isEdit ? 'Edit Console' : 'Add Console'}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center"
            aria-label="Close"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-white mb-1.5 block">Name</label>
            <input className={fieldClass} placeholder="PlayStation 5" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-white mb-1.5 block">Model</label>
            <input className={fieldClass} placeholder="Disc Edition" value={model} onChange={(e) => setModel(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-bold text-white mb-1.5 block">Condition</label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    condition === c ? 'bg-[var(--blue)] text-[#050505]' : 'glass text-muted-foreground'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-white mb-1.5 block">TL / hour</label>
              <input type="number" min={0} className={fieldClass} value={pricePerHour} onChange={(e) => setPricePerHour(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-bold text-white mb-1.5 block">TL / day</label>
              <input type="number" min={0} className={fieldClass} value={pricePerDay} onChange={(e) => setPricePerDay(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-bold text-white mb-1.5 block">Deposit</label>
              <input type="number" min={0} className={fieldClass} value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-white mb-1.5 block">Image URL</label>
            <input className={fieldClass} placeholder="/placeholder.svg or https://..." value={image} onChange={(e) => setImage(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-bold text-white mb-1.5 block">Features (comma separated)</label>
            <input className={fieldClass} placeholder="4K, DualSense, 1TB SSD" value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} />
          </div>

          {/* Availability toggle — the core admin control */}
          <div className="glass rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Availability</p>
              <p className="text-[10px] text-muted-foreground">Controls what clients see</p>
            </div>
            <button
              type="button"
              onClick={() => setAvailable((v) => !v)}
              className={cn(
                'relative w-14 h-7 rounded-full transition-colors',
                available ? 'bg-emerald-400/80' : 'bg-[var(--surface-3)]'
              )}
              aria-label="Toggle availability"
            >
              <span
                className={cn(
                  'absolute top-1 w-5 h-5 rounded-full bg-white transition-all',
                  available ? 'left-8' : 'left-1'
                )}
              />
            </button>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-[var(--blue)] text-[#050505] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? 'Save Changes' : 'Add Console'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
