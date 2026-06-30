import { Link } from "react-router-dom";

function KpiCard({ label, value, Icon, color, to }) {
    const content = (
        <>
            <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${color}`}>
                    <Icon className="w-5 h-5" />
                </span>
                {to && (
                    <svg className="w-4 h-4 text-sand-300 group-hover:text-forest-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                )}
            </div>
            <p className="text-2xl font-bold text-ink leading-none mb-1">{value}</p>
            <p className="text-body-sm text-ink-secondary">{label}</p>
        </>
    );

    return to ? (
        <Link to={to} className="group card p-5 hover:shadow-elevation-2 transition-shadow duration-fast">
            {content}
        </Link>
    ) : (
        <div className="card p-5">{content}</div>
    );
}

export default function KpiCards({ kpis }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {kpis.map((kpi) => (
                <KpiCard key={kpi.label} {...kpi} />
            ))}
        </div>
    );
}
