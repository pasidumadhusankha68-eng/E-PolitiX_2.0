import { Link } from 'react-router-dom'

const ArrowIcon = () => (
  <svg
    className="arrow-icon"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

export default function LevelCard({ mark, title, description, href, featured = false }) {
  const isFeatured = featured

  return (
    <article
      className={`level-card card-reveal ${isFeatured ? 'featured' : ''}`}
      style={{ '--delay': isFeatured ? '0.3s' : '0.1s' }}
    >
      <div
        className={`level-mark ${isFeatured ? 'filled' : 'outline'}`}
        aria-hidden="true"
      >
        {mark}
      </div>
      <h3 className="level-title">{title}</h3>
      <p className="level-description">{description}</p>
      <Link to={href} className="level-link" aria-label={`View ${title} classes`}>
        View classes
        <ArrowIcon />
      </Link>
    </article>
  )
}