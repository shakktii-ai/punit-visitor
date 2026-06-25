import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";
import LetterForm from "@/components/LetterForm";
import "react-toastify/dist/ReactToastify.css";

export default function AddLetterAdmin() {
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

      const res = await fetch("/api/letters/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Letter registered successfully!");
        setTimeout(() => {
          router.push("/admin/letters");
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
        <title>Letter Registration – Admin Panel</title>
        <meta name="description" content="Inward letter registration form for Admin." />
      </Head>

      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />

      <LetterForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        backPath="/admin/letters"
        createdBy="admin"
      />
    </>
  );
}
