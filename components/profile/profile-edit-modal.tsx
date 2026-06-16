'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Check, MapPin, User, FileText, Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const avatarPresets = [
  '/images/avatars/avatar-1.png',
  '/images/avatars/avatar-2.png',
  '/images/avatars/avatar-3.png',
  '/images/avatars/avatar-4.png',
  '/images/avatars/avatar-5.png',
  '/images/avatars/avatar-6.png',
]

export interface ProfileEditValues {
  name: string
  location: string
  bio: string
  image: string
}

export function ProfileEditModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: ProfileEditValues
  onClose: () => void
  onSaved: (values: ProfileEditValues) => void
}) {
  const [name, setName] = useState(initial.name)
  const [location, setLocation] = useState(initial.location)
  const [bio, setBio] = useState(initial.bio)
  const [image, setImage] = useState(initial.image || avatarPresets[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setError(null)
    const values: ProfileEditValues = {
      name: name.trim(),
      location: location.trim(),
      bio: bio.trim(),
      image,
    }
    const { error: updateError } = await authClient.updateUser(values)
    setSaving(false)
    if (updateError) {
      setError(updateError.message ?? 'Failed to save changes')
      return
    }
    onSaved(values)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl bg-[var(--surface-1)] border-t border-white/10 p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl glass flex items-center justify-center"
            aria-label="Close"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Avatar picker */}
        <p className="text-xs font-bold text-white mb-2">Avatar</p>
        <div className="grid grid-cols-6 gap-2 mb-5">
          {avatarPresets.map((preset) => (
            <button
              key={preset}
              onClick={() => setImage(preset)}
              className={cn(
                'relative aspect-square rounded-xl overflow-hidden border-2 transition-all',
                image === preset ? 'border-[var(--blue)] glow-blue' : 'border-transparent opacity-70'
              )}
              aria-label="Select avatar"
            >
              <Image src={preset} alt="Avatar option" width={56} height={56} className="object-cover w-full h-full" />
              {image === preset && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--blue)]/30">
                  <Check size={16} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Name */}
        <label className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
          <User size={13} /> Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your display name"
          className="w-full mb-4 px-3 py-3 rounded-xl bg-[var(--surface-3)] border border-white/5 text-sm text-white placeholder:text-muted-foreground/60 outline-none focus:border-[var(--blue)]/40"
        />

        {/* Location */}
        <label className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
          <MapPin size={13} /> Location
        </label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, Country"
          className="w-full mb-4 px-3 py-3 rounded-xl bg-[var(--surface-3)] border border-white/5 text-sm text-white placeholder:text-muted-foreground/60 outline-none focus:border-[var(--blue)]/40"
        />

        {/* Bio */}
        <label className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
          <FileText size={13} /> Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell others about yourself"
          rows={3}
          className="w-full mb-4 px-3 py-3 rounded-xl bg-[var(--surface-3)] border border-white/5 text-sm text-white placeholder:text-muted-foreground/60 outline-none focus:border-[var(--blue)]/40 resize-none"
        />

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-[var(--blue)] text-[#050505] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
