"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {supabase} from "./../../../utils/supabase/client"
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Nakurueth() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [question, setQuestion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !mobile) {
      setError("Please fill in all required fields.");
      return;
    }

    const phoneRegex = /^(?:\+254|0)7\d{8}$/;
    if (!phoneRegex.test(mobile)) {
      setError("Please enter a valid Kenyan phone number (e.g., 0722XXXXXX or +254722XXXXXX)");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsProcessing(true);
    setMessage(null);
    setError(null);

    try {
      // Save reservation to Supabase nakuruETH table
      const { error: supabaseError } = await supabase.from("nakurueth").insert({
        name,
        email,
        mobile: mobile.startsWith("0") ? `+254${mobile.slice(1)}` : mobile,
        question,
      });

      if (supabaseError) {
        console.error("Supabase insert error:", supabaseError);
        throw new Error(`Failed to save reservation: ${supabaseError.message}`);
      }

      setMessage("Your reservation has been successfully submitted!");
      setTimeout(() => {
        router.push("/ticket");
      }, 2000);
    } catch (err) {
      console.error("Error processing reservation:", err);
      setError(err.message || "There was an error processing your reservation.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="flex px-4 sm:px-6 md:px-8 min-h-screen bg-black items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/bg/edge.svg')` }}
    >
      <div className="w-full max-w-md rounded-lg bg-white/80 p-6 shadow-md backdrop-blur-sm">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Reserve Your Free Seat</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <Input
              id="mobile"
              type="tel"
              placeholder="e.g., 0722XXXXXX"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700">Question * </label>
            <Input
              id="question"
              type="text"
              placeholder="Any questions about the event?"
              value={question}
              required
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1 w-full"
            />
          </div>
          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full rounded-md bg-black text-white hover:bg-gray-900"
            style={{ border: "0.5px solid #22c55e" }}
          >
            {isProcessing ? "Processing..." : "Reserve Seat"}
          </Button>
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {isProcessing && (
            <div className="flex justify-center">
              <div className="w-6 h-6 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin"></div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}