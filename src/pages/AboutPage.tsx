const logoHref = `${import.meta.env.BASE_URL}logo-animated-loop.svg`;
const avatarHref = 'https://avatars.githubusercontent.com/u/373278';

export function AboutPage() {
  return (
    <div className="about-page">
      <section className="card about-card" aria-labelledby="about-title">
        <div className="card-body about-card-body">
          <div className="about-hero">
            <div className="about-logo-lockup">
              <img className="about-app-logo" src={logoHref} alt="" width="180" height="180" />
              <a
                className="about-avatar-link"
                href="https://github.com/manix84"
                rel="noopener noreferrer"
                target="_blank"
                aria-label="Open Rob's GitHub profile"
              >
                <img className="about-avatar-badge" src={avatarHref} alt="" width="64" height="64" />
              </a>
            </div>

            <div className="about-heading">
              <h2 id="about-title" className="title title-md">Smart Shopping List</h2>
              <p className="subtitle">A free, privacy-minded grocery route planner.</p>
            </div>
          </div>

          <dl className="about-spec-list">
            <div>
              <dt>Built by</dt>
              <dd>Rob</dd>
            </div>
            <div>
              <dt>Cost</dt>
              <dd>Free</dd>
            </div>
            <div>
              <dt>Privacy</dt>
              <dd>No adverts, no tracking, local-first storage</dd>
            </div>
            <div>
              <dt>Purpose</dt>
              <dd>Turn a rough shopping list into an ordered route through the store</dd>
            </div>
          </dl>

          <div className="about-copy stack">
            <p>
              Smart Shopping List exists to make a normal supermarket trip less fiddly. Paste or type what you need,
              choose the store layout profile that matches where you shop, and the app groups your list into a route you
              can tick off as you go.
            </p>
            <p>
              This is a free product. There are no adverts and no analytics trackers. The app is designed to be useful
              without turning your shopping habits into somebody else&apos;s dataset.
            </p>
            <p>
              I&apos;m Rob, an experienced software engineer who likes building practical tools that respect the people
              using them. This project is deliberately small, direct, and focused on doing one everyday job well.
            </p>
          </div>

          <div className="about-actions">
            <a className="button button-primary" href="https://github.com/manix84/shopping-list" rel="noopener noreferrer" target="_blank">
              View source
            </a>
            <a className="button" href="https://github.com/sponsors/manix84" rel="noopener noreferrer" target="_blank">
              Sponsor Rob
            </a>
          </div>

          <p className="about-footnote">
            Sponsorship helps keep this app independent, maintained, and free to use.
          </p>
        </div>
      </section>
    </div>
  );
}
