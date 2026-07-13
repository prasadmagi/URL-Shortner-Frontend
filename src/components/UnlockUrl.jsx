import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { verifyUrlPassword } from "../api/urlService";
import { Lock } from "lucide-react";

const UnlockUrl = ({ shortCode, onBackToHome }) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If not provided via props (e.g. state-based routing), extract from URL
    if (!shortCode) {
      const pathParts = window.location.pathname.split("/");
      if (pathParts[1] === "unlock" && pathParts[2]) {
        shortCode = pathParts[2];
      }
    }
  }, [shortCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Fallback extraction
    let codeToUnlock = shortCode;
    if (!codeToUnlock) {
      const pathParts = window.location.pathname.split("/");
      if (pathParts[1] === "unlock" && pathParts[2]) {
        codeToUnlock = pathParts[2];
      }
    }

    if (!codeToUnlock) {
      toast.error("Invalid URL");
      return;
    }

    if (!password) {
      toast.error("Please enter the password");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyUrlPassword(codeToUnlock, password);
      toast.success("Password correct! Redirecting...");
      window.location.href = result.longUrl;
    } catch (err) {
      toast.error(err.response?.data?.error || "Incorrect password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-6">
      <div className="glass w-full max-w-md rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        <div className="relative text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 ring-1 ring-white/10 shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]">
            <Lock className="h-8 w-8 text-violet-400" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white mb-2">
            Protected Link
          </h2>
          <p className="text-slate-400">
            This URL requires a password to unlock.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-slate-100 transition-all placeholder:text-slate-500 focus:border-violet-500/50 focus:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              placeholder="Enter password..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-glow relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 font-medium text-white shadow-[0_0_20px_-5px_rgba(124,58,237,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_-5px_rgba(124,58,237,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? "Verifying..." : "Unlock URL"}
          </button>
        </form>

        <div className="relative mt-6 text-center">
          <button
            onClick={onBackToHome}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Go back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockUrl;
