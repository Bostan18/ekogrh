import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import useAuthStore from "./store/authStore";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Spinner from "./components/Spinner";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const EmployeList = lazy(() => import("./pages/EmployeList"));
const EmployeForm = lazy(() => import("./pages/EmployeForm"));
const EmployeDetail = lazy(() => import("./pages/EmployeDetail"));
const Pointage = lazy(() => import("./pages/Pointage"));
const PointageSemaine = lazy(() => import("./pages/PointageSemaine"));
const BulletinList = lazy(() => import("./pages/BulletinList"));
const BulletinDetail = lazy(() => import("./pages/BulletinDetail"));
const CongesList = lazy(() => import("./pages/CongesList"));
const Paiements = lazy(() => import("./pages/Paiements"));
const MissionsMoo = lazy(() => import("./pages/MissionsMoo"));
const JournalierList = lazy(() => import("./pages/JournalierList"));
const SiteList = lazy(() => import("./pages/SiteList"));
const TacheCatalogueList = lazy(() => import("./pages/TacheCatalogueList"));
const LogTravailList = lazy(() => import("./pages/LogTravailList"));
const HistoriqueContrats = lazy(() => import("./pages/HistoriqueContrats"));
const TaskPayroll = lazy(() => import("./pages/TaskPayroll"));
const RetenueCategorieList = lazy(() => import("./pages/RetenueCategorieList"));
const CompetenceList = lazy(() => import("./pages/CompetenceList"));
const CertificationList = lazy(() => import("./pages/CertificationList"));
const CompetenceEmployeList = lazy(() => import("./pages/CompetenceEmployeList"));

function PageLoader() {
    return <Spinner className="h-64" />;
}

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuthStore();
    if (loading) return <Spinner className="h-screen" size="lg" />;
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
                <Route
                    path="/login"
                    element={
                        <ErrorBoundary fallbackMessage="Erreur sur la page de connexion.">
                            <Login />
                        </ErrorBoundary>
                    }
                />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <ErrorBoundary>
                                <Layout />
                            </ErrorBoundary>
                        </ProtectedRoute>
                    }
                >
                    <Route
                        index
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <Dashboard />
                            </Suspense>
                        }
                    />
                    <Route
                        path="employes"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <EmployeList />
                            </Suspense>
                        }
                    />
                    <Route
                        path="employes/nouveau"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <EmployeForm />
                            </Suspense>
                        }
                    />
                    <Route
                        path="employes/:id/modifier"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <EmployeForm />
                            </Suspense>
                        }
                    />
                    <Route
                        path="employes/:id"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <EmployeDetail />
                            </Suspense>
                        }
                    />
                    <Route
                        path="pointage"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <Pointage />
                            </Suspense>
                        }
                    />
                    <Route
                        path="pointage-semaine"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <PointageSemaine />
                            </Suspense>
                        }
                    />
                    <Route
                        path="bulletins"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <BulletinList />
                            </Suspense>
                        }
                    />
                    <Route
                        path="bulletins/:id"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <BulletinDetail />
                            </Suspense>
                        }
                    />
                    <Route
                        path="conges"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <CongesList />
                            </Suspense>
                        }
                    />
                    <Route
                        path="paiements"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <Paiements />
                            </Suspense>
                        }
                    />
                    <Route
                        path="missions"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <MissionsMoo />
                            </Suspense>
                        }
                    />
                    <Route
                        path="journaliers"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <JournalierList />
                            </Suspense>
                        }
                    />
                    <Route
                        path="sites"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <SiteList />
                            </Suspense>
                        }
                    />
                    <Route
                        path="taches"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <TacheCatalogueList />
                            </Suspense>
                        }
                    />
                    <Route
                        path="logs"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <LogTravailList />
                            </Suspense>
                        }
                    />
                    <Route
                        path="historique"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <HistoriqueContrats />
                            </Suspense>
                        }
                    />
                    <Route
                        path="task-payroll"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <TaskPayroll />
                            </Suspense>
                        }
                    />
                    <Route
                        path="retenues"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <RetenueCategorieList />
                            </Suspense>
                        }
                    />
                    <Route
                        path="competences"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <CompetenceList />
                            </Suspense>
                        }
                    />
                    <Route
                        path="employes/:id/certifications"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <CertificationList />
                            </Suspense>
                        }
                    />
                    <Route
                        path="employes/:id/competences"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <CompetenceEmployeList />
                            </Suspense>
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
