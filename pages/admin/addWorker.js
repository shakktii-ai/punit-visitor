import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";
import WorkerForm from "@/components/WorkerForm";
import "react-toastify/dist/ReactToastify.css";

export default function AddWorker() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const username = localStorage.getItem("username") || "admin";
      const payload = {
        ...formData,
        createdBy: "admin",
        addedBy: username,
      };

      const res = await fetch("/api/workers/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Worker registered successfully!");
        setTimeout(() => {
          router.push("/admin/workers");
        }, 1500);
      } else {
        toast.error(data.message || "Failed to submit registration.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Worker Registration – Punit Joshi</title>
        <meta name="description" content="Worker registration form for admin panel." />
      </Head>

      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />

      <WorkerForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        backPath="/admin/workers"
        createdBy="admin"
      />
    </>
  );
}
