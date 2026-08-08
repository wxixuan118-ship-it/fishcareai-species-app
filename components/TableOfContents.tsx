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
      <h4>Contents</h4>
      {items.map((item) => (
        <a key={item.id} href={`#${item.id}`}>
          {item.label}
        </a>
      ))}
    </div>
  )
}
