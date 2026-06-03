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
