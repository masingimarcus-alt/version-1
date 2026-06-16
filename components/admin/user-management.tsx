'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, ShieldCheck, User as UserIcon, Search, Crown, Loader2, CheckCircle2 } from 'lucide-react'
import { setUserRole } from '@/app/actions/users'
import type { ManagedUser } from '@/app/actions/users'
import type { Role } from '@/lib/auth-server'
import { cn } from '@/lib/utils'

const ROLES: { value: Role; label: string; icon: typeof UserIcon; tone: string }[] = [
  { value: 'player', label: 'Player', icon: UserIcon, tone: 'text-muted-foreground' },
  { value: 'admin', label: 'Admin', icon: Shield, tone: 'text-[var(--blue)]' },
  { value: 'super_admin', label: 'Super Admin', icon: Crown, tone: 'text-amber-400' },
]

function roleMeta(role: Role) {
  return ROLES.find((r) => r.value === role) ?? ROLES[0]
}

export function UserManagement({
  initialUsers,
  viewerId,
}: {
  initialUsers: ManagedUser[]
  viewerId: string
}) {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers)
  const [query, setQuery] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        (u.name ?? '').toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    )
  }, [users, query])

  const counts = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length,
      players: users.filter((u) => u.role === 'player').length,
    }
  }, [users])

  const changeRole = (target: ManagedUser, role: Role) => {
    if (role === target.role) return
    setError(null)
    setSavingId(target.id)
    const previous = target.role
    // optimistic update
    setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, role } : u)))

    startTransition(async () => {
      try {
        await setUserRole(target.id, role)
        setSavedId(target.id)
        setTimeout(() => setSavedId(null), 1500)
      } catch (e) {
        // revert on failure
        setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, role: previous } : u)))
        setError(e instanceof Error ? e.message : 'Failed to update role')
      } finally {
        setSavingId(null)
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#050505] grid-pattern pb-10">
      {/* Header */}
      <div className="px-4 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <Link href="/admin">
            <motion.div whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-xl glass flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </motion.div>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">User Management</h1>
              <Crown size={16} className="text-amber-400" />
            </div>
            <p className="text-[10px] text-muted-foreground">Super Admin · assign roles &amp; permissions</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="glass rounded-xl p-3">
            <p className="text-lg font-black text-white">{counts.total}</p>
            <p className="text-[10px] text-muted-foreground">Total Users</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-lg font-black text-[var(--blue)]">{counts.admins}</p>
            <p className="text-[10px] text-muted-foreground">Admins</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-lg font-black text-white">{counts.players}</p>
            <p className="text-[10px] text-muted-foreground">Players</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-[var(--blue)]/50"
          />
        </div>
      </div>

      {error && (
        <div className="mx-4 mb-3 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2.5">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* User list */}
      <div className="px-4 flex flex-col gap-3">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">No users found.</p>
        )}

        {filtered.map((u) => {
          const meta = roleMeta(u.role)
          const isSelf = u.id === viewerId
          const RoleIcon = meta.icon
          return (
            <div key={u.id} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                  {u.image ? (
                    <Image src={u.image} alt={u.name ?? u.email} width={44} height={44} className="object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {(u.name ?? u.email).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">{u.name ?? 'Unnamed user'}</p>
                    {isSelf && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-400 font-semibold">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className={cn('flex items-center gap-1.5 shrink-0', meta.tone)}>
                  <RoleIcon size={14} />
                  <span className="text-[11px] font-semibold">{meta.label}</span>
                </div>
              </div>

              {/* Role selector */}
              <div className="mt-3 flex items-center gap-2">
                {ROLES.map((r) => {
                  const Icon = r.icon
                  const active = u.role === r.value
                  const disabled =
                    savingId === u.id || (isSelf && r.value !== 'super_admin')
                  return (
                    <button
                      key={r.value}
                      disabled={disabled}
                      onClick={() => changeRole(u, r.value)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold border transition-colors',
                        active
                          ? 'bg-[var(--blue)] text-[#050505] border-transparent'
                          : 'bg-white/5 text-white border-white/10 hover:border-white/30',
                        disabled && !active && 'opacity-40 cursor-not-allowed',
                      )}
                    >
                      {savingId === u.id && !active ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Icon size={12} />
                      )}
                      {r.label}
                    </button>
                  )
                })}
              </div>

              {savedId === u.id && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-green-400">
                  <CheckCircle2 size={12} />
                  Role updated
                </div>
              )}
              {isSelf && (
                <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <ShieldCheck size={11} />
                  You can&apos;t remove your own super admin access.
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
