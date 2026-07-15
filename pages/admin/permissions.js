import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const ADMIN_MODULES = [
  { path: "/admin/visitorTable", label: "Manage Visitors", description: "Access the visitors list and detail views", icon: "" },
  { path: "/admin/workers", label: "Manage Party Workers", description: "Register, edit, and view party workers", icon: "" },
  { path: "/admin/inward-letters", label: "Manage Inward Letters", description: "Access registry and manage inward correspondence", icon: "" },
  { path: "/admin/letters", label: "Manage Outward Letters", description: "Access outward correspondence registry", icon: "" },
  { path: "/admin/calendar", label: "Access Calendar", description: "View schedule, birthdays, and anniversaries", icon: "" },
  { path: "/admin/event-requests", label: "Manage Event Requests", description: "Approve or reject invitation requests", icon: "" }
];

const USER_MODULES = [
  { path: "/form", label: "Visitor Entry", description: "Submit new visitor entries", icon: "" },
  { path: "/my-submissions", label: "My Entry's", description: "View self-submitted entries history", icon: "" },
  { path: "/invitations", label: "Saheb Invitations", description: "Access the Saheb invitations list", icon: "" }
];

export default function PermissionsManagement() {
  const router = useRouter();
  
  // Tab control: "admins" or "users"
  const [activeTab, setActiveTab] = useState("admins");
  
  const [subAdmins, setSubAdmins] = useState([]);
  const [normalUsers, setNormalUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [form, setForm] = useState({ username: "", password: "", role: "user" });
  const [creating, setCreating] = useState(false);
  const [savingUser, setSavingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");
    if (role !== "admin" || username !== "admin") {
      router.push("/admin");
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const superUser = localStorage.getItem("username") || "admin";
      const superRole = localStorage.getItem("userRole") || "admin";
      
      const res = await fetch("/api/permissions", {
        headers: {
          "x-user-role": superRole,
          "x-username": superUser
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubAdmins(data.subAdmins || []);
        setNormalUsers(data.normalUsers || []);
      } else {
        toast.error(data.error || "Failed to load permissions.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load permissions due to connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (username, path, role) => {
    const updater = (prev) => prev.map(u => {
      if (u.username === username) {
        const isAllowed = u.allowedPages.includes(path);
        const newPages = isAllowed 
          ? u.allowedPages.filter(p => p !== path)
          : [...u.allowedPages, path];
        return { ...u, allowedPages: newPages };
      }
      return u;
    });

    if (role === "admin") {
      setSubAdmins(updater);
    } else {
      setNormalUsers(updater);
    }
  };

  const handleSave = async (username, currentRole) => {
    setSavingUser(username);
    const targetUser = (currentRole === "admin" ? subAdmins : normalUsers).find(u => u.username === username);
    if (!targetUser) return;

    try {
      const superUser = localStorage.getItem("username") || "admin";
      const superRole = localStorage.getItem("userRole") || "admin";

      const res = await fetch("/api/permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": superRole,
          "x-username": superUser
        },
        body: JSON.stringify({
          targetUsername: username,
          allowedPages: targetUser.allowedPages
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Permissions for ${username} saved successfully!`);
      } else {
        toast.error(data.error || "Failed to save permissions.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error while saving permissions.");
    } finally {
      setSavingUser(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.role) {
      toast.error("Please fill in all user details.");
      return;
    }
    setCreating(true);
    try {
      const superUser = localStorage.getItem("username") || "admin";
      const superRole = localStorage.getItem("userRole") || "admin";

      const res = await fetch("/api/users/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": superRole,
          "x-username": superUser
        },
        body: JSON.stringify({
          newUsername: form.username,
          newPassword: form.password,
          newRole: form.role
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`User "${form.username}" created successfully.`);
        setForm({ username: "", password: "", role: "user" });
        fetchData();
      } else {
        toast.error(data.error || "Failed to create user.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error during user creation.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (targetUsername) => {
    if (!confirm(`Are you sure you want to permanently delete user "${targetUsername}"?`)) {
      return;
    }
    setDeletingUser(targetUsername);
    try {
      const superUser = localStorage.getItem("username") || "admin";
      const superRole = localStorage.getItem("userRole") || "admin";

      const res = await fetch(`/api/users/manage?targetUsername=${encodeURIComponent(targetUsername)}`, {
        method: "DELETE",
        headers: {
          "x-user-role": superRole,
          "x-username": superUser
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`User "${targetUsername}" deleted successfully.`);
        fetchData();
      } else {
        toast.error(data.error || "Failed to delete user.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error during user deletion.");
    } finally {
      setDeletingUser(null);
    }
  };

  const activeList = activeTab === "admins" ? subAdmins : normalUsers;
  const activeModules = activeTab === "admins" ? ADMIN_MODULES : USER_MODULES;

  return (
    <>
      <Head>
        <title>Permissions Manager – VisitorPass Admin</title>
        <meta name="description" content="Manage user registrations and permissions control panel." />
      </Head>

      <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
        {/* Header Title */}
        <div className="border-b border-orange-100 pb-5">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
             Access & Users Control Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Create new accounts and toggle module-level access permissions dynamically.
          </p>
        </div>

        {/* User Creation Form */}
        <div className="bg-white border border-orange-100/80 rounded-3xl p-6 shadow-sm transition-all">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
             Add New User Account
          </h2>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="e.g., AmitR"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="password123"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1">Account Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 bg-white transition-colors"
              >
                <option value="user">Normal User (User Pages)</option>
                <option value="admin">Sub Admin (Admin Pages)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white text-sm font-bold transition-all shadow-md shadow-orange-500/10 flex items-center justify-center gap-1.5"
            >
              {creating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-100 gap-6">
          <button
            onClick={() => setActiveTab("admins")}
            className={`pb-3 font-bold text-sm tracking-wide transition-all border-b-2 ${
              activeTab === "admins"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Sub Admins ({subAdmins.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 font-bold text-sm tracking-wide transition-all border-b-2 ${
              activeTab === "users"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Normal Users ({normalUsers.length})
          </button>
        </div>

        {/* User Listings & Module Checks */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            <p className="text-sm text-slate-500 font-medium">Loading credentials list...</p>
          </div>
        ) : activeList.length === 0 ? (
          <div className="text-center py-20 bg-white border border-orange-100 rounded-3xl p-6">
            <p className="text-slate-500 font-medium">No accounts in this category.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeList.map((user) => (
              <div 
                key={user.username} 
                className="bg-white border border-orange-100/80 rounded-3xl shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* User Card Header */}
                <div className="bg-orange-50/40 border-b border-orange-100/60 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                       {user.username}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        activeTab === "admins" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {activeTab === "admins" ? "Sub Admin" : "Normal User"}
                      </span>
                    </h2>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Configure page access rules. {user.isDynamic ? "Dynamically created account." : "Hardcoded configuration account."}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Delete button (Only for dynamic db users) */}
                    {user.isDynamic && (
                      <button
                        onClick={() => handleDeleteUser(user.username)}
                        disabled={deletingUser === user.username}
                        className="px-3.5 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors flex items-center gap-1"
                      >
                        {deletingUser === user.username ? "Deleting..." : " Delete"}
                      </button>
                    )}
                    
                    {/* Save Changes button */}
                    <button
                      onClick={() => handleSave(user.username, activeTab === "admins" ? "admin" : "user")}
                      disabled={savingUser === user.username}
                      className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/10"
                    >
                      {savingUser === user.username ? (
                        <>
                          <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                          Saving...
                        </>
                      ) : (
                        "Save Permissions"
                      )}
                    </button>
                  </div>
                </div>

                {/* Modules Checklist Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeModules.map((mod) => {
                    const isChecked = user.allowedPages.includes(mod.path);
                    return (
                      <div 
                        key={mod.path}
                        onClick={() => handleToggle(user.username, mod.path, activeTab === "admins" ? "admin" : "user")}
                        className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                          isChecked 
                            ? "bg-orange-50/20 border-orange-200 shadow-sm" 
                            : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Handled by outer click
                            className="w-4.5 h-4.5 rounded text-orange-500 focus:ring-orange-500 border-slate-300"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <span className="text-lg mr-1.5">{mod.icon}</span>
                          <span className="font-bold text-slate-800 text-sm">{mod.label}</span>
                          <p className="text-slate-400 text-xs mt-1 leading-relaxed">{mod.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
