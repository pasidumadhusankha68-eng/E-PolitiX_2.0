const formatValue = (val) => val || 'TBA'

export default function BranchCard({ name, al2027, al2028, href = '#', loading = false }) {
  const nameParts = name.split(' - ')
  const nameWithBreak = nameParts.length === 2
    ? `${nameParts[0]} -<br />${nameParts[1]}`
    : name

  if (loading) {
    return (
      <div className="branch-card branch-card--loading" aria-hidden="true">
        <div className="skeleton skeleton-name" />
        <div className="skeleton skeleton-schedule">
          <div className="skeleton skeleton-heading" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
        </div>
        <div className="skeleton skeleton-schedule">
          <div className="skeleton skeleton-heading" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
        </div>
      </div>
    )
  }

  return (
    <a
      href={href}
      className="branch-card card-reveal"
      style={{ '--delay': '0.1s' }}
      aria-label={`View ${name} branch details`}
    >
      <h3 className="branch-name" dangerouslySetInnerHTML={{ __html: nameWithBreak }} />
      <div className="branch-schedule">
        <h4 className="schedule-heading">2027 A/L</h4>
        <p className="schedule-line">
          <span className="schedule-label">Date →</span>
          <span className="schedule-value">{formatValue(al2027?.date)}</span>
        </p>
        <p className="schedule-line">
          <span className="schedule-label">Time →</span>
          <span className="schedule-value">{formatValue(al2027?.time)}</span>
        </p>
      </div>
      <div className="branch-schedule">
        <h4 className="schedule-heading">2028 A/L</h4>
        <p className="schedule-line">
          <span className="schedule-label">Date →</span>
          <span className="schedule-value">{formatValue(al2028?.date)}</span>
        </p>
        <p className="schedule-line">
          <span className="schedule-label">Time →</span>
          <span className="schedule-value">{formatValue(al2028?.time)}</span>
        </p>
      </div>
    </a>
  )
}