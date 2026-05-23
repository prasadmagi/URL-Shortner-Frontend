import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAdminStats, getAllUsers, getUserDetails, getUrlAnalytics, deleteUserAsAdmin, deleteUrlAsAdmin } from "../api/adminService";
import { useStaggerReveal, useTabContent } from "../hooks/useGsap";
import PageShell from "./layout/PageShell";
import TextType from "@/components/TextType/TextType";

export default function AdminDashboard({ user, onLogout, onBackToHome }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, analytics
  const [usersPage, setUsersPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const containerRef = useStaggerReveal("[data-animate]", [loading, stats]);
  const tabContentRef = useTabContent(activeTab);

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [usersPage, activeTab]);

  useEffect(() => {
    if (activeTab === "analytics" && selectedUserDetails) {
      // Analytics tab will fetch data when user is selected
    }
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsData = await getAdminStats();
      setStats(statsData);
      console.log(statsData,"statsData")
      setError("");
    } catch (err) {
      console.error("Error fetching admin data:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to load admin dashboard";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data.users || []);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const data = await getUserDetails(userId);
      setSelectedUserDetails(data);
    } catch (err) {
      toast.error("Failed to load user details");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setDeleteLoadingId(userId);
    try {
      await deleteUserAsAdmin(userId);
      setUsers(users.filter((u) => u._id !== userId));
      toast.success("User deleted successfully");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete user";
      toast.error(message);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleDeleteUrl = async (urlId) => {
    if (!window.confirm("Are you sure you want to delete this URL?")) {
      return;
    }

    setDeleteLoadingId(urlId);
    try {
      await deleteUrlAsAdmin(urlId);
      // Remove from selected user's URLs
      if (selectedUserDetails) {
        setSelectedUserDetails({
          ...selectedUserDetails,
          urls: selectedUserDetails.urls.filter((u) => u._id !== urlId),
        });
      }
      toast.success("URL deleted successfully");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete URL";
      toast.error(message);
    } finally {
      setDeleteLoadingId(null);
    }
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

  const truncateUrl = (url, length = 40) => {
    return url.length > length ? url.substring(0, length) + "..." : url;
  };

  return (
    <PageShell>
    <div ref={containerRef} className="min-h-screen text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div data-animate className="flex items-center justify-between mb-8">
          <div>
            <TextType
              as="h1"
              text={["Admin Dashboard", "System Overview"]}
              className="font-display text-3xl font-bold min-h-[2.5rem]"
              typingSpeed={60}
              pauseDuration={2000}
              loop
              showCursor
              textColors={["#f1f5f9", "#67e8f9"]}
            />
            <p className="text-slate-400 mt-1">
              System Overview & Management
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onBackToHome}
              className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition"
            >
              ← Back to Home
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg bg-red-600/20 border border-red-600 text-red-400 hover:bg-red-600/30 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div ref={tabContentRef}>
        {/* Tabs */}
        <div data-animate className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-4 font-medium transition border-b-2 ${
              activeTab === "overview"
                ? "text-blue-400 border-blue-400"
                : "text-slate-400 border-transparent hover:text-white"
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-4 font-medium transition border-b-2 ${
              activeTab === "users"
                ? "text-blue-400 border-blue-400"
                : "text-slate-400 border-transparent hover:text-white"
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-3 px-4 font-medium transition border-b-2 ${
              activeTab === "analytics"
                ? "text-blue-400 border-blue-400"
                : "text-slate-400 border-transparent hover:text-white"
            }`}
          >
            � Analytics
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin">
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
              </div>
            ) : error ? (
              <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
                {error}
              </div>
            ) : stats ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-400 text-sm mb-2">Total Users</div>
                        <div className="text-4xl font-bold">{stats.stats.totalUsers || 0}</div>
                      </div>
                      <div className="text-4xl">👥</div>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-400 text-sm mb-2">Total URLs</div>
                        <div className="text-4xl font-bold">{stats.stats.totalUrls || 0}</div>
                      </div>
                      <div className="text-4xl">🔗</div>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-400 text-sm mb-2">Total Clicks</div>
                        <div className="text-4xl font-bold">{stats.stats.totalClicks || 0}</div>
                      </div>
                      <div className="text-4xl">📈</div>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-400 text-sm mb-2">Admin Users</div>
                        <div className="text-4xl font-bold">{stats.adminCount || 0}</div>
                      </div>
                      <div className="text-4xl">⚙️</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <h2 className="text-xl font-semibold mb-4">System Information</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-400">Active Users (Last 24h)</span>
                      <span className="font-semibold">{stats.activeUsersLast24h || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-400">URLs Created (Last 24h)</span>
                      <span className="font-semibold">{stats.urlsCreatedLast24h || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-400">Average URLs per User</span>
                      <span className="font-semibold">
                        {stats.totalUsers > 0 ? (stats.stats.totalUrls / stats.stats.totalUsers).toFixed(2) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold">All Users</h2>
              </div>

              {usersLoading ? (
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
                  <p className="text-slate-400 mt-2">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-400">
                  No users found
                </div>
              ) : (
                <div className="divide-y divide-slate-700 overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Role</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Joined</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-700/30 transition">
                          <td className="px-6 py-4 text-sm">{u.name || "—"}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{u.email}</td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                u.role === "ADMIN"
                                  ? "bg-red-900/30 text-red-300 border border-red-700"
                                  : "bg-blue-900/30 text-blue-300 border border-blue-700"
                              }`}
                            >
                              {u.role || "user"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              disabled={deleteLoadingId === u._id}
                              className="px-3 py-1 text-xs rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 disabled:opacity-50 transition"
                            >
                              {deleteLoadingId === u._id ? "Deleting..." : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-700 flex justify-between items-center">
                <span className="text-sm text-slate-400">Page {usersPage}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUsersPage(Math.max(1, usersPage - 1))}
                    disabled={usersPage === 1}
                    className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50 hover:bg-slate-700 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setUsersPage(usersPage + 1)}
                    disabled={users.length < 10}
                    className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50 hover:bg-slate-700 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* URLs Tab */}
        {activeTab === "urls" && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold">All Shortened URLs</h2>
              </div>

              {urlsLoading ? (
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
                  <p className="text-slate-400 mt-2">Loading URLs...</p>
                </div>
              ) : urls.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-400">
                  No URLs found
                </div>
              ) : (
                <div className="divide-y divide-slate-700 overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Short Code</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Original URL</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Clicks</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Created</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {urls.map((url) => (
                        <tr key={url._id} className="hover:bg-slate-700/30 transition">
                          <td className="px-6 py-4 text-sm font-mono text-blue-400">{url.shortCode}</td>
                          <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">
                            {truncateUrl(url.longUrl)}
                          </td>
                          <td className="px-6 py-4 text-sm">{url.clicks || 0}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">
                            {formatDate(url.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleDeleteUrl(url._id)}
                              disabled={deleteLoadingId === url._id}
                              className="px-3 py-1 text-xs rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 disabled:opacity-50 transition"
                            >
                              {deleteLoadingId === url._id ? "Deleting..." : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-700 flex justify-between items-center">
                <span className="text-sm text-slate-400">Page {urlsPage}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUrlsPage(Math.max(1, urlsPage - 1))}
                    disabled={urlsPage === 1}
                    className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50 hover:bg-slate-700 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setUrlsPage(urlsPage + 1)}
                    disabled={urls.length < 10}
                    className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 disabled:opacity-50 hover:bg-slate-700 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {!selectedUserDetails ? (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <p className="text-slate-400 mb-4">Select a user to view their URL analytics:</p>
                {users.length === 0 ? (
                  <p className="text-slate-500">No users available</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => fetchUserDetails(u._id)}
                        className="p-4 rounded-lg border border-slate-600 hover:bg-slate-700 transition text-left"
                      >
                        <p className="font-medium">{u.name || u.email}</p>
                        <p className="text-sm text-slate-400">{u.email}</p>
                        <p className="text-xs text-slate-500 mt-1">URLs: {u.urlCount || 0}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedUserDetails.name || selectedUserDetails.email}</h2>
                    <p className="text-slate-400">{selectedUserDetails.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUserDetails(null)}
                    className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition"
                  >
                    ← Back to Users
                  </button>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="text-slate-400 text-sm mb-2">Total URLs</div>
                    <div className="text-4xl font-bold">{selectedUserDetails.urls?.length || 0}</div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="text-slate-400 text-sm mb-2">Total Clicks</div>
                    <div className="text-4xl font-bold">
                      {selectedUserDetails.urls?.reduce((sum, url) => sum + (url.clicks || 0), 0) || 0}
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="text-slate-400 text-sm mb-2">Joined Date</div>
                    <div className="text-sm font-medium">{formatDate(selectedUserDetails.createdAt)}</div>
                  </div>
                </div>

                {/* URLs List */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-700">
                    <h3 className="text-lg font-semibold">User's URLs</h3>
                  </div>

                  {selectedUserDetails.urls && selectedUserDetails.urls.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-400">
                      No URLs created by this user
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-700 overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-700/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Short Code</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Original URL</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Clicks</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Created</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedUserDetails.urls?.map((url) => (
                            <tr key={url._id} className="hover:bg-slate-700/30 transition">
                              <td className="px-6 py-4 text-sm font-mono text-blue-400">{url.shortCode}</td>
                              <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">
                                {truncateUrl(url.longUrl)}
                              </td>
                              <td className="px-6 py-4 text-sm">{url.clicks || 0}</td>
                              <td className="px-6 py-4 text-sm text-slate-400">
                                {formatDate(url.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <button
                                  onClick={() => handleDeleteUrl(url._id)}
                                  disabled={deleteLoadingId === url._id}
                                  className="px-3 py-1 text-xs rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 disabled:opacity-50 transition"
                                >
                                  {deleteLoadingId === url._id ? "Deleting..." : "Delete"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
    </PageShell>
  );
}
