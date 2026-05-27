import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import gsap from "gsap";
import {
  isAuthenticated,
  logoutUser,
  getStoredUser,
} from "./api/authService";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import ReactBitsBackground from "./components/ReactBitsBackground";
import { prefersReducedMotion } from "./utils/gsap";

function App() {
  const [theme, setTheme] = useState("dark");
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const headerRef = useRef(null);
  const pageRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated()) {
      setIsLoggedIn(true);
      setUser(getStoredUser());
    }
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    } else if (window.matchMedia) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useLayoutEffect(() => {
    if (!headerRef.current || currentPage !== "home") return;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap.from(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });
    });
    return () => ctx.revert();
  }, [currentPage]);

  useLayoutEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(pageRef.current, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    });
    return () => ctx.revert();
  }, [currentPage]);

  const handleLoginSuccess = (response) => {
    setIsLoggedIn(true);
    setUser(response.user || getStoredUser());
    setCurrentPage("dashboard");
  };

  const handleSignupSuccess = (response) => {
    if (response.token) {
      setIsLoggedIn(true);
      setUser(response.user || getStoredUser());
      setCurrentPage("dashboard");
    } else {
      setCurrentPage("login");
    }
  };

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage("home");
    toast.info("You have been logged out");
  };

  const isAdmin = user?.role === "ADMIN";
  const bgVariant = ["login", "signup"].includes(currentPage)
    ? "auth"
    : ["dashboard", "admin"].includes(currentPage)
      ? "dashboard"
      : "default";

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSignupClick={() => setCurrentPage("signup")}
            onBackToHome={() => setCurrentPage("home")}
          />
        );
      case "signup":
        return (
          <Signup
            onSignupSuccess={handleSignupSuccess}
            onLoginClick={() => setCurrentPage("login")}
            onBackToHome={() => setCurrentPage("home")}
          />
        );
      case "dashboard":
        return (
          <Dashboard
            user={user}
            onLogout={handleLogout}
            onBackToHome={() => setCurrentPage("home")}
          />
        );
      case "admin":
        return (
          <AdminDashboard
            user={user}
            onLogout={handleLogout}
            onBackToHome={() => setCurrentPage("home")}
          />
        );
      case "home":
      default:
        return (
          <Home
            isLoggedIn={isLoggedIn}
            user={user}
            onLogout={handleLogout}
            onLoginClick={() => setCurrentPage("login")}
            onSignupClick={() => setCurrentPage("signup")}
            onDashboardClick={() => setCurrentPage("dashboard")}
          />
        );
    }
  };

  const showNav = currentPage === "home";

  return (
      <div
        className={`relative min-h-screen overflow-x-hidden ${
          theme === "light" ? "text-slate-900" : "text-slate-100"
        }`}
      >
  <div className="fixed right-4 top-4 z-50">
          <button
            type="button"
            onClick={toggleTheme}
            className={`rounded-full border px-4 py-2 text-sm shadow-lg transition ${
              theme === "light"
                ? "border-slate-300 bg-white/90 text-slate-900 shadow-slate-400/10 hover:bg-slate-100"
                : "border-slate-600/80 bg-slate-950/80 text-slate-100 shadow-slate-950/20 hover:bg-slate-800/90"
            }`}
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
  <ReactBitsBackground variant={bgVariant} theme={theme} />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={theme}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      {showNav && (
        <header ref={headerRef} className="glass sticky top-0 z-20 border-b border-slate-800/80">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <button
              type="button"
              onClick={() => setCurrentPage("home")}
              className="font-display text-lg font-semibold tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-90 transition"
            >
              URL Shortener
            </button>
            <nav className="flex items-center gap-3 text-sm">
              {isLoggedIn ? (
                <>
                  <span className="hidden sm:inline text-slate-400">
                    {user?.name || user?.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage("dashboard")}
                    className="rounded-lg px-3 py-1.5 text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
                  >
                    Dashboard
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setCurrentPage("admin")}
                      className="rounded-lg px-3 py-1.5 text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
                    >
                      Admin
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-slate-600/80 px-3 py-1.5 text-slate-300 transition hover:bg-slate-800/80"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentPage("login")}
                    className="rounded-lg px-3 py-1.5 text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage("signup")}
                    className="btn-glow rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 font-medium text-white"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </nav>
          </div>
        </header>
      )}

      <div ref={pageRef} key={currentPage}>
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
