export default function ChartCard({ title, linkText, linkTo, children }) {
    return (
        <div className="card-padded">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-section-title text-ink">{title}</h3>
                {linkText && (
                    <a
                        href={linkTo}
                        className="text-body-sm font-semibold text-forest-500 hover:text-forest-600"
                    >
                        {linkText} →
                    </a>
                )}
            </div>
            {children}
        </div>
    );
}
