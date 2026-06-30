import { Link } from "react-router-dom";

export default function PointageHeader() {
    return (
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-page-title text-ink">Pointage — Journalier</h2>
            <Link
                to="/pointage-semaine"
                className="px-4 py-2 bg-sand-100 hover:bg-sand-200 text-sand-700 text-sm font-medium rounded-lg transition-colors"
            >
                Vue semaine →
            </Link>
        </div>
    );
}
