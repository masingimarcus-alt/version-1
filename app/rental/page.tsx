'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Calendar, CheckCircle2, XCircle, Calculator, Minus, Plus, MapPin, Truck, Store, Loader2 } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { getRentalConsoles } from '@/app/actions/rentals'
import { cn, formatNumber } from '@/lib/utils'

type Console = {
  id: string
  name: string
  model: string
  condition: string
  pricePerHour: number
  pricePerDay: number
  deposit: number
  available: boolean | null
  image: string | null
  features: string[] | null
}

function RentalModal({ console: c, onClose }: { console: Console; onClose: () => void }) {
  const [hours, setHours] = useState(2)
  const [unit, setUnit] = useState<'hours' | 'days'>('hours')
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup')
  const [address, setAddress] = useState('')
  const [booked, setBooked] = useState(false)

  const duration = unit === 'hours' ? hours : hours
  const price = unit === 'hours' ? c.pricePerHour * duration : c.pricePerDay * duration
  const deliveryFee = deliveryOption === 'delivery' ? 500 : 0
  const total = price + c.deposit + deliveryFee
  const features = c.features || []

  if (booked) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end"
      >
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="w-full glass border-t border-[var(--glass-border)] rounded-t-3xl p-8 pb-12 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <CheckCircle2 size={52} className="text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-black text-white mb-2">Booking Confirmed!</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">
            Your <strong className="text-white">{c.name}</strong> rental has been confirmed for{' '}
            <strong className="text-white">{hours} {unit}</strong>.{' '}
            {deliveryOption === 'delivery' ? 'It will be delivered to your address.' : 'Please pick it up at our store.'}
          </p>
          <div className="glass rounded-2xl p-4 text-left space-y-2.5 mb-6">
            {[
              { label: 'Console',   value: `${c.name} — ${c.model}` },
              { label: 'Duration',  value: `${hours} ${unit}` },
              { label: 'Option',    value: deliveryOption === 'pickup' ? 'Store pickup' : 'Home delivery' },
              { label: 'Rental',    value: `${ formatNumber(price) } TL` },
              { label: 'Deposit',   value: `${ formatNumber(c.deposit) } TL` },
              { label: 'Total',     value: `${ formatNumber(total) } TL` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-bold text-white">{value}</span>
              </div>
            ))}
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            className="w-full py-4 rounded-2xl bg-[var(--blue)] text-[#050505] font-bold text-sm"
          >
            Done
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

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
        <div className="w-10 h-1 rounded-full bg-[var(--surface-3)] mx-auto mb-5" />
        <h3 className="text-lg font-black text-white mb-1">{c.name}</h3>
        <p className="text-xs text-muted-foreground mb-5">{c.model} · {c.condition}</p>

        {/* Unit toggle */}
        <div className="flex gap-2 mb-5">
          {(['hours', 'days'] as const).map((u) => (
            <button
              key={u}
              onClick={() => { setUnit(u); setHours(u === 'hours' ? 2 : 1) }}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-xs font-bold transition-all capitalize',
                unit === u ? 'bg-[var(--blue)] text-[#050505]' : 'glass text-muted-foreground'
              )}
            >
              {u}
            </button>
          ))}
        </div>

        {/* Duration picker */}
        <div className="glass rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">Duration</span>
            <div className="flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setHours(Math.max(unit === 'hours' ? 1 : 1, hours - 1))}
                className="w-9 h-9 rounded-xl bg-[var(--surface-3)] flex items-center justify-center"
              >
                <Minus size={15} className="text-white" />
              </motion.button>
              <span className="text-xl font-black text-white w-12 text-center">{hours}</span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setHours(Math.min(unit === 'hours' ? 24 : 30, hours + 1))}
                className="w-9 h-9 rounded-xl bg-[var(--blue-dim)] border border-[var(--blue)]/30 flex items-center justify-center"
              >
                <Plus size={15} className="text-[var(--blue)]" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="glass rounded-xl p-4 mb-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Rental ({hours} {unit})</span>
            <span className="text-xs font-semibold text-white">{ formatNumber(price) } TL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Deposit (refundable)</span>
            <span className="text-xs font-semibold text-white">{ formatNumber(c.deposit) } TL</span>
          </div>
          {deliveryOption === 'delivery' && (
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Delivery fee</span>
              <span className="text-xs font-semibold text-white">500 TL</span>
            </div>
          )}
          <div className="h-px bg-[var(--glass-border)]" />
          <div className="flex justify-between">
            <span className="text-sm font-bold text-white">Total</span>
            <span className="text-sm font-black text-[var(--blue)]">{ formatNumber(total) } TL</span>
          </div>
        </div>

        {/* Delivery option */}
        <p className="text-xs font-bold text-white mb-2">Delivery Option</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {([
            { value: 'pickup',   icon: Store, label: 'Store Pickup', sub: 'No delivery fee' },
            { value: 'delivery', icon: Truck, label: 'Home Delivery', sub: '+500 TL' },
          ] as const).map(({ value, icon: Icon, label, sub }) => (
            <motion.button key={value} type="button" whileTap={{ scale: 0.95 }}
              onClick={() => setDeliveryOption(value)}
              className={cn('flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                deliveryOption === value
                  ? 'bg-[var(--blue-dim)] border border-[var(--blue)]/40'
                  : 'glass border border-transparent'
              )}
            >
              <Icon size={18} className={deliveryOption === value ? 'text-[var(--blue)]' : 'text-muted-foreground'} />
              <div className="text-center">
                <p className={cn('text-xs font-bold', deliveryOption === value ? 'text-[var(--blue)]' : 'text-white')}>{label}</p>
                <p className="text-[10px] text-muted-foreground">{sub}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Address (delivery only) */}
        {deliveryOption === 'delivery' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
            <p className="text-xs font-bold text-white mb-2">Delivery Address</p>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Enter your full address"
                value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full glass rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none border border-transparent focus:border-[var(--blue)]/50 transition-colors"
              />
            </div>
          </motion.div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setBooked(true)}
          disabled={deliveryOption === 'delivery' && !address.trim()}
          className={cn('w-full py-4 rounded-2xl font-bold text-sm transition-all',
            deliveryOption === 'pickup' || address.trim()
              ? 'bg-[var(--blue)] text-[#050505] glow-blue'
              : 'bg-[var(--surface-3)] text-muted-foreground cursor-not-allowed'
          )}
        >
          Book Now
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default function RentalPage() {
  const [selectedConsole, setSelectedConsole] = useState<Console | null>(null)
  const [consoles, setConsoles] = useState<Console[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRentalConsoles().then((data) => {
      setConsoles(data as Console[])
      setLoading(false)
    })
  }, [])

  return (
    <PageShell>
      <div className="px-4 pt-14 pb-4">
        <h1 className="text-2xl font-black text-white mb-1">Console Rental</h1>
        <p className="text-xs text-muted-foreground mb-6">Rent premium gaming consoles by the hour or day</p>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--blue)]" />
          </div>
        ) : consoles.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground text-sm">
            No consoles available for rent at the moment
          </div>
        ) : (
          <div className="space-y-5">
            {consoles.map((c, i) => {
              const isAvailable = c.available ?? false
              const features = c.features || []
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-3xl overflow-hidden card-hover"
                >
                  {/* Console image */}
                  <div className="relative h-48 bg-[var(--surface-2)]">
                    {c.image && <Image src={c.image} alt={c.name} fill className="object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-transparent to-transparent" />

                    {/* Availability badge */}
                    <div className={cn(
                      'absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full',
                      isAvailable ? 'bg-emerald-400/10 border border-emerald-400/30' : 'bg-red-400/10 border border-red-400/30'
                    )}>
                      {isAvailable
                        ? <CheckCircle2 size={11} className="text-emerald-400" />
                        : <XCircle size={11} className="text-red-400" />}
                      <span className={cn('text-[11px] font-bold', isAvailable ? 'text-emerald-400' : 'text-red-400')}>
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-black text-white">{c.name}</h3>
                        <p className="text-xs text-muted-foreground">{c.model} · {c.condition}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {features.map((f) => (
                        <span key={f} className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--surface-3)] text-muted-foreground">{f}</span>
                      ))}
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="glass rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock size={12} className="text-[var(--blue)]" />
                          <span className="text-[10px] text-muted-foreground">Per Hour</span>
                        </div>
                        <p className="text-sm font-black text-white">{ formatNumber(c.pricePerHour) } <span className="text-[10px] font-normal text-muted-foreground">TL</span></p>
                      </div>
                      <div className="glass rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Calendar size={12} className="text-[var(--blue)]" />
                          <span className="text-[10px] text-muted-foreground">Per Day</span>
                        </div>
                        <p className="text-sm font-black text-white">{ formatNumber(c.pricePerDay) } <span className="text-[10px] font-normal text-muted-foreground">TL</span></p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calculator size={12} className="text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">Deposit: { formatNumber(c.deposit) } TL (refundable)</span>
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      disabled={!isAvailable}
                      onClick={() => isAvailable && setSelectedConsole(c)}
                      className={cn(
                        'w-full py-3 rounded-xl font-bold text-sm transition-all',
                        isAvailable
                          ? 'bg-[var(--blue)] text-[#050505] glow-blue'
                          : 'bg-[var(--surface-3)] text-muted-foreground cursor-not-allowed'
                      )}
                    >
                      {isAvailable ? 'Book Now' : 'Currently Unavailable'}
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedConsole && (
          <RentalModal console={selectedConsole} onClose={() => setSelectedConsole(null)} />
        )}
      </AnimatePresence>
    </PageShell>
  )
}
