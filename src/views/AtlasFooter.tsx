export function AtlasFooter() {
  return (
    <footer className="atlas-footer">
      <div className="footer-legend">
        <div>
          <strong>STATUS LEGEND</strong>
          <span>
            <i className="status-dot" />
            Healthy / connected
          </span>
          <span className="text-danger">
            <i className="status-dot" />
            Offline / critical
          </span>
          <span className="text-warning">
            <i className="status-dot" />
            Attention / degraded
          </span>
        </div>
        <p>
          LOCAL REFERENCE DATA / Session-only changes reset on reload. No
          production systems are connected.
        </p>
      </div>
      <div className="footer-spec">
        <strong>INFRASTRUCTURE / NETWORK / CONTROL</strong>
        <span>REACT · RADIX THEMES · MVVM</span>
        <span>ENGINEERED FOR CLARITY. BUILT TO EXTEND.</span>
      </div>
      <div className="footer-signature">
        <strong>LINIE / OPERATIONS ATLAS</strong>
        <span>LN-NET-001 · REV A · TEMPLATE v{__APP_VERSION__}</span>
        <b>ALL SYSTEMS, IN PERSPECTIVE.</b>
      </div>
    </footer>
  );
}
