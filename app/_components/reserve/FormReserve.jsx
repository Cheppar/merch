"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/utils/supabase/client";
import { useState } from "react";

export default function Reserve() {
  const [name, setName] = useState("");
  const [tickets, setTickets] = useState("1");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPaymentSection, setShowPaymentSection] = useState(false);

  const ticketPrice = 1000; // Price per ticket in KES (adjust as needed)
  const totalAmount = parseInt(tickets) * ticketPrice;

  const handleCheckout = () => {
    if (!name || !tickets) {
      setError("Please provide your name and select the number of tickets.");
      return;
    }
    setError(null);
    setShowPaymentSection(true); // Show phone number input for M-Pesa
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    // Validate phone number (basic Kenyan format check)
    const phoneRegex = /^(?:\+254|0)7\d{8}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid Kenyan phone number (e.g., 0716XXXXXX or +254716XXXXXX)");
      setIsLoading(false);
      return;
    }

    try {
      // Save reservation to Supabase
      const { error: supabaseError } = await supabase.from("reservations").insert({
        event_id: "lw14", // Replace with your event ID
        name,
        tickets: parseInt(tickets),
        phone,
        status: "pending", // Update to "confirmed" after payment
        amount: totalAmount,
      });

      if (supabaseError) throw supabaseError;

      // Simulate M-Pesa STK push (replace with actual API call)
      const formattedPhone = phone.startsWith("0") ? `+254${phone.slice(1)}` : phone;
      const paymentResponse = await initiateMpesaPayment(formattedPhone, totalAmount);

      if (paymentResponse.success) {
        // Update reservation status to confirmed
        await supabase
          .from("reservations")
          .update({ status: "confirmed" })
          .eq("phone", phone)
          .eq("event_id", "lw14");

        setMessage("Payment initiated successfully! Check your phone for the M-Pesa STK push.");
        setName("");
        setTickets("1");
        setPhone("");
        setShowPaymentSection(false);
      } else {
        throw new Error("Failed to initiate M-Pesa payment.");
      }
    } catch (err) {
      console.error("Error processing reservation:", err);
      setError("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder for M-Pesa STK push API call
  const initiateMpesaPayment = async (phone, amount) => {
    // Replace with actual M-Pesa Daraja API integration
    // Example: https://developer.safaricom.co.ke/APIs/STKPush
    console.log(`Initiating M-Pesa STK push to ${phone} for KES ${amount}`);
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true }); // Simulate success
      }, 1000);
    });
  };

  return (
    <div
      className="flex min-h-screen bg-black items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/bg/edge.svg')` }}
    >
      <div className="w-full max-w-md rounded-lg bg-white/80 p-6 shadow-md backdrop-blur-sm">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Reserve Your Seat
        </h2>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full bg-white "
              style={{ border: "0.5px solidrgb(23, 25, 24)" }}
            />
          </div>

          {/* Number of Tickets Selector */}
          <div>
            <label htmlFor="tickets" className="block text-sm font-medium text-gray-700">
              Number of Tickets
            </label>
            <Select value={tickets} onValueChange={setTickets}>
              <SelectTrigger className="mt-1 w-full bg-white/80">
                <SelectValue placeholder="Select tickets" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Total Amount */}
          <div>
            <p className="text-lg font-medium text-gray-700">Total Amount</p>
            <p className="text-gray-600">KES {totalAmount.toLocaleString()}</p>
          </div>

          {/* Checkout Button */}
          {!showPaymentSection && (
            <Button
              type="button"
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full rounded-md bg-black text-white hover:bg-gray-900"
              style={{ border: "0.5px solid #22c55e" }}
            >
              Checkout
            </Button>
          )}

          {/* Payment Section (Phone Number + M-Pesa) */}
          {showPaymentSection && (
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number (M-Pesa)
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., 0716XXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-1 w-full"
                />
              </div>
              <Button
                type="submit"
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full rounded-md bg-black text-white hover:bg-gray-900"
                style={{ border: "0.5px solid #22c55e" }}
              >
                {isLoading ? "Processing..." : "Pay with M-Pesa"}
              </Button>
            </div>
          )}

          {/* Messages */}
          {message && <p className="text-green-600 text-sm">{message}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </div>
    </div>
  );
}