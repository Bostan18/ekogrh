import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "./store/authStore";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EmployeList from "./pages/EmployeList";
import EmployeForm from "./pages/EmployeForm";
import EmployeDetail from "./pages/EmployeDetail";
import Pointage from "./pages/Pointage";
import PointageSemaine from "./pages/PointageSemaine";
import BulletinList from "./pages/BulletinList";
import BulletinDetail from "./pages/BulletinDetail";
import CongesList from "./pages/CongesList";
import Paiements from "./pages/Paiements";
import MissionsMoo from "./pages/MissionsMoo";
import JournalierList from "./pages/JournalierList";
import SiteList from "./pages/SiteList";
import TacheCatalogueList from "./pages/TacheCatalogueList";
import LogTravailList from "./pages/LogTravailList";

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuthStore();
    if (loading)
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-500"></div>
            </div>
        );
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
}

export default function App() {
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="employes" element={<EmployeList />} />
                    <Route path="employes/nouveau" element={<EmployeForm />} />
                    <Route path="employes/:id" element={<EmployeDetail />} />
                    <Route path="pointage" element={<Pointage />} />
                    <Route
                        path="pointage-semaine"
                        element={<PointageSemaine />}
                    />
                    <Route path="bulletins" element={<BulletinList />} />
                    <Route path="bulletins/:id" element={<BulletinDetail />} />
                    <Route path="conges" element={<CongesList />} />
                    <Route path="paiements" element={<Paiements />} />
                    <Route path="missions" element={<MissionsMoo />} />
                    <Route path="journaliers" element={<JournalierList />} />
                    <Route path="sites" element={<SiteList />} />
                    <Route path="taches" element={<TacheCatalogueList />} />
                    <Route path="logs" element={<LogTravailList />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
