'use client'

import { toast } from 'sonner'
import { createElement } from 'react'
import { CheckCircle2 } from 'lucide-react'

/**
 * Shows a consistent green validation toast whenever an action completes.
 * Use this for every successful action (bookings, saves, submissions, etc.).
 */
export function successToast(message: string, description?: string) {
  return toast.success(message, {
    description,
    icon: createElement(CheckCircle2, { size: 18, color: '#22c55e' }),
    style: {
      background: 'rgba(16, 32, 20, 0.92)',
      border: '1px solid rgba(34, 197, 94, 0.45)',
      color: '#bbf7d0',
      backdropFilter: 'blur(8px)',
    },
  })
}
