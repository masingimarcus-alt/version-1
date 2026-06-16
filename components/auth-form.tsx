'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { authClient } from '@/lib/auth-client'
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Map Better Auth error codes to user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  USER_ALREADY_EXISTS: 'An account with this email already exists.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'An account with this email already exists. Please use a different email.',
  EMAIL_ALREADY_IN_USE: 'This email is already in use. Try signing in instead.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
  PASSWORD_TOO_LONG: 'Password is too long. Please use fewer than 128 characters.',
  INVALID_EMAIL_OR_PASSWORD: 'Incorrect email or password.',
  USER_NOT_FOUND: 'No account found with this email.',
  EMAIL_NOT_VERIFIED: 'Please verify your email before signing in.',
  RATE_LIMIT_EXCEEDED: 'Too many attempts. Please wait a moment and try again.',
  EMAIL_PASSWORD_SIGN_UP_DISABLED: 'Sign-up is currently disabled.',
}

function humanizeError(error: { code?: string; message?: string; status?: number } | null): string {
  if (!error) return 'Something went wrong. Please try again.'
  // Code-based lookup first (most reliable)
  if (error.code && ERROR_MESSAGES[error.code]) return ERROR_MESSAGES[error.code]
  // message-based lookup (Better Auth sometimes sends the code as the message)
  if (error.message && ERROR_MESSAGES[error.message]) return ERROR_MESSAGES[error.message]
  // If message is a readable sentence, use it
  if (error.message && error.message.length < 150 && !error.message.match(/^[A-Z_]+$/)) {
    return error.message
  }
  // HTTP status fallbacks
  if (error.status === 422 || error.status === 409) return 'An account with this email already exists.'
  if (error.status === 401) return 'Incorrect email or password.'
  if (error.status === 429) return 'Too many attempts. Please wait a moment and try again.'
  if (error.status && error.status >= 500) return 'A server error occurred. Please try again shortly.'
  return 'Something went wrong. Please try again.'
}

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Client-side validation before making a request
    if (isSignUp && name.trim().length < 2) {
      setError('Username must be at least 2 characters.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const result = isSignUp
        ? await authClient.signUp.email({ email, password, name: name.trim() })
        : await authClient.signIn.email({ email, password })

      setLoading(false)

      if (result.error) {
        setError(humanizeError(result.error))
        return
      }

      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      setLoading(false)
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      setError(message.length < 150 ? message : 'An unexpected error occurred. Please try again.')
    }
  }

  return (
    <main className="min-h-svh bg-[#050505] flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Image
          src="/images/logo.jpg"
          alt="E-Competition"
          width={200}
          height={50}
          className="h-12 w-auto object-contain"
        />
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm glass rounded-3xl p-6"
      >
        <div className="mb-6 text-center">
          <h1 className="text-xl font-black text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSignUp
              ? 'Join the gaming community'
              : 'Sign in to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null) }}
                required
                autoComplete="name"
                className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none border border-transparent focus:border-[var(--blue)]/50 transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null) }}
              required
              autoComplete="email"
              className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none border border-transparent focus:border-[var(--blue)]/50 transition-colors"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              required
              minLength={8}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="w-full glass rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none border border-transparent focus:border-[var(--blue)]/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center" role="alert">
              {error}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2',
              loading
                ? 'bg-[var(--surface-3)] text-muted-foreground cursor-not-allowed'
                : 'bg-[var(--blue)] text-[#050505] glow-blue'
            )}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Please wait...
              </>
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            className="text-[var(--blue)] font-semibold hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
