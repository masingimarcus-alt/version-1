'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Copy, Share2, Download, CheckCircle2, Trophy, User, Ticket, QrCode, Sparkles } from 'lucide-react'
import { currentUser, tournaments } from '@/lib/data'
import { cn } from '@/lib/utils'

type QRType = 'profile' | 'checkin' | 'tournament'

const qrTypes: { id: QRType; label: string; icon: typeof User; description: string }[] = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Share your player profile' },
  { id: 'checkin', label: 'Check-in', icon: Ticket, description: 'Quick tournament check-in' },
  { id: 'tournament', label: 'Tournament', icon: Trophy, description: 'Join tournament invite' },
]

export default function QRCodePage() {
  const router = useRouter()
  const [activeType, setActiveType] = useState<QRType>('profile')
  const [selectedTournament, setSelectedTournament] = useState(tournaments[0].id)
  const [copied, setCopied] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const getQRValue = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://e-competition.app'
    switch (activeType) {
      case 'profile':
        return `${baseUrl}/player/${currentUser.id}`
      case 'checkin':
        return `${baseUrl}/checkin/${currentUser.id}?t=${Date.now()}`
      case 'tournament':
        return `${baseUrl}/tournaments/${selectedTournament}/join?ref=${currentUser.id}`
      default:
        return baseUrl
    }
  }

  const getQRTitle = () => {
    switch (activeType) {
      case 'profile':
        return `${currentUser.username}${currentUser.tag}`
      case 'checkin':
        return 'Tournament Check-in'
      case 'tournament':
        const t = tournaments.find((x) => x.id === selectedTournament)
        return t?.name ?? 'Tournament'
      default:
        return 'QR Code'
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getQRValue())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: getQRTitle(),
        text: `Check out my E-Competition profile`,
        url: getQRValue(),
      })
    } else {
      handleCopy()
    }
  }

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new window.Image()

    img.onload = () => {
      canvas.width = 512
      canvas.height = 512
      if (ctx) {
        ctx.fillStyle = '#0d0d0f'
        ctx.fillRect(0, 0, 512, 512)
        ctx.drawImage(img, 56, 56, 400, 400)
      }
      const pngUrl = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.href = pngUrl
      downloadLink.download = `e-competition-${activeType}-qr.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    }

    img.crossOrigin = 'anonymous'
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="min-h-screen bg-[#050505] grid-pattern pb-10">
      {/* Header */}
      <div className="px-4 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <motion.div whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="w-10 h-10 rounded-xl glass flex items-center justify-center cursor-pointer">
              <ArrowLeft size={18} className="text-white" />
            </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">QR Code</h1>
              <QrCode size={16} className="text-[var(--blue)]" />
            </div>
            <p className="text-[10px] text-muted-foreground">Share, check-in, or invite</p>
          </div>
        </div>

        {/* QR Type selector */}
        <div className="flex gap-2 mb-6">
          {qrTypes.map((type) => (
            <motion.button
              key={type.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveType(type.id)}
              className={cn(
                'flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1.5 transition-all',
                activeType === type.id
                  ? 'bg-[var(--blue)] text-[#050505]'
                  : 'glass text-muted-foreground'
              )}
            >
              <type.icon size={18} />
              <span className="text-xs font-bold">{type.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {/* QR Code display */}
        <motion.div
          layout
          className="glass rounded-3xl p-6 mb-4 relative overflow-hidden"
        >
          {/* Decorative gradient */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--blue)]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative">
            {/* User info for profile type */}
            {activeType === 'profile' && (
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[var(--blue)]/30">
                  <Image
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="text-sm font-black text-white">{currentUser.username}<span className="text-muted-foreground">{currentUser.tag}</span></p>
                  <p className="text-xs text-muted-foreground">Level {currentUser.level} · {currentUser.rank}</p>
                </div>
              </div>
            )}

            {/* Tournament selector for tournament type */}
            {activeType === 'tournament' && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Select Tournament</p>
                <div className="space-y-2">
                  {tournaments.filter((t) => t.status !== 'full').map((t) => (
                    <motion.button
                      key={t.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTournament(t.id)}
                      className={cn(
                        'w-full p-3 rounded-xl flex items-center gap-3 transition-all text-left',
                        selectedTournament === t.id
                          ? 'bg-[var(--blue-dim)] border border-[var(--blue)]/30'
                          : 'glass'
                      )}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <Image src={t.cover} alt={t.name} width={40} height={40} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{t.name}</p>
                        <p className="text-[10px] text-muted-foreground">{t.registeredPlayers}/{t.maxPlayers} players</p>
                      </div>
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                        selectedTournament === t.id ? 'border-[var(--blue)] bg-[var(--blue)]' : 'border-[var(--glass-border)]'
                      )}>
                        {selectedTournament === t.id && <CheckCircle2 size={11} className="text-[#050505]" />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Check-in info */}
            {activeType === 'checkin' && (
              <div className="mb-5 p-3 rounded-xl bg-amber-400/10 border border-amber-400/20">
                <div className="flex items-start gap-2">
                  <Sparkles size={14} className="text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-400">One-time use</p>
                    <p className="text-[10px] text-amber-400/70">This QR code refreshes after each scan for security</p>
                  </div>
                </div>
              </div>
            )}

            {/* QR Code */}
            <div className="flex justify-center mb-5">
              <motion.div
                key={activeType + selectedTournament}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="p-4 rounded-2xl bg-white"
              >
                <QRCodeSVG
                  id="qr-code-svg"
                  value={getQRValue()}
                  size={200}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#050505"
                />
              </motion.div>
            </div>

            {/* QR Title */}
            <p className="text-center text-sm font-bold text-white mb-1">{getQRTitle()}</p>
            <p className="text-center text-xs text-muted-foreground mb-4">
              {qrTypes.find((t) => t.id === activeType)?.description}
            </p>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="py-3 rounded-xl glass flex flex-col items-center gap-1.5"
              >
                {copied ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : (
                  <Copy size={18} className="text-muted-foreground" />
                )}
                <span className={cn('text-[10px] font-semibold', copied ? 'text-emerald-400' : 'text-muted-foreground')}>
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="py-3 rounded-xl glass flex flex-col items-center gap-1.5"
              >
                <Share2 size={18} className="text-muted-foreground" />
                <span className="text-[10px] font-semibold text-muted-foreground">Share</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="py-3 rounded-xl bg-[var(--blue-dim)] border border-[var(--blue)]/30 flex flex-col items-center gap-1.5"
              >
                {showSuccess ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : (
                  <Download size={18} className="text-[var(--blue)]" />
                )}
                <span className={cn('text-[10px] font-semibold', showSuccess ? 'text-emerald-400' : 'text-[var(--blue)]')}>
                  {showSuccess ? 'Saved!' : 'Save'}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Recent scans / activity */}
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'Profile shared', detail: 'via Discord', time: '2 hours ago', icon: User },
              { action: 'Tournament check-in', detail: 'FIFA 25 Champions Cup', time: 'Yesterday', icon: Ticket },
              { action: 'Invite sent', detail: 'to NightHawk_DZ', time: '3 days ago', icon: Trophy },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-3)] flex items-center justify-center shrink-0">
                  <item.icon size={14} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white">{item.action}</p>
                  <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
