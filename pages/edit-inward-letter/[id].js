import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import InwardLetterForm from "@/components/InwardLetterForm";

export default function EditInwardLetterUser() {
  const router = useRouter();
  const { id } = router.query;

  const [letterData, setLetterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const allowedPagesStr = localStorage.getItem("allowedPages");
    const allowedPages = allowedPagesStr ? JSON.parse(allowedPagesStr) : [];

    if (role !== "user") {
      router.push("/login");
    } else if (!allowedPages.includes("/inward-letters")) {
      router.push("/form");
    }
  }, [router]);

  useEffect(() => {
    if (!id) return;

    const fetchLetter = async () => {
      setLoading(true);
      try {
        const username = localStorage.getItem("username") || "";
        const res = await fetch(`/api/inward-letters?id=${id}`, {
          headers: {
            "x-user-role": "user",
            "x-username": username,
          },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setLetterData(data.letter);
        } else {
          toast.error(data.error || "Failed to load letter details.");
          router.push("/inward-letters");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchLetter();
  }, [id, router]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const username = localStorage.getItem("username") || "";
      const res = await fetch(`/api/inward-letters?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "user",
          "x-username": username,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Inward letter updated successfully!");
        router.push("/inward-letters");
      } else {
        toast.error(data.error || "Failed to update inward letter.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Inward Letter – Saheb Inward letters</title>
      </Head>
      <InwardLetterForm
        initialData={letterData}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        backPath="/inward-letters"
        createdBy="user"
      />
    </>
  );
}
