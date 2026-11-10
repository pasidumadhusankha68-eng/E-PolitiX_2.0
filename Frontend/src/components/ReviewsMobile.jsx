export default function ReviewsMobile({ reviews }) {
  return (
    <div className="reviews-mobile-only">
      <div className="rm-viewport">
        <div className="rm-track">
          {[0, 1].map((setIndex) => (
            <div key={setIndex} className="rm-set"
                 aria-hidden={setIndex === 1 ? 'true' : undefined}>
              {reviews.map((r, i) => (
                <article key={i} className="rm-card"
                         tabIndex={setIndex === 1 ? -1 : undefined}>
                  <span className="rm-quote" aria-hidden="true">“</span>
                  <p className="rm-text">{r.text}</p>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
