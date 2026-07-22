export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <section className="empty">
      {Icon && (
        <span className="empty__mark" aria-hidden="true">
          <Icon />
        </span>
      )}
      <h2 className="empty__title">{title}</h2>
      {text && <p className="empty__text">{text}</p>}
      {action && <div className="empty__action">{action}</div>}
    </section>
  )
}
