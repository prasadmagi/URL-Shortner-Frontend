import { useState } from "react";
import { toast } from "react-toastify";
import { signupUser } from "../api/authService";
import { useAuthCard } from "../hooks/useGsap";
import PageShell from "./layout/PageShell";
import TextType from "@/components/TextType/TextType";

export default function Signup({ onSignupSuccess, onLoginClick, onBackToHome }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { cardRef, backRef } = useAuthCard();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Full name is required");
      toast.error("Full name is required");
      return;
    }

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

    if (!confirmPassword) {
      setError("Confirm password is required");
      toast.error("Confirm password is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await signupUser(name, email, password);
      toast.success("Account created successfully!");

      if (onSignupSuccess) {
        onSignupSuccess(response);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Signup failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-600/80 bg-slate-800/60 px-4 py-3 text-white placeholder-slate-500 transition focus:outline-none focus:ring-2 focus:ring-violet-500/50";

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
              text="Create Account"
              loop={false}
              typingSpeed={70}
              className="font-display text-3xl font-bold min-h-[2.5rem]"
              textColors={["#e9d5ff"]}
              showCursor
              cursorCharacter="|"
            />
            <p className="mt-2 text-slate-400">Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-slate-500">Minimum 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                disabled={loading}
              />
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
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-700/80 pt-6">
            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onLoginClick}
                className="font-medium text-violet-400 transition hover:text-violet-300"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
    </PageShell>
  );
}
