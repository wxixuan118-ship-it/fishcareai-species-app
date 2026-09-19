interface TocItem {
  id: string
  label: string
}

interface Props {
  items: TocItem[]
}

export default function TableOfContents({ items }: Props) {
  return (
    <div className="toc-card">
      <div className="toc-title">Contents</div>
      {items.map((item) => (
        <a key={item.id} href={`#${item.id}`}>
          {item.label}
        </a>
      ))}
    </div>
  )
}
