export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="page__head">
      <div>
        {eyebrow && <p className="page__eyebrow">{eyebrow}</p>}
        <h1 className="page__title">{title}</h1>
        {subtitle && <p className="page__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page__actions">{actions}</div>}
    </header>
  )
}
