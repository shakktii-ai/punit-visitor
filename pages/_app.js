import React, { useEffect } from "react";
import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/navbar";
import Navbarr from "@/components/Navbarr";
import Footer from "@/components/footer";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const isAdminRoute = router.pathname.startsWith("/admin");
  const isLoginRoute = router.pathname === "/login";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");
      const username = localStorage.getItem("username");

      // Sync permissions from DB on mount
      if (role === "admin" && username) {
        fetch(`/api/permissions/user?username=${encodeURIComponent(username)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.allowedPages) {
              localStorage.setItem("allowedPages", JSON.stringify(data.allowedPages));
            }
          })
          .catch((err) => console.error("Error syncing permissions:", err));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoginRoute) {
      const role = localStorage.getItem("userRole");
      const username = localStorage.getItem("username");
      const allowedPagesStr = localStorage.getItem("allowedPages");
      const allowedPages = allowedPagesStr ? JSON.parse(allowedPagesStr) : [];

      if (isAdminRoute) {
        if (role !== "admin") {
          router.push("/login");
        } else if (username !== "admin" && router.pathname !== "/admin") {
          const hasAccess = (path) => {
            if (path.startsWith("/admin/visitorTable") || path.startsWith("/admin/edit-visitor")) {
              return allowedPages.includes("/admin/visitorTable");
            }
            if (path.startsWith("/admin/workers") || path.startsWith("/admin/addWorker") || path.startsWith("/admin/edit-worker")) {
              return allowedPages.includes("/admin/workers");
            }
            if (path.startsWith("/admin/letters") || path.startsWith("/admin/addLetter") || path.startsWith("/admin/edit-letter")) {
              return allowedPages.includes("/admin/letters");
            }
            if (path.startsWith("/admin/inward-letters") || path.startsWith("/admin/addInwardLetter") || path.startsWith("/admin/edit-inward-letter")) {
              return allowedPages.includes("/admin/inward-letters");
            }
            if (path.startsWith("/admin/calendar")) {
              return allowedPages.includes("/admin/calendar");
            }
            if (path.startsWith("/admin/event-requests")) {
              return allowedPages.includes("/admin/event-requests");
            }
            if (path.startsWith("/admin/permissions")) {
              return false;
            }
            return false;
          };

          if (!hasAccess(router.pathname)) {
            router.push("/admin");
          }
        }
      } else {
        // User routes check
        const isUserRoute = 
          router.pathname === "/form" ||
          router.pathname === "/my-submissions" ||
          router.pathname.startsWith("/workers") ||
          router.pathname.startsWith("/addWorker") ||
          router.pathname.startsWith("/edit-worker") ||
          router.pathname.startsWith("/letters") ||
          router.pathname.startsWith("/addLetter") ||
          router.pathname.startsWith("/edit-letter") ||
          router.pathname.startsWith("/inward-letters") ||
          router.pathname.startsWith("/addInwardLetter") ||
          router.pathname.startsWith("/edit-inward-letter") ||
          router.pathname.startsWith("/invitations");

        if (isUserRoute) {
          if (role !== "user" && role !== "admin") {
            router.push("/login");
          } else if (role === "user") {
            const hasAccess = (path) => {
              if (path === "/form") return allowedPages.includes("/form");
              if (path === "/my-submissions") return allowedPages.includes("/my-submissions");
              if (path.startsWith("/workers") || path.startsWith("/addWorker") || path.startsWith("/edit-worker")) {
                return allowedPages.includes("/workers");
              }
              if (path.startsWith("/letters") || path.startsWith("/addLetter") || path.startsWith("/edit-letter")) {
                return allowedPages.includes("/letters");
              }
              if (path.startsWith("/inward-letters") || path.startsWith("/addInwardLetter") || path.startsWith("/edit-inward-letter")) {
                return allowedPages.includes("/inward-letters");
              }
              if (path.startsWith("/invitations")) {
                return allowedPages.includes("/invitations");
              }
              return true;
            };

            if (!hasAccess(router.pathname)) {
              const firstAllowed = allowedPages.find(p => p.startsWith("/"));
              if (firstAllowed) {
                router.push(firstAllowed);
              } else {
                router.push("/login");
              }
            }
          }
        }
      }
    }
  }, [router.pathname, isAdminRoute, isLoginRoute]);

  if (isLoginRoute) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="page-transition">
          <Component {...pageProps} />
        </div>
        <ToastContainer
          position="bottom-right"
          theme="light"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          toastStyle={{
            background: "#FFFFFF",
            border: "1px solid rgba(249, 115, 22, 0.15)",
            borderRadius: "12px",
            color: "#1E293B",
          }}
        />
      </div>
    );
  }

  if (isAdminRoute) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Navbarr />
        <main className="flex-1 min-h-screen overflow-y-auto">
          <div className="page-transition">
            <Component {...pageProps} />
          </div>
        </main>
        <ToastContainer
          position="bottom-right"
          theme="light"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          toastStyle={{
            background: "#FFFFFF",
            border: "1px solid rgba(249, 115, 22, 0.15)",
            borderRadius: "12px",
            color: "#1E293B",
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        <div className="page-transition">
          <Component {...pageProps} />
        </div>
      </main>
      <Footer />
      <ToastContainer
        position="bottom-right"
        theme="light"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastStyle={{
          background: "#FFFFFF",
          border: "1px solid rgba(249, 115, 22, 0.15)",
          borderRadius: "12px",
          color: "#1E293B",
        }}
      />
    </div>
  );
}
