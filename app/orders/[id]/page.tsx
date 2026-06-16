'use client'

import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Phone, BadgeCheck, Package, Clock,
  Truck, CheckCircle2, XCircle, Copy, ExternalLink, Store,
} from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { orders, Order } from '@/lib/data'
import { cn } from '@/lib/utils'

const orderStatusCfg = {
  pending:    { label: 'Pending',    color: 'text-amber-400',      bg: 'bg-amber-400/10',      icon: Clock,        step: 0 },
  processing: { label: 'Processing', color: 'text-[var(--blue)]',  bg: 'bg-[var(--blue-dim)]', icon: Package,      step: 1 },
  shipped:    { label: 'Shipped',    color: 'text-purple-400',     bg: 'bg-purple-400/10',     icon: Truck,        step: 2 },
  delivered:  { label: 'Delivered',  color: 'text-emerald-400',    bg: 'bg-emerald-400/10',    icon: CheckCircle2, step: 3 },
  cancelled:  { label: 'Cancelled',  color: 'text-red-400',        bg: 'bg-red-400/10',        icon: XCircle,      step: -1 },
}

const orderTypeCfg = {
  buy:    { label: 'Purchase', color: 'text-[var(--blue)]',  bg: 'bg-[var(--blue-dim)]' },
  rent:   { label: 'Rental',   color: 'text-purple-400',    bg: 'bg-purple-400/10'     },
  repair: { label: 'Repair',   color: 'text-amber-400',     bg: 'bg-amber-400/10'      },
}

const trackingSteps = ['Order Placed', 'Processing', 'Shipped', 'Delivered']

function MapPreview({ lat, lng, address }: { lat: number; lng: number; address: string }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="relative h-40 bg-[var(--surface-2)] overflow-hidden">
        <iframe
          title="Delivery location"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`}
          className="w-full h-full border-none"
          loading="lazy"
        />
        <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-[var(--glass-border)]" />
      </div>
      <div className="p-3 flex items-center gap-2">
        <MapPin size={14} className="text-[var(--blue)] shrink-0" />
        <p className="text-xs text-muted-foreground flex-1 truncate">{address}</p>
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
          target="_blank" rel="noreferrer"
          className="flex items-center gap-1 text-[10px] text-[var(--blue)] font-semibold shrink-0"
        >
          Open <ExternalLink size={10} />
        </a>
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const order = orders.find((o: Order) => o.id === id)

  if (!order) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
          <p className="text-muted-foreground text-sm">Order not found.</p>
          <button onClick={() => router.back()} className="text-[var(--blue)] text-sm font-semibold">Go Back</button>
        </div>
      </PageShell>
    )
  }

  const status = orderStatusCfg[order.status] || orderStatusCfg.pending
  const type   = orderTypeCfg[order.type] || orderTypeCfg.buy
  const StatusIcon = status.icon
  const currentStep = status.step
  const fullAddress = `${order.address.street}, ${order.address.city}, ${order.address.wilaya} ${order.address.zip}`

  return (
    <PageShell>
      <div className="px-4 pt-14 pb-8 space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} className="text-white" />
          </motion.button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-white">Order Details</h1>
            <p className="text-[10px] text-muted-foreground font-mono">{order.id}</p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => navigator.clipboard?.writeText(order.id)}
            className="w-9 h-9 rounded-xl glass flex items-center justify-center shrink-0"
          >
            <Copy size={14} className="text-muted-foreground" />
          </motion.button>
        </div>

        {/* Product image */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="relative h-52 bg-[var(--surface-2)]">
            <Image src={order.productImage} alt={order.productName} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <h2 className="text-base font-black text-white text-balance leading-snug">{order.productName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', type.bg, type.color)}>{type.label}</span>
                <span className="text-[10px] text-white/70">
                  {new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status + price */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4">
            <p className="text-[10px] text-muted-foreground mb-2">Status</p>
            <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit', status.bg)}>
              <StatusIcon size={13} className={status.color} />
              <span className={cn('text-xs font-bold', status.color)}>{status.label}</span>
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-[10px] text-muted-foreground mb-1">Total Paid</p>
            <p className="text-xl font-black text-white">{order.price.toLocaleString('en-US')}</p>
            <p className="text-[10px] text-muted-foreground">{order.currency}</p>
          </div>
        </div>

        {/* Tracking timeline */}
        {order.status !== 'cancelled' && (
          <div className="glass rounded-2xl p-4">
            <p className="text-xs font-bold text-white mb-4">Order Tracking</p>
            <div className="space-y-0">
              {trackingSteps.map((step, idx) => {
                const isDone    = idx <= currentStep
                const isCurrent = idx === currentStep
                const isLast    = idx === trackingSteps.length - 1
                return (
                  <div key={step} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all z-10',
                        isDone ? 'bg-[var(--blue)]' : 'bg-[var(--surface-3)]',
                        isCurrent && 'ring-2 ring-[var(--blue)]/40'
                      )}>
                        {isDone
                          ? <CheckCircle2 size={15} className="text-[#050505]" />
                          : <div className="w-2 h-2 rounded-full bg-muted-foreground" />}
                      </div>
                      {!isLast && (
                        <div className={cn('w-0.5 flex-1 my-1 min-h-[16px]', idx < currentStep ? 'bg-[var(--blue)]' : 'bg-[var(--surface-3)]')} />
                      )}
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="flex items-center gap-2 mt-1">
                        <p className={cn('text-xs font-semibold', isDone ? 'text-white' : 'text-muted-foreground')}>{step}</p>
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)] pulse-dot" />}
                      </div>
                      {isCurrent && <p className="text-[10px] text-[var(--blue)] mt-0.5">Current status</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Map + address */}
        <div>
          <p className="text-xs font-bold text-white mb-3">Delivery Address</p>
          <MapPreview lat={order.mapLat} lng={order.mapLng} address={fullAddress} />
        </div>

        {/* Seller info */}
        <div className="glass rounded-2xl p-4">
          <p className="text-xs font-bold text-white mb-3">
            {order.type === 'repair' ? 'Repair Shop' : 'Seller'} Info
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--blue-dim)] flex items-center justify-center shrink-0">
              <Store size={18} className="text-[var(--blue)]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">{order.seller.name}</span>
                {order.seller.verified && <BadgeCheck size={14} className="text-[var(--blue)]" />}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{order.seller.phone}</p>
            </div>
            <a href={`tel:${order.seller.phone}`}>
              <motion.div whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-xl bg-[var(--blue-dim)] border border-[var(--blue)]/30 flex items-center justify-center"
              >
                <Phone size={16} className="text-[var(--blue)]" />
              </motion.div>
            </a>
          </div>
        </div>

        {/* Order meta */}
        <div className="glass rounded-2xl p-4 space-y-3">
          {[
            { label: 'Order ID',   value: order.id },
            { label: 'Order Type', value: type.label },
            { label: 'Date',       value: new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
            { label: 'City',       value: order.address.city },
            { label: 'Wilaya',     value: order.address.wilaya },
            { label: 'Zip Code',   value: order.address.zip },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs font-semibold text-white">{value}</span>
            </div>
          ))}
        </div>

      </div>
    </PageShell>
  )
}
