'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Trophy, ShoppingBag, Gamepad2, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/auth-client'

const navItems = [
  { href: '/',             icon: Home,        label: 'Home'    },
  { href: '/rental',       icon: Gamepad2,    label: 'Rental'  },
  { href: '/tournaments',  icon: Trophy,      label: 'Compete' },
  { href: '/marketplace',  icon: ShoppingBag, label: 'Market'  },
]

export function BottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as { role?: string } | undefined)?.role
  const isAdmin = role === 'admin' || role === 'super_admin'

  const items = isAdmin
    ? [...navItems, { href: '/admin/work', icon: Briefcase, label: 'Work' }]
    : navItems

  // Hide on auth pages
  if (pathname === '/sign-in' || pathname === '/sign-up') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--glass-border)] pb-safe">
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <motion.div
                className="flex flex-col items-center gap-1 py-1"
                whileTap={{ scale: 0.9 }}
              >
                <div
                  className={cn(
                    'relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200',
                    isActive
                      ? 'bg-[var(--blue-dim)] text-[var(--blue)]'
                      : 'text-muted-foreground'
                  )}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--blue)]"
                      style={{ boxShadow: '0 0 6px var(--blue)' }}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    isActive ? 'text-[var(--blue)]' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
