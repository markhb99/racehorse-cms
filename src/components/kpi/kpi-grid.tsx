import { KpiCard, type KpiCardProps } from './kpi-card'

interface KpiGridProps {
  cards: KpiCardProps[]
}

export function KpiGrid({ cards }: KpiGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <KpiCard key={i} {...card} />
      ))}
    </div>
  )
}
