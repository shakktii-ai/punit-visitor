import React from "react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Head>
        <title>Punit Joshi</title>
        <meta name="description" content="Visitor Management System for Punit Joshi. Register and manage visitors efficiently." />
        <link rel="icon" href="/punit.png" />
      </Head>

      <main className="min-h-[85vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-2xl mx-auto w-full">

          {/* Punit Joshi Profile Card */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-orange-400 shadow-xl shadow-orange-500/25 mb-4">
              <Image
                src="/punit.png"
                alt="Punit Joshi"
                fill
                className="object-cover"
                priority
              />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">
               Punit Joshi
            </h2>
            <span className="mt-1.5 inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold tracking-wide uppercase">
              Visitor Management Portal
            </span>
          </div>

          {/* Hero text */}
         

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/form"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 transition-all"
            >
              Office Login
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-2xl border border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold text-sm transition-all"
            >
              Admin Login
            </Link>
          </div>

          

        </div>
      </main>
    </>
  );
}
