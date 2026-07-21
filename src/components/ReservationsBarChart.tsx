import { useState } from 'react'
import './ReservationsBarChart.css'

interface DayCount {
  date: string
  count: number
}

const WIDTH = 720
const HEIGHT = 220
const PADDING_LEFT = 32
const PADDING_BOTTOM = 24
const PADDING_TOP = 12

export function ReservationsBarChart({ data }: { data: DayCount[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [tableView, setTableView] = useState(false)

  const max = Math.max(1, ...data.map((d) => d.count))
  const plotWidth = WIDTH - PADDING_LEFT
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM
  const barGap = 2
  const barWidth = data.length > 0 ? plotWidth / data.length - barGap : 0

  const gridValues = [0, Math.ceil(max / 2), max]

  function yFor(count: number) {
    return PADDING_TOP + plotHeight - (count / max) * plotHeight
  }

  if (tableView) {
    return (
      <div className="reservations-chart">
        <button className="chart-toggle" onClick={() => setTableView(false)}>
          Ver como gráfico
        </button>
        <table className="chart-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Reservas</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.date}>
                <td>{d.date}</td>
                <td>{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="reservations-chart">
      <button className="chart-toggle" onClick={() => setTableView(true)}>
        Ver como tabla
      </button>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="chart-svg"
        role="img"
        aria-label="Reservas por día"
      >
        {gridValues.map((v, i) => (
          <g key={i}>
            <line
              x1={PADDING_LEFT}
              x2={WIDTH}
              y1={yFor(v)}
              y2={yFor(v)}
              className="chart-gridline"
            />
            <text x={0} y={yFor(v) + 4} className="chart-axis-label">
              {v}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = PADDING_LEFT + i * (barWidth + barGap)
          const y = yFor(d.count)
          const barHeight = PADDING_TOP + plotHeight - y
          const showLabel =
            i === 0 || i === data.length - 1 || i % 5 === 0

          return (
            <g key={d.date}>
              <rect
                x={x}
                y={y}
                width={Math.max(barWidth, 1)}
                height={Math.max(barHeight, 0)}
                rx={2}
                className="chart-bar"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
              {showLabel && (
                <text
                  x={x + barWidth / 2}
                  y={HEIGHT - 6}
                  className="chart-axis-label chart-axis-label-x"
                >
                  {d.date.slice(5)}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {hoverIndex !== null && (
        <div className="chart-tooltip">
          <strong>{data[hoverIndex].date}</strong>
          <div>{data[hoverIndex].count} reservas</div>
        </div>
      )}
    </div>
  )
}
