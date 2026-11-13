// Home page hero, built from the product's own pieces: a work sample task, the 1-5 scoring row and two blind raters.
export function HeroVisual() {
  const levels = ["Far below", "Below", "Day-one standard", "Above", "Well above"];
  return (
    <div className="hero-visual" role="img" aria-label="A work sample task card, a 1 to 5 scoring row with 3 marked as the day-one standard, and two blind raters who both scored 4.">
      <div className="hero-card hero-task">
        <p className="hero-label">Work sample · 25 min</p>
        <h3>Design a 30-minute training module</h3>
        <p>
          Twelve new schedulers know the policy but freeze when two urgent requests arrive at once. Outline two
          objectives, one practice activity and a quick check.
        </p>
        <span className="hero-chip">From the job task: design training programs</span>
      </div>
      <div className="hero-card hero-score">
        <p className="hero-label">Practice matches the problem · Critical</p>
        <ol>
          {levels.map((l, i) => (
            <li key={l} className={i === 2 ? "is-standard" : i === 3 ? "is-picked" : undefined}>
              <strong>{i + 1}</strong>
              <span>{l}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="hero-card hero-raters">
        <span>
          <b>A</b> Rater A · 4
        </span>
        <span>
          <b>B</b> Rater B · 4
        </span>
        <p>Scored blind, without names</p>
      </div>
    </div>
  );
}
