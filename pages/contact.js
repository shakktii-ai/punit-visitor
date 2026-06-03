import React, { useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import { HiMail, HiPhone, HiLocationMarker, HiPaperAirplane, HiCheckCircle } from "react-icons/hi";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    setIsSubmitting(true);
    // Simulate API request
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Message sent successfully!");
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 p-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300";
  const labelClass = "block text-slate-700 text-sm font-semibold mb-1.5";

  return (
    <>
      <Head>
        <title>Contact Us – VisitorPass</title>
        <meta name="description" content="Get in touch with Punit Joshi's office or the support team." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-slate-50 to-orange-100/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto text-base">
              Have questions, feedback, or need assistance? Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Details Card */}
            <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-3xl p-8 text-white shadow-xl shadow-orange-500/20 flex flex-col justify-between space-y-8 lg:col-span-1">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Contact Info</h2>
                  <p className="text-orange-100/80 text-sm mt-1">We are here to help you.</p>
                </div>

                <div className="space-y-6 pt-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
                      <HiMail />
                    </div>
                    <div>
                      <p className="text-xs text-orange-200">Email Address</p>
                      <a href="mailto:Shakktii.ai@gmail.com" className="text-sm font-semibold hover:underline break-all">
                        Shakktii.ai@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
                      <HiPhone />
                    </div>
                    <div>
                      <p className="text-xs text-orange-200">Phone Number</p>
                      <span className="text-sm font-semibold">+91 XXXXX XXXXX</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
                      <HiLocationMarker />
                    </div>
                    <div>
                      <p className="text-xs text-orange-200">Location</p>
                      <span className="text-sm font-semibold">Office of Punit Joshi, Maharashtra, India</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-orange-600 font-bold text-sm">
                    V
                  </div>
                  <span className="text-sm font-bold tracking-wide">VisitorPass Portal</span>
                </div>
              </div>
            </div>

            {/* Contact Form Card */}
            <div className="bg-white border border-orange-100/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 lg:col-span-2">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-500 text-4xl">
                    <HiCheckCircle />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-800">Thank You!</h3>
                    <p className="text-slate-500 text-sm max-w-sm">
                      Your message has been sent successfully. We will get back to you shortly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-all mt-4"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`${inputClass} ${errors.name ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : ""}`}
                        placeholder="John Doe"
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${inputClass} ${errors.email ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : ""}`}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`${inputClass} ${errors.phone ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : ""}`}
                        placeholder="10-digit number"
                      />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="What's this about?"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className={`${inputClass} resize-none ${errors.message ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : ""}`}
                      placeholder="Write your message here..."
                    />
                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm shadow-md shadow-orange-500/10 flex items-center justify-center gap-2 disabled:opacity-75 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <HiPaperAirplane className="rotate-90 text-sm" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
