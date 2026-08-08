interface Props {
  variant?: 'default' | 'warn' | 'ok'
  children: React.ReactNode
}

export default function CalloutBox({ variant = 'default', children }: Props) {
  const cls = variant === 'warn' ? 'callout callout-warn'
            : variant === 'ok'   ? 'callout callout-ok'
            : 'callout'
  return <div className={cls}>{children}</div>
}
