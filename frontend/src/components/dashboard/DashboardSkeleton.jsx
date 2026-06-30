export default function DashboardSkeleton() {
    return (
        <div>
            <h2 className="text-page-title text-ink mb-6">Tableau de bord</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="card p-5 animate-shimmer">
                        <div className="w-10 h-10 rounded-lg bg-sand-100 mb-3" />
                        <div className="h-7 bg-sand-100 rounded w-20 mb-1" />
                        <div className="h-4 bg-sand-50 rounded w-28" />
                    </div>
                ))}
            </div>
        </div>
    );
}
