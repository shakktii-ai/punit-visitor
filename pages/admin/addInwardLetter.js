import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import InwardLetterForm from "@/components/InwardLetterForm";

export default function AdminAddInwardLetter() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");
    const allowedPagesStr = localStorage.getItem("allowedPages");
    const allowedPages = allowedPagesStr ? JSON.parse(allowedPagesStr) : [];

    if (role !== "admin") {
      router.push("/login");
    } else if (username !== "admin" && !allowedPages.includes("/admin/inward-letters")) {
      router.push("/admin");
    }
  }, [router]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const username = localStorage.getItem("username") || "admin";
      const payload = {
        ...formData,
        createdBy: "admin",
        addedBy: username,
      };

      const res = await fetch("/api/inward-letters/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Inward letter registered successfully!");
        router.push("/admin/inward-letters");
      } else {
        toast.error(data.message || "Failed to register inward letter.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register Inward Letter – Saheb Inward letters Admin</title>
      </Head>
      <InwardLetterForm
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        backPath="/admin/inward-letters"
        createdBy="admin"
      />
    </>
  );
}
