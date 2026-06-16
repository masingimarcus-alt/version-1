'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, ChevronRight, CheckCircle2, Clock, Search, Headphones, Cpu, Gamepad, Gamepad2, AlertCircle } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { repairCategories, repairRequests } from '@/lib/data'
import { cn } from '@/lib/utils'

const deviceIcons: Record<string, typeof Wrench> = {
  'gamepad-2': Gamepad2,
  gamepad: Gamepad,
  cpu: Cpu,
  headphones: Headphones,
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  'in-progress': { label: 'In Progress', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  completed:     { label: 'Completed',   color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  pending:       { label: 'Pending',     color: 'text-[var(--blue)]', bg: 'bg-[var(--blue-dim)]' },
}

const timelineSteps = ['Received', 'Diagnosing', 'Repairing', 'Quality Check', 'Ready']

export default function RepairPage() {
  const [step, setStep] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const category = repairCategories.find((c) => c.id === selectedCategory)

  const handleSubmit = () => {
    if (!selectedCategory || !selectedService) return
    setSubmitted(true)
  }

  return (
    <PageShell>
      <div className="px-4 pt-14 pb-4">
        <h1 className="text-2xl font-black text-white mb-1">Repair Center</h1>
        <p className="text-xs text-muted-foreground mb-6">Professional repair services with warranty</p>

        {/* Existing repair requests */}
        {repairRequests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-white mb-3">Active Requests</h3>
            <div className="space-y-3">
              {repairRequests.map((req) => {
                const status = statusConfig[req.status]
                const stepIdx = req.status === 'completed' ? 4 : req.status === 'in-progress' ? 2 : 0
                return (
                  <div key={req.id} className="glass rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="text-sm font-bold text-white">{req.device}</p>
                        <p className="text-xs text-muted-foreground">{req.issue}</p>
                      </div>
                      <span className={cn('text-[11px] px-2.5 py-1 rounded-full font-semibold', status.bg, status.color)}>
                        {status.label}
                      </span>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-1 mb-3">
                      {timelineSteps.map((s, i) => (
                        <div key={s} className="flex items-center flex-1">
                          <div className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                            i <= stepIdx ? 'bg-[var(--blue)]' : 'bg-[var(--surface-3)]'
                          )}>
                            {i <= stepIdx
                              ? <CheckCircle2 size={11} className="text-[#050505]" />
                              : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                            }
                          </div>
                          {i < timelineSteps.length - 1 && (
                            <div className={cn('flex-1 h-0.5 mx-0.5', i < stepIdx ? 'bg-[var(--blue)]' : 'bg-[var(--surface-3)]')} />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{timelineSteps[stepIdx]} — Est. {req.estimated} · Tech: {req.technician}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* New repair request form */}
        <h3 className="text-sm font-bold text-white mb-3">New Repair Request</h3>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-3xl p-8 text-center"
            >
              <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-black text-white mb-2">Request Submitted!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Your repair request for <strong className="text-white">{category?.name}</strong> — {selectedService} has been received. A technician will contact you within 24 hours.
              </p>
              <div className="glass rounded-xl p-3 text-left space-y-2 mb-5">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Device</span>
                  <span className="text-xs font-bold text-white">{category?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Service</span>
                  <span className="text-xs font-bold text-white">{selectedService}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Est. Time</span>
                  <span className="text-xs font-bold text-amber-400">2-5 business days</span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setSubmitted(false); setSelectedCategory(''); setSelectedService(''); setDescription('') }}
                className="w-full py-3 rounded-xl bg-[var(--surface-3)] text-white text-sm font-bold"
              >
                Submit Another Request
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Device categories */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">1. Select Device</p>
                <div className="grid grid-cols-2 gap-2">
                  {repairCategories.map((cat) => {
                    const Icon = deviceIcons[cat.icon] ?? Wrench
                    return (
                      <motion.button
                        key={cat.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setSelectedCategory(cat.id); setSelectedService('') }}
                        className={cn(
                          'glass rounded-xl p-4 flex items-center gap-3 transition-all text-left',
                          selectedCategory === cat.id && 'border border-[var(--blue)]/50 bg-[var(--blue-dim)]'
                        )}
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                          selectedCategory === cat.id ? 'bg-[var(--blue)]' : 'bg-[var(--surface-3)]'
                        )}>
                          <Icon size={16} className={selectedCategory === cat.id ? 'text-[#050505]' : 'text-muted-foreground'} />
                        </div>
                        <span className={cn('text-xs font-bold', selectedCategory === cat.id ? 'text-white' : 'text-muted-foreground')}>
                          {cat.name}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Services */}
              <AnimatePresence>
                {category && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <p className="text-xs font-semibold text-muted-foreground mb-2">2. Select Service</p>
                    <div className="space-y-2">
                      {category.services.map((service) => (
                        <motion.button
                          key={service}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedService(service)}
                          className={cn(
                            'w-full glass rounded-xl p-3 flex items-center justify-between transition-all',
                            selectedService === service && 'border border-[var(--blue)]/50'
                          )}
                        >
                          <span className="text-xs text-white font-medium">{service}</span>
                          <div className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                            selectedService === service ? 'border-[var(--blue)] bg-[var(--blue)]' : 'border-[var(--glass-border)]'
                          )}>
                            {selectedService === service && <CheckCircle2 size={11} className="text-[#050505]" />}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Description */}
              {selectedService && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">3. Describe the issue (optional)</p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Additional details about the problem..."
                    rows={3}
                    className="w-full glass rounded-xl p-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none border border-transparent focus:border-[var(--blue)]/50 transition-colors resize-none"
                  />
                </motion.div>
              )}

              {/* Guarantees */}
              <div className="glass rounded-xl p-4 space-y-2">
                {[
                  'Certified technicians with 2+ years experience',
                  '30-day warranty on all repairs',
                  'Free diagnostic assessment',
                ].map((g) => (
                  <div key={g} className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span className="text-xs text-muted-foreground">{g}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!selectedCategory || !selectedService}
                onClick={handleSubmit}
                className={cn(
                  'w-full py-4 rounded-2xl font-bold text-sm transition-all',
                  selectedCategory && selectedService
                    ? 'bg-[var(--blue)] text-[#050505] glow-blue'
                    : 'bg-[var(--surface-3)] text-muted-foreground cursor-not-allowed'
                )}
              >
                Submit Repair Request
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  )
}
