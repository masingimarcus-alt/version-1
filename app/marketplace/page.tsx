'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Heart, Star, BadgeCheck, X, ShoppingCart, Filter, Plus, Camera, Upload, CheckCircle2 } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { LogoHeader } from '@/components/logo-header'
import { marketplaceItems } from '@/lib/data'
import { cn, formatNumber } from '@/lib/utils'

const categories = ['All', 'Consoles', 'Controllers', 'Games', 'Accessories']
const conditions = ['New', 'Like New', 'Excellent', 'Good', 'Fair']

type Item = typeof marketplaceItems[0]
type TabType = 'buy' | 'sell'

function ProductModal({ item, onClose }: { item: Item; onClose: () => void }) {
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
        className="w-full glass border-t border-[var(--glass-border)] rounded-t-3xl p-5 pb-10 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-[var(--surface-3)] mx-auto mb-4" />

        <div className="relative h-52 rounded-2xl overflow-hidden mb-4 bg-[var(--surface-2)]">
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        </div>

        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="text-lg font-black text-white text-balance">{item.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-3)] text-muted-foreground">{item.category}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--blue-dim)] text-[var(--blue)]">{item.condition}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl glass flex items-center justify-center shrink-0">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{item.description}</p>

        <div className="glass rounded-xl p-3 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--glass-border)]">
            <Image src={item.seller.avatar} alt={item.seller.username} width={40} height={40} className="object-cover w-full h-full" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">{item.seller.username}</span>
              {item.verified && <BadgeCheck size={13} className="text-[var(--blue)]" />}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={10} className="text-amber-400 fill-amber-400" />
              <span className="text-[10px] text-muted-foreground">{item.seller.rating} - {item.seller.sales} sales</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground">Price</p>
            <p className="text-2xl font-black text-white">{ formatNumber(item.price) } <span className="text-sm font-normal text-muted-foreground">{item.currency}</span></p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-[var(--blue)] text-[#050505] px-5 py-3 rounded-xl font-bold text-sm"
          >
            <ShoppingCart size={16} />
            Contact Seller
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function SellForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Consoles',
    price: '',
    condition: 'Like New',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image upload */}
      <div className="glass rounded-2xl p-4 border border-dashed border-[var(--glass-border)]">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--blue-dim)] flex items-center justify-center mb-3">
            <Camera size={20} className="text-[var(--blue)]" />
          </div>
          <p className="text-xs font-semibold text-white mb-1">Add Photos</p>
          <p className="text-[10px] text-muted-foreground">Upload up to 5 images</p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-3)] text-xs font-semibold text-white"
          >
            <Upload size={14} />
            Choose Files
          </motion.button>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-semibold text-white mb-2 block">Title</label>
        <input
          type="text"
          placeholder="e.g., PlayStation 5 Disc Edition"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none border border-transparent focus:border-[var(--blue)]/50 transition-colors"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-semibold text-white mb-2 block">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.filter(c => c !== 'All').map((cat) => (
            <motion.button
              key={cat}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setFormData({ ...formData, category: cat })}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all',
                formData.category === cat
                  ? 'bg-[var(--blue)] text-[#050505]'
                  : 'glass text-muted-foreground'
              )}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="text-xs font-semibold text-white mb-2 block">Price (TL)</label>
        <input
          type="number"
          placeholder="45000"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none border border-transparent focus:border-[var(--blue)]/50 transition-colors"
          required
        />
      </div>

      {/* Condition */}
      <div>
        <label className="text-xs font-semibold text-white mb-2 block">Condition</label>
        <div className="flex flex-wrap gap-2">
          {conditions.map((cond) => (
            <motion.button
              key={cond}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setFormData({ ...formData, condition: cond })}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all',
                formData.condition === cond
                  ? 'bg-[var(--blue)] text-[#050505]'
                  : 'glass text-muted-foreground'
              )}
            >
              {cond}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-semibold text-white mb-2 block">Description</label>
        <textarea
          placeholder="Describe your item, including any details buyers should know..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none border border-transparent focus:border-[var(--blue)]/50 transition-colors resize-none"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 rounded-2xl bg-[var(--blue)] text-[#050505] font-bold text-sm glow-blue"
      >
        List Item for Sale
      </motion.button>
    </form>
  )
}

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mb-4">
        <CheckCircle2 size={40} className="text-green-400" />
      </div>
      <h3 className="text-xl font-black text-white mb-2">Listing Created!</h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-6">Your item is now live on the marketplace. Buyers can contact you directly.</p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="px-6 py-3 rounded-xl bg-[var(--blue)] text-[#050505] font-bold text-sm"
      >
        List Another Item
      </motion.button>
    </motion.div>
  )
}

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<TabType>('buy')
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['p2']))
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [sellSuccess, setSellSuccess] = useState(false)

  const filtered = marketplaceItems.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'All' || item.category === activeCategory
    return matchSearch && matchCat
  })

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <PageShell>
      <LogoHeader />

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="glass rounded-2xl p-1.5 flex">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('buy')}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all',
              activeTab === 'buy'
                ? 'bg-[var(--blue)] text-[#050505]'
                : 'text-muted-foreground'
            )}
          >
            Buy
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => { setActiveTab('sell'); setSellSuccess(false) }}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2',
              activeTab === 'sell'
                ? 'bg-[var(--blue)] text-[#050505]'
                : 'text-muted-foreground'
            )}
          >
            <Plus size={16} />
            Sell
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'buy' ? (
          <motion.div
            key="buy"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Search & Filter */}
            <div className="px-4 mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search listings..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full glass rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none border border-transparent focus:border-[var(--blue)]/50 transition-colors"
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-xl glass flex items-center justify-center shrink-0"
                >
                  <Filter size={17} className="text-muted-foreground" />
                </motion.button>
              </div>
            </div>

            {/* Category pills */}
            <div className="px-4 mb-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <motion.button
                    key={cat}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all',
                      activeCategory === cat
                        ? 'bg-[var(--blue)] text-[#050505]'
                        : 'glass text-muted-foreground'
                    )}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Product grid */}
            <div className="px-4 grid grid-cols-2 gap-3 pb-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass rounded-2xl overflow-hidden card-hover"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="relative h-36 bg-[var(--surface-2)]">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f]/60 to-transparent" />

                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={(e) => { e.stopPropagation(); toggleFav(item.id) }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
                      >
                        <Heart
                          size={13}
                          className={favorites.has(item.id) ? 'text-red-400 fill-red-400' : 'text-white'}
                        />
                      </motion.button>

                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
                        <span className="text-[9px] font-semibold text-white">{item.condition}</span>
                      </div>
                    </div>

                    <div className="p-3">
                      <p className="text-xs font-bold text-white leading-tight mb-1 line-clamp-2">{item.name}</p>
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={9} className="text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-muted-foreground">{item.seller.rating}</span>
                        {item.verified && <BadgeCheck size={10} className="text-[var(--blue)] ml-0.5" />}
                      </div>
                      <p className="text-sm font-black text-white">{ formatNumber(item.price) }<span className="text-[10px] font-normal text-muted-foreground ml-1">{item.currency}</span></p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="sell"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-4 pb-6"
          >
            {sellSuccess ? (
              <SuccessState onReset={() => setSellSuccess(false)} />
            ) : (
              <SellForm onSuccess={() => setSellSuccess(true)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItem && (
          <ProductModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>
    </PageShell>
  )
}
