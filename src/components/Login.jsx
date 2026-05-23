import { useState } from "react";
import { toast } from "react-toastify";
import { loginUser } from "../api/authService";
import { useAuthCard } from "../hooks/useGsap";
import PageShell from "./layout/PageShell";
import TextType from "@/components/TextType/TextType";

export default function Login({ onLoginSuccess, onSignupClick, onBackToHome }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { cardRef, backRef } = useAuthCard();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      toast.error("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      toast.error("Password is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(email, password);
      toast.success("Login successful!");

      if (onLoginSuccess) {
        onLoginSuccess(response);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Login failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {onBackToHome && (
          <button
            ref={backRef}
            type="button"
            onClick={onBackToHome}
            className="mb-6 text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to home
          </button>
        )}

        <div
          ref={cardRef}
          className="glass-card rounded-2xl p-8 shadow-2xl shadow-violet-900/20"
        >
          <div className="mb-8">
            <TextType
              as="h1"
              text="Welcome Back"
              loop={false}
              typingSpeed={70}
              className="font-display text-3xl font-bold min-h-[2.5rem]"
              textColors={["#e9d5ff"]}
              showCursor
              cursorCharacter="|"
            />
            <p className="mt-2 text-slate-400">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-600/80 bg-slate-800/60 px-4 py-3 text-white placeholder-slate-500 transition focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-600/80 bg-slate-800/60 px-4 py-3 text-white placeholder-slate-500 transition focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 transition hover:text-slate-200"
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-glow flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-700/80 pt-6">
            <p className="text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={onSignupClick}
                className="font-medium text-violet-400 transition hover:text-violet-300"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
    </PageShell>
  );
}
