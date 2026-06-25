import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";
import LetterForm from "@/components/LetterForm";
import "react-toastify/dist/ReactToastify.css";

export default function EditLetterAdmin() {
  const router = useRouter();
  const { id } = router.query;
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/login");
      return;
    }

    if (id) {
      fetchLetter();
    }
  }, [id, router]);

  const fetchLetter = async () => {
    setLoading(true);
    try {
      const username = localStorage.getItem("username") || "admin";
      const res = await fetch(`/api/letters?id=${id}`, {
        headers: {
          "x-user-role": "admin",
          "x-username": username,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLetter(data.letter);
      } else {
        toast.error("Failed to load letter details.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const username = localStorage.getItem("username") || "admin";
      const res = await fetch(`/api/letters?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin",
          "x-username": username,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Letter details updated successfully!");
        setTimeout(() => {
          router.push("/admin/letters");
        }, 1500);
      } else {
        toast.error(data.error || "Failed to update information.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error occurred while updating information.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Edit Letter Details – Admin Panel</title>
        <meta name="description" content="Edit inward letter form for Admin." />
      </Head>

      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : letter ? (
        <LetterForm
          initialData={letter}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          backPath="/admin/letters"
          createdBy="admin"
        />
      ) : (
        <div className="text-center py-20 text-slate-500">Letter not found.</div>
      )}
    </>
  );
}
