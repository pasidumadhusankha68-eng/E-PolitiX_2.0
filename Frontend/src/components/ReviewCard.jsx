export default function ReviewCard({ text, name, batch }) {
  const initial = (name || '').charAt(0).toUpperCase()

  return (
    <article className="review-card">
      <span className="quote-mark">“</span>
      <p className="review-text">{text}</p>
      <hr className="review-divider" />
      <footer className="review-footer">
        <div className="review-avatar">{initial}</div>
        <div className="review-meta">
          <div className="review-name">{name}</div>
          <div className="review-batch">{batch}</div>
        </div>
      </footer>
    </article>
  )
}
