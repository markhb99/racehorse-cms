'use client'

import { cn } from '@/lib/utils'
import { HORSE_COLORS } from '@/lib/constants'

interface HorseColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
}

export function HorseColorPicker({ value, onChange, className }: HorseColorPickerProps) {
  const handleHexInput = (raw: string) => {
    const hex = raw.startsWith('#') ? raw : `#${raw}`
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) onChange(hex)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-2">
        {HORSE_COLORS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={cn(
              'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              value === preset ? 'border-foreground scale-110' : 'border-transparent',
            )}
            style={{ backgroundColor: preset }}
            aria-label={`Select colour ${preset}`}
            aria-pressed={value === preset}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div
          className="h-7 w-7 flex-shrink-0 rounded-full border border-border"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          defaultValue={value}
          onChange={(e) => handleHexInput(e.target.value)}
          placeholder="#2563EB"
          maxLength={7}
          className="h-7 w-28 rounded-md border border-input bg-transparent px-2 text-xs font-mono outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Custom hex colour"
        />
      </div>
    </div>
  )
}
