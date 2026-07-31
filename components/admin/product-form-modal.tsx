'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createProduct, updateProduct } from '@/app/actions/products'

export type ProductFormValues = {
  id: string
  name: string
  category: string
  price: number
  condition: string
  description: string
  image: string
  contactPhone: string
  available: boolean
  verified: boolean
}

const CATEGORIES = ['Consoles', 'Controllers', 'Games', 'Accessories']
const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Fair']

export function ProductFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: ProductFormValues | null
  onClose: () => void
  onSaved: (values: ProductFormValues) => void
}) {
  const isEdit = Boolean(initial)
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? 'Consoles')
  const [price, setPrice] = useState(initial?.price ?? 0)
  const [condition, setCondition] = useState(initial?.condition ?? 'New')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [image, setImage] = useState(initial?.image ?? '')
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? '')
  const [available, setAvailable] = useState(initial?.available ?? true)
  const [verified, setVerified] = useState(initial?.verified ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    if (!name.trim()) {
      setError('Product name is required')
      return
    }
    const values: ProductFormValues = {
      id: initial?.id ?? `product-${Date.now()}`,
      name: name.trim(),
      category,
      price: Number(price) || 0,
      condition,
      description: description.trim(),
      image: image.trim() || '/placeholder.svg',
      contactPhone: contactPhone.trim(),
      available,
      verified,
    }

    setSaving(true)
    try {
      if (isEdit) {
        const { id, ...rest } = values
        await updateProduct(id, rest)
      } else {
        await createProduct(values)
      }
      onSaved(values)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save product')
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
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end"
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
          <h3 className="text-lg font-black text-white">{isEdit ? 'Edit Product' : 'Add Product'}</h3>
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
            <input className={fieldClass} placeholder="PlayStation 5 Disc Edition" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-bold text-white mb-1.5 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    category === c ? 'bg-[var(--blue)] text-[#050505]' : 'glass text-muted-foreground',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
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
                    condition === c ? 'bg-[var(--blue)] text-[#050505]' : 'glass text-muted-foreground',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-white mb-1.5 block">Price (TL)</label>
              <input type="number" min={0} className={fieldClass} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-bold text-white mb-1.5 block">Contact phone</label>
              <input className={fieldClass} placeholder="+213..." value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-white mb-1.5 block">Image URL</label>
            <input className={fieldClass} placeholder="/placeholder.svg or https://..." value={image} onChange={(e) => setImage(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-bold text-white mb-1.5 block">Description</label>
            <textarea
              className={cn(fieldClass, 'resize-none')}
              rows={3}
              placeholder="Describe the product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Availability toggle — controls what clients see on Home + Marketplace */}
          <div className="glass rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Available</p>
              <p className="text-[10px] text-muted-foreground">Only available products are shown to clients</p>
            </div>
            <button
              type="button"
              onClick={() => setAvailable((v) => !v)}
              className={cn('relative w-14 h-7 rounded-full transition-colors', available ? 'bg-emerald-400/80' : 'bg-[var(--surface-3)]')}
              aria-label="Toggle availability"
            >
              <span className={cn('absolute top-1 w-5 h-5 rounded-full bg-white transition-all', available ? 'left-8' : 'left-1')} />
            </button>
          </div>

          {/* Verified toggle */}
          <div className="glass rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Verified</p>
              <p className="text-[10px] text-muted-foreground">Shows a verified badge on the listing</p>
            </div>
            <button
              type="button"
              onClick={() => setVerified((v) => !v)}
              className={cn('relative w-14 h-7 rounded-full transition-colors', verified ? 'bg-[var(--blue)]/80' : 'bg-[var(--surface-3)]')}
              aria-label="Toggle verified"
            >
              <span className={cn('absolute top-1 w-5 h-5 rounded-full bg-white transition-all', verified ? 'left-8' : 'left-1')} />
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
            {isEdit ? 'Save Changes' : 'Add Product'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
