/**
 * Wraps page content so React Bits Aurora background stays visible behind glass UI.
 */
export default function PageShell({ children, className = "" }) {
  return (
    <div className={`relative z-10 min-h-screen ${className}`}>
      {children}
    </div>
  );
}
