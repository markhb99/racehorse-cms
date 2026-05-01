import type { HorseWithStats } from '@/lib/types'
import { HorseCard } from './horse-card'

interface HorseGridProps {
  horses: HorseWithStats[]
  onEdit: (horse: HorseWithStats) => void
  onArchive: (horse: HorseWithStats) => void
  onDelete: (horse: HorseWithStats) => void
}

export function HorseGrid({ horses, onEdit, onArchive, onDelete }: HorseGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {horses.map((horse) => (
        <HorseCard
          key={horse.id}
          horse={horse}
          onEdit={onEdit}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
