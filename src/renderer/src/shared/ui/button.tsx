import * as React from 'react'

import { cn } from '@renderer/shared/lib/cn'

type ButtonVariant = 'default' | 'secondary' | 'ghost'
type ButtonSize = 'default' | 'sm' | 'lg'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

function getButtonClassName(variant: ButtonVariant, size: ButtonSize): string {
  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'

  const variantClass =
    variant === 'secondary'
      ? 'bg-secondary text-secondary-foreground hover:opacity-90'
      : variant === 'ghost'
        ? 'hover:bg-accent hover:text-accent-foreground'
        : 'bg-primary text-primary-foreground hover:opacity-90'

  const sizeClass =
    size === 'sm'
      ? 'h-8 rounded-md px-3 text-xs'
      : size === 'lg'
        ? 'h-10 rounded-md px-8'
        : 'h-9 px-4 py-2'

  return cn(base, variantClass, sizeClass)
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button ref={ref} className={cn(getButtonClassName(variant, size), className)} {...props} />
    )
  }
)
Button.displayName = 'Button'
