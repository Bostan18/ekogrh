import { useEffect, useRef } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { chartColors, doughnutColors, barOptions } from "../../utils/chartConfig";
import ChartCard from "./ChartCard";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
);

export function EmployeeDoughnut({ typeCounts }) {
    if (!typeCounts || typeCounts.length === 0) return null;

    const data = {
        labels: typeCounts.map((t) => t.label),
        datasets: [
            {
                data: typeCounts.map((t) => t.count),
                backgroundColor: doughnutColors.slice(0, typeCounts.length),
                borderWidth: 1,
                borderColor: "#ffffff",
            },
        ],
    };

    return (
        <ChartCard title="Répartition des employés" linkText="Voir" linkTo="/employes">
            <div className="h-[200px] flex items-center justify-center">
                <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
        </ChartCard>
    );
}

export function MonthlyBar({ monthlyData }) {
    if (!monthlyData || monthlyData.length === 0) return null;

    const data = {
        labels: monthlyData.map((m) => m.label),
        datasets: [
            {
                label: "Bulletins",
                data: monthlyData.map((m) => m.count),
                backgroundColor: chartColors.map((c) => c.bg),
                borderColor: chartColors.map((c) => c.border),
                borderWidth: 1,
                borderRadius: 3,
            },
        ],
    };

    return (
        <ChartCard title="Bulletins du semestre" linkText="Voir tout" linkTo="/bulletins">
            <div className="h-[200px]">
                <Bar data={data} options={barOptions({ stacked: false })} />
            </div>
        </ChartCard>
    );
}
