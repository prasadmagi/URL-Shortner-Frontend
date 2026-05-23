import { useState } from "react";
import { toast } from "react-toastify";
import { shortenUrl } from "../api/urlService";
import { useStaggerReveal, useRevealOnChange } from "../hooks/useGsap";
import PageShell from "./layout/PageShell";
import TextType from "@/components/TextType/TextType";

export default function Home({
  isLoggedIn,
  onLoginClick,
  onSignupClick,
  onDashboardClick,
}) {
  const [longUrl, setLongUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const containerRef = useStaggerReveal("[data-animate]");
  const resultRef = useRevealOnChange(result, "[data-result]");

  const handleShorten = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const trimmed = longUrl.trim();
    if (!trimmed) {
      const message = "Please enter a URL";
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    try {
      const data = await shortenUrl(trimmed);
      setResult(data);
      toast.success(data.message || "URL shortened successfully!");
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.shortUrl) return;
    await navigator.clipboard.writeText(result.shortUrl);
    toast.success("Short URL copied to clipboard!");
  };

  return (
    <PageShell>
    <main ref={containerRef} className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <section className="text-center">
        <p
          data-animate
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-violet-300"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Fast · Secure · Free
        </p>

        <div data-animate className="mx-auto min-h-[4.5rem] sm:min-h-[5.5rem] flex items-center justify-center">
          <TextType
            as="h1"
            text={[
              "Shorten your links in seconds",
              "Track clicks with ease",
              "Share smarter, faster links",
            ]}
            className="font-display text-4xl font-bold tracking-tight sm:text-6xl"
            typingSpeed={52}
            deletingSpeed={32}
            pauseDuration={2200}
            loop
            showCursor
            cursorCharacter="|"
            cursorClassName="text-type__cursor"
            textColors={["#f1f5f9", "#c4b5fd", "#67e8f9"]}
          />
        </div>

        <p data-animate className="mx-auto mt-5 max-w-xl text-lg text-slate-400/90 font-light">
          Paste a long URL below and get a short link instantly.
          {!isLoggedIn && " No login required — up to 2 links per device."}
        </p>

        <form
          data-animate
          onSubmit={handleShorten}
          className="mx-auto mt-12 flex max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            className="glass-card flex-1 rounded-xl px-5 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500/50 transition"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-glow rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Shortening…" : "Shorten"}
          </button>
        </form>

        {error && (
          <div
            data-animate
            className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        <div ref={resultRef}>
          {result && (
            <div
              data-result
              className="glass-card mx-auto mt-8 max-w-2xl rounded-2xl border border-emerald-500/25 p-6 text-left"
            >
              <p className="text-sm font-medium text-emerald-400">
                {result.message}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-sm font-medium text-violet-400 hover:text-violet-300 transition"
                >
                  {result.shortUrl}
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 rounded-lg border border-slate-600/80 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-700/50"
                >
                  Copy
                </button>
              </div>

              <p className="mt-3 truncate text-xs text-slate-500">
                Original: {result.longUrl}
              </p>
              {result.isAnonymous && (
                <span className="mt-3 inline-block rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-400">
                  Anonymous · {result.shortCode}
                </span>
              )}
            </div>
          )}
        </div>

        {!isLoggedIn && (
          <div
            data-animate
            className="glass-card mx-auto mt-16 max-w-2xl rounded-2xl p-8"
          >
            <p className="text-slate-300 mb-6">
              Want to track your links and get unlimited access?
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                type="button"
                onClick={onLoginClick}
                className="btn-glow rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-2.5 font-medium text-white"
              >
                Login
              </button>
              <button
                type="button"
                onClick={onSignupClick}
                className="rounded-xl border border-violet-500/50 px-8 py-2.5 font-medium text-violet-300 transition hover:bg-violet-500/10"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {isLoggedIn && (
          <div
            data-animate
            className="glass-card mx-auto mt-16 max-w-2xl rounded-2xl border border-cyan-500/20 p-8"
          >
            <p className="text-cyan-200/90 mb-6">
              Check your dashboard to manage all your shortened URLs and track
              clicks.
            </p>
            <button
              type="button"
              onClick={onDashboardClick}
              className="btn-glow rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 px-8 py-2.5 font-medium text-white"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </section>
    </main>
    </PageShell>
  );
}
