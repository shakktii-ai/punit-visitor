import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import WorkerForm from "@/components/WorkerForm";

export default function AddWorkerUser() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "user") {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const username = localStorage.getItem("username") || "user";
      const payload = {
        ...formData,
        createdBy: "user",
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
          router.push("/workers");
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
        <title>New Worker Registration – Punit Joshi</title>
        <meta name="description" content="Add a new worker under your management." />
      </Head>

      <WorkerForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        backPath="/workers"
        createdBy="user"
      />
    </>
  );
}
