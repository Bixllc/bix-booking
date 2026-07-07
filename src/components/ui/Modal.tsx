import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-md rounded-card bg-surface p-6 animate-scrIn shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lead text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="text-faint hover:text-muted transition" aria-label="Close">
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
