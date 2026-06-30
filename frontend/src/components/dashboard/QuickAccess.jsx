import { Link } from "react-router-dom";
import { ClipboardIcon, UsersIcon, DocumentIcon, UmbrellaIcon } from "../Icon";

const links = [
    { label: "Pointage du jour", to: "/pointage", Icon: ClipboardIcon },
    { label: "Liste des employés", to: "/employes", Icon: UsersIcon },
    { label: "Bulletins de paie", to: "/bulletins", Icon: DocumentIcon },
    { label: "Congés", to: "/conges", Icon: UmbrellaIcon },
];

export default function QuickAccess() {
    return (
        <div className="card-padded">
            <h3 className="text-section-title text-ink mb-4">Accès rapides</h3>
            <div className="grid grid-cols-2 gap-3">
                {links.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center gap-2.5 p-3 rounded-btn bg-sand-50 hover:bg-forest-50 text-body-sm font-semibold text-ink-secondary hover:text-forest-600 transition-colors duration-fast"
                    >
                        <item.Icon className="w-4 h-4" />
                        {item.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
