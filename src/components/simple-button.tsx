import type { ButtonHTMLAttributes } from 'react'

type ButtonSize = 'small' | 'medium' | 'large'
type ButtonVariant = 'primary' | 'secondary'

type SimpleButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'size'
> & {
  size?: ButtonSize
  variant?: ButtonVariant
  fullWidth?: boolean
  className?: string
}

function SimpleButton({
  children,
  className = '',
  fullWidth = false,
  size = 'medium',
  type = 'button',
  variant = 'primary',
  ...buttonProps
}: SimpleButtonProps) {
  const classes = [
    'simple-button',
    `simple-button--${size}`,
    `simple-button--${variant}`,
    fullWidth ? 'simple-button--full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} type={type} {...buttonProps}>
      {children}
    </button>
  )
}

export default SimpleButton