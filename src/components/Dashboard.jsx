import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getUserUrls, getUserStats, deleteUrl } from "../api/dashboardService";
import { shortenUrl } from "../api/urlService";
import { useStaggerReveal, useTabContent } from "../hooks/useGsap";
import PageShell from "./layout/PageShell";
import TextType from "@/components/TextType/TextType";

export default function Dashboard({ user, onLogout, onBackToHome }) {
  const [urls, setUrls] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [longUrl, setLongUrl] = useState("");
  const [shortening, setShortening] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, create
  const containerRef = useStaggerReveal("[data-animate]", [loading, stats]);
  const tabContentRef = useTabContent(activeTab);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [urlsResponse, statsResponse] = await Promise.all([
        getUserUrls(),
        // getUserStats(),
      ]);
      setUrls(urlsResponse.urls || []);
      setStats(statsResponse);
      setError("");
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to load dashboard data";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    setError("");

    const trimmed = longUrl.trim();
    if (!trimmed) {
      toast.error("Please enter a URL");
      return;
    }

    setShortening(true);
    try {
      const data = await shortenUrl(trimmed);
      setUrls([{ ...data, createdAt: new Date().toISOString() }, ...urls]);
      setLongUrl("");
      toast.success("URL shortened successfully!");
      setActiveTab("dashboard");
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || "Failed to shorten URL";
      toast.error(message);
    } finally {
      setShortening(false);
    }
  };

  const handleDelete = async (urlId) => {
    if (!window.confirm("Are you sure you want to delete this URL?")) {
      return;
    }

    setDeleteLoading(urlId);
    try {
      await deleteUrl(urlId);
      setUrls(urls.filter((url) => url._id !== urlId));
      toast.success("URL deleted successfully");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete URL";
      toast.error(message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCopyUrl = async (url) => {
    await navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard!");
  };

  const handleOpenUrl = (shortUrl) => {
    window.open(shortUrl, "_blank");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateUrl = (url, length = 50) => {
    return url.length > length ? url.substring(0, length) + "..." : url;
  };

  return (
    <PageShell>
    <div ref={containerRef} className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div data-animate className="flex items-center justify-between mb-8">
          <div>
            <TextType
              as="h1"
              text={["Your Dashboard", "Manage your links"]}
              className="font-display text-3xl font-bold min-h-[2.5rem]"
              typingSpeed={60}
              pauseDuration={2000}
              loop
              showCursor
              textColors={["#f1f5f9", "#a78bfa"]}
            />
            <p className="text-slate-400 mt-1">
              Welcome back, <span className="font-semibold text-violet-300">{user?.name || user?.email}</span>
            </p>
          </div>
            <button
              type="button"
              onClick={onBackToHome}
              className="rounded-xl border border-slate-600/80 px-4 py-2 text-slate-300 transition hover:bg-slate-800/80"
            >
              ← Back to Shortener
            </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`pb-3 px-4 font-medium transition border-b-2 ${
              activeTab === "dashboard"
                ? "text-blue-400 border-blue-400"
                : "text-slate-400 border-transparent hover:text-white"
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`pb-3 px-4 font-medium transition border-b-2 ${
              activeTab === "create"
                ? "text-blue-400 border-blue-400"
                : "text-slate-400 border-transparent hover:text-white"
            }`}
          >
            ➕ Create New
          </button>
        </div>

        <div ref={tabContentRef}>
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div data-animate className="glass-card rounded-2xl p-6">
                  <div className="text-slate-400 text-sm mb-2">Total URLs</div>
                  <div className="text-4xl font-bold">{stats.totalUrls || 0}</div>
                  <div className="text-xs text-slate-500 mt-2">All time</div>
                </div>

                <div data-animate className="glass-card rounded-2xl p-6">
                  <div className="text-slate-400 text-sm mb-2">Total Clicks</div>
                  <div className="text-4xl font-bold">{stats.totalClicks || 0}</div>
                  <div className="text-xs text-slate-500 mt-2">Across all URLs</div>
                </div>

                <div data-animate className="glass-card rounded-2xl p-6">
                  <div className="text-slate-400 text-sm mb-2">Account Status</div>
                  <div className="text-2xl font-bold text-emerald-400">Active</div>
                  <div className="text-xs text-slate-500 mt-2">
                    {user?.email}
                  </div>
                </div>
              </div>
            )}

            {/* URLs List */}
              <div data-animate className="glass-card rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                  <h2 className="text-lg font-semibold">Your Shortened URLs</h2>
                {urls.length > 0 && (
                  <p className="text-sm text-slate-400 mt-1">
                    Manage your shortened URLs here
                  </p>
                )}
              </div>

              {loading ? (
                <div className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin">
                    <svg
                      className="w-8 h-8 text-blue-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-400 mt-2">Loading your URLs...</p>
                </div>
              ) : urls.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="text-4xl mb-3">🔗</div>
                  <p className="text-slate-400">No URLs yet</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Create your first shortened URL to get started
                  </p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="btn-glow mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    Create One Now
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {urls.map((url) => (
                    <div
                      key={url._id || url.shortCode}
                      className="px-6 py-4 hover:bg-slate-700/50 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <a
                              href={url.shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 font-mono text-sm break-all"
                            >
                              {url.shortUrl}
                            </a>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mb-2">
                            <button
                              type="button"
                              onClick={() => handleCopyUrl(url.longUrl)}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-600/80 bg-slate-800/80 px-2 py-1 text-slate-300 transition hover:bg-slate-700/80"
                              title="Copy original URL"
                              aria-label="Copy original URL"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                            <span className="font-semibold text-slate-100">Original:</span>
                            <span className="font-semibold text-slate-100">{truncateUrl(url.longUrl)}</span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>📊 {url.clicks || 0} clicks</span>
                            <span>📅 {formatDate(url.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleOpenUrl(url.shortUrl)}
                            className="p-2 hover:bg-slate-600 rounded transition text-slate-400 hover:text-white"
                            title="Open URL"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDelete(url._id || url.shortCode)}
                            disabled={deleteLoading === (url._id || url.shortCode)}
                            className="p-2 hover:bg-red-600/20 rounded transition text-red-400 hover:text-red-300 disabled:opacity-50"
                            title="Delete"
                          >
                            {deleteLoading === (url._id || url.shortCode) ? (
                              <svg
                                className="w-5 h-5 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create New Tab */}
        {activeTab === "create" && (
            <div className="max-w-2xl mx-auto">
              <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-gradient">Create New Short URL</h2>

              <form onSubmit={handleShorten} className="space-y-4">
                <div>
                  <label
                    htmlFor="longUrl"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Long URL
                  </label>
                  <input
                    id="longUrl"
                    type="url"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    placeholder="https://example.com/very-long-url"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={shortening}
                  />
                </div>

                <button
                  type="submit"
                  disabled={shortening}
                  className="btn-glow flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {shortening ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Shortening...
                    </>
                  ) : (
                    "Shorten URL"
                  )}
                </button>
              </form>

                  <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-sm text-slate-400">
                  💡 Tip: All your shortened URLs will appear in the dashboard
                  for easy management and tracking.
                </p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
    </PageShell>
  );
}
