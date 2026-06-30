/* ─────────────────────────────────────────────────────────────
   Chart.js config — Design system EKOGRH (v4)
   Adapté du thème Connect Plus / Nordic UI
   ───────────────────────────────────────────────────────────── */

// ── Palettes ─────────────────────────────────────────────────

export const chartPalette = {
    forest:  { bg: "rgba(31, 143, 83, 0.2)",  border: "rgba(31, 143, 83, 1)" },
    gold:    { bg: "rgba(200, 154, 29, 0.2)", border: "rgba(200, 154, 29, 1)" },
    teal:    { bg: "rgba(108, 201, 150, 0.2)", border: "rgba(108, 201, 150, 1)" },
    sand:    { bg: "rgba(126, 122, 110, 0.2)", border: "rgba(126, 122, 110, 1)" },
    purple:  { bg: "rgba(208, 166, 52, 0.2)", border: "rgba(208, 166, 52, 1)" },
    danger:  { bg: "rgba(252, 90, 90, 0.2)",  border: "rgba(252, 90, 90, 1)" },
};

export const chartColors = [
    chartPalette.forest,
    chartPalette.gold,
    chartPalette.teal,
    chartPalette.sand,
    chartPalette.purple,
    chartPalette.danger,
];

// Doughnut / Pie (alpha .5)
export const doughnutColors = [
    "rgba(31, 143, 83, 0.5)",
    "rgba(200, 154, 29, 0.5)",
    "rgba(108, 201, 150, 0.5)",
    "rgba(126, 122, 110, 0.5)",
    "rgba(208, 166, 52, 0.5)",
    "rgba(252, 90, 90, 0.5)",
];

// Dashboard specific tokens
export const dashboardColors = {
    primary: "#1f8f53",
    info:    "#3ba973",
    success: "#44ce42",
    danger:  "#fc5a5a",
    grid:    "#f3f1eb",
    gridDark: "#181824",
    tooltip: "#157a45",
    tooltipBar: "#000000",
};

// ── Gradient helpers ─────────────────────────────────────────

export function createGradient(ctx, height, colorStop, endColor) {
    const grad = ctx.createLinearGradient(0, 0, 0, height || 300);
    grad.addColorStop(0, colorStop || "rgba(31, 143, 83, 0.3)");
    grad.addColorStop(1, endColor || "rgba(255, 255, 255, 0.27)");
    return grad;
}

export function createPrimaryGradient(ctx, height) {
    return createGradient(ctx, height, "rgba(31, 143, 83, 0.3)");
}

export function createPrimaryGradientDark(ctx, height) {
    return createGradient(ctx, height, "rgba(31, 143, 83, 0.3)", "rgba(24, 24, 36, 0.27)");
}

export function createInfoGradient(ctx, height) {
    return createGradient(ctx, height, "rgba(59, 169, 115, 1)");
}

// ── Options partagées (Chart.js v4) ─────────────────────────

const defaultFont = { family: "'Nunito', sans-serif", size: 14, color: "#a7afb7" };

export function lineOptions({ height, tension = 0, tooltipColor } = {}) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: tooltipColor || dashboardColors.tooltip,
            },
        },
        scales: {
            x: { display: false, grid: { display: false, drawTicks: false } },
            y: { display: false, grid: { display: false, drawTicks: false } },
        },
        elements: {
            point: { radius: 0 },
            line: { tension },
        },
    };
}

export function barOptions({ stacked = false, tooltipColor, gridColor } = {}) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: tooltipColor || dashboardColors.tooltipBar,
            },
        },
        scales: {
            x: {
                stacked,
                grid: { display: false, drawTicks: false },
                ticks: { color: defaultFont.color, font: { size: 14, family: defaultFont.family } },
            },
            y: {
                stacked,
                grid: {
                    display: true,
                    color: gridColor || dashboardColors.grid,
                    drawTicks: false,
                },
                ticks: {
                    color: defaultFont.color,
                    font: { size: 14, family: defaultFont.family },
                    callback(v) { return v + "k"; },
                },
            },
        },
    };
}

export const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        animateScale: true,
        animateRotate: true,
    },
};

export function predictionOptions(tension = 0.4) {
    return {
        elements: {
            point: { radius: 0 },
            line: { tension },
        },
    };
}

// ── Légende custom (HTML) ────────────────────────────────────

export function renderLegend(containerId, labels, colors) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const ul = document.createElement("ul");
    ul.className = "flex items-center justify-end gap-4";
    labels.forEach((label, i) => {
        const li = document.createElement("li");
        li.className = "flex items-center list-none";
        const box = document.createElement("span");
        box.className = "w-3 h-3 rounded-full inline-block mr-2.5";
        box.style.backgroundColor = colors[i % colors.length];
        li.appendChild(box);
        li.appendChild(document.createTextNode(label));
        ul.appendChild(li);
    });
    container.innerHTML = "";
    container.appendChild(ul);
}
