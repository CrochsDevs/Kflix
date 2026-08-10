export default function NotFoundPage() {
  return (
    <div className="main-layout">
      <main className="main-content">
        <div className="no-results">
          <i className="fas fa-exclamation-triangle" />
          <h3>Page not found</h3>
          <p>The page you're looking for doesn't exist.</p>
          <a href="/" className="clear-filters-btn" style={{ display: 'inline-block', width: 'auto', padding: '10px 30px', marginTop: 20, textDecoration: 'none' }}>
            <i className="fas fa-home" /> Back to Home
          </a>
        </div>
      </main>
    </div>
  );
}
