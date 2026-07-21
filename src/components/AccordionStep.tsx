import type { ReactNode } from 'react'
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon } from './icons'
import './AccordionStep.css'

interface AccordionStepProps {
  index: number
  title: string
  icon?: ReactNode
  summary?: string
  isOpen: boolean
  isDone: boolean
  onReopen?: () => void
  onBack?: () => void
  children: ReactNode
}

export function AccordionStep({
  index,
  title,
  icon,
  summary,
  isOpen,
  isDone,
  onReopen,
  onBack,
  children,
}: AccordionStepProps) {
  const canReopen = isDone && !isOpen

  return (
    <div
      className={`accordion-step ${isOpen ? 'accordion-step--open' : ''} ${
        isDone ? 'accordion-step--done' : ''
      }`}
    >
      <button
        type="button"
        className="accordion-step-header"
        onClick={canReopen ? onReopen : undefined}
        aria-expanded={isOpen}
      >
        <span className="accordion-step-badge">{isDone && !isOpen ? <CheckIcon /> : index + 1}</span>
        {icon && <span className="accordion-step-icon">{icon}</span>}
        <span className="accordion-step-heading">
          <span className="accordion-step-title">{title}</span>
          {!isOpen && summary && <span className="accordion-step-summary">{summary}</span>}
        </span>
        {canReopen && <ChevronDownIcon className="accordion-step-chevron" />}
      </button>

      <div className="accordion-step-body">
        <div className="accordion-step-body-inner" inert={!isOpen}>
          {onBack && (
            <button type="button" className="accordion-step-back" onClick={onBack}>
              <ChevronLeftIcon /> Volver
            </button>
          )}
          <div className="accordion-step-content">{children}</div>
        </div>
      </div>
    </div>
  )
}
