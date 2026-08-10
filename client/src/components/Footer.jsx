export default function Footer() {
  return (
    <footer className="netflix-footer">
      <div className="footer-content">
        <div className="social-links">
          <i className="fab fa-facebook-f" />
          <i className="fab fa-instagram" />
          <i className="fab fa-twitter" />
          <i className="fab fa-youtube" />
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <a href="#">Audio and Subtitles</a>
            <a href="#">Media Center</a>
            <a href="#">Privacy</a>
            <a href="#">Contact Us</a>
          </div>
          <div className="footer-column">
            <a href="#">Audio Description</a>
            <a href="#">Investor Relations</a>
            <a href="#">Legal Notices</a>
            <a href="#">Help Center</a>
          </div>
          <div className="footer-column">
            <a href="#">Gift Cards</a>
            <a href="#">Terms of Use</a>
            <a href="#">Corporate Information</a>
          </div>
        </div>
        <div className="disclaimer">
          <i className="fas fa-code"></i> This website is built for <strong>portfolio / educational purposes only</strong>.
          It is not monetized and is not intended for commercial use. All movie data and posters are provided by TMDB.
        </div>
        <p className="copyright">&copy; 2026 KFLIX - CrochsDevs, Inc.</p>
      </div>
    </footer>
  );
}