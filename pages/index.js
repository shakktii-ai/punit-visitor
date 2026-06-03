import React from "react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Head>
        <title> Punit Joshi</title>
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
              Punit <span className="text-orange-500">Joshi</span>
            </h2>
            <span className="mt-1.5 inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold tracking-wide uppercase">
              Visitor Management Portal
            </span>
          </div>

          {/* Hero text */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight mb-4">
            Manage Your Visitors{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              Effortlessly
            </span>
          </h1>

          <p className="text-slate-500 text-lg mb-10 leading-relaxed">
            A smart visitor management system to register, track, and manage visitor information
            quickly and securely — from personal details to purpose of visit.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/form"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 transition-all"
            >
              Register as Visitor
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-2xl border border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold text-sm transition-all"
            >
              Admin Login
            </Link>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
            {[
              { icon: "👤", title: "Easy Registration", desc: "Multi-step form for smooth visitor onboarding." },
              { icon: "📋", title: "Purpose Tracking", desc: "Record visit purpose — medical, education, business & more." },
              { icon: "🔒", title: "Secure & Fast", desc: "Role-based access for admins and visitors." },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm text-left hover:shadow-md hover:border-orange-200 transition-all"
              >
                <span className="text-2xl mb-3 block">{f.icon}</span>
                <h3 className="font-bold text-slate-800 text-sm mb-1">{f.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </main>
    </>
  );
}
