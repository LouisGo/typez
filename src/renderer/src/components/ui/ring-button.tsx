import { Button, ButtonProps } from '@renderer/components/ui/button'

export function RingButton({ children, ...props }: ButtonProps) {
  return (
    <Button
      className="ring-offset-background transition-all duration-300 hover:ring-2 hover:ring-primary/90 hover:ring-offset-2"
      {...props}
    >
      {children}
    </Button>
  )
}
