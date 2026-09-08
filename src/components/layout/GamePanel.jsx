/** Titled section wrapper for the settings sidebar. */
function GamePanel({ title, subtitle, children, className = '', testId }) {
    return (
        <section
            className={`shrink-0 rounded-xl border border-white/10 bg-black/45 p-3 sm:p-4 ${className}`}
            data-testid={testId}
        >
            {title && (
                <header className="mb-3 border-b border-white/10 pb-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white/55">{title}</h2>
                    {subtitle && (
                        <p className="mt-0.5 text-xs leading-snug text-white/40">{subtitle}</p>
                    )}
                </header>
            )}
            {children}
        </section>
    );
}

export default GamePanel;
