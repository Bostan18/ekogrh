export const MOIS_NOMS_1 = [
    "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export const MOIS_NOMS_0 = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export const TYPE_LABELS = {
    cdi: "CDI Permanent",
    cdd: "CDD",
    journalier: "Journalier",
    moo: "MOO",
    stagiaire: "Stagiaire",
};

export const TYPE_CONTRAT_OPTIONS = [
    { value: "cdi", label: "CDI" },
    { value: "cdd", label: "CDD" },
    { value: "journalier", label: "Journalier" },
    { value: "moo", label: "MOO" },
    { value: "stagiaire", label: "Stagiaire" },
];

export const STATUT_EMPLOYE_OPTIONS = [
    { value: "actif", label: "Actif" },
    { value: "inactif", label: "Inactif" },
    { value: "conge", label: "Congé" },
];

export const typeColors = {
    cdi: "bg-blue-100 text-blue-700",
    cdd: "bg-purple-100 text-purple-700",
    journalier: "bg-gold-100 text-gold-700",
    moo: "bg-orange-100 text-orange-700",
    stagiaire: "bg-teal-100 text-teal-700",
};

export const statutColors = {
    actif: "bg-green-100 text-green-700",
    inactif: "bg-red-100 text-red-700",
    conge: "bg-gold-100 text-gold-700",
};

export const modeColors = {
    especes: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    mtn: "bg-yellow-100 text-yellow-700",
    moov: "bg-blue-100 text-blue-700",
    virement: "bg-purple-100 text-purple-700",
    cheque: "bg-slate-100 text-slate-700",
};

export const STATUT_CONGE_COLORS = {
    demande: "bg-gold-100 text-gold-700",
    approuve: "bg-green-100 text-green-700",
    refuse: "bg-red-100 text-red-700",
    annule: "bg-gray-100 text-gray-600",
};

export function today() {
    return new Date().toISOString().slice(0, 10);
}

export function currentMonth() {
    return new Date().getMonth() + 1;
}

export function currentYear() {
    return new Date().getFullYear();
}
