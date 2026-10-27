import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ActionCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string
  description: string
  tag?: ReactNode
  active?: boolean
}

function ActionCard({
  title,
  description,
  tag,
  active = false,
  className = '',
  ...buttonProps
}: ActionCardProps) {
  const classes = [
    'action-card',
    active ? 'active' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} type="button" {...buttonProps}>
      <h3 className="action-title">{title}</h3>
      <p className="action-desc">{description}</p>
      {tag ? <span className="action-tag">{tag}</span> : null}
    </button>
  )
}

export default ActionCard