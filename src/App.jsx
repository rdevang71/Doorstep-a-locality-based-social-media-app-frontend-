import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import PostDetails from "./pages/PostDetails";
import BusinessPages from "./pages/BusinessPages";
import Communities from "./pages/Communities";
import CommunityDetails from "./pages/CommunityDetails";
import Events from "./pages/Events";
import PublicChat from "./pages/PublicChat";
import AreaSummary from "./pages/AreaSummary";
import AdminDashboard from "./pages/AdminDashboard";
function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
function Protected() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center">
        Loading LocalConnect…
      </div>
    );
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
function RoleRoute() {
  const { user } = useAuth();
  return ["admin", "moderator"].includes(user?.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
}
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/posts/:id" element={<PostDetails />} />
        <Route path="/businesses" element={<BusinessPages />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/communities/:id" element={<CommunityDetails />} />
        <Route path="/events" element={<Events />} />
        <Route element={<Protected />}>
          <Route path="/create" element={<CreatePost />} />
          <Route path="/chat" element={<PublicChat />} />
          <Route path="/summary" element={<AreaSummary />} />
          <Route element={<RoleRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

