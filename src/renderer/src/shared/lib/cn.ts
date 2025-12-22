type CNInput = string | undefined | null | false

export function cn(...inputs: CNInput[]): string {
  return inputs.filter(Boolean).join(' ')
}
