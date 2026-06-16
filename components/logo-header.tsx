'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Settings, LogOut, UserCircle2, LogIn } from 'lucide-react'
import { useSession, signOut } from '@/lib/auth-client'
import { NotificationBell } from '@/components/notification-bell'

export function LogoHeader() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <div className="px-4 pt-12 pb-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative h-10 w-44"
        >
          <Image
            src="/images/logo.jpg"
            alt="E-Competition"
            fill
            className="object-contain object-left"
            priority
          />
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notification bell — always visible when logged in */}
          {session?.user && <NotificationBell />}

          {isPending ? (
            /* Skeleton placeholder while session loads */
            <div className="w-9 h-9 rounded-xl glass animate-pulse" />
          ) : session?.user ? (
            <>
              {/* Admin settings */}
              <Link href="/admin">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-xl glass flex items-center justify-center"
                  aria-label="Admin settings"
                >
                  <Settings size={18} className="text-muted-foreground" />
                </motion.button>
              </Link>

              {/* Profile */}
              <Link href="/profile">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-xl glass flex items-center justify-center"
                  aria-label="Profile"
                >
                  <UserCircle2 size={18} className="text-[var(--blue)]" />
                </motion.button>
              </Link>

              {/* Sign Out */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSignOut}
                className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center"
                aria-label="Sign out"
              >
                <LogOut size={16} className="text-red-400" />
              </motion.button>
            </>
          ) : (
            /* Not logged in */
            <Link href="/sign-in">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-[var(--blue)] text-[#050505] text-xs font-bold"
              >
                <LogIn size={14} />
                Sign In
              </motion.button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
