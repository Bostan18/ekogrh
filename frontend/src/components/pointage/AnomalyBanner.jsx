export default function AnomalyBanner({ anomalies, date }) {
    const todayAnomalies = anomalies.filter((a) => a.date === date).length;

    if (todayAnomalies > 0) {
        return (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                ⚠ {todayAnomalies} anomalie(s) détectée(s) aujourd'hui (0h
                présentes, doubles pointages...)
            </div>
        );
    }

    if (anomalies.length > 0) {
        return (
            <div className="mb-4 p-3 bg-gold-50 border border-gold-200 rounded-lg text-sm text-gold-700">
                {anomalies.length} anomalie(s) détectée(s) au total ce mois-ci.
            </div>
        );
    }

    return null;
}
