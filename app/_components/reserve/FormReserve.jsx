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
import { useRouter } from "next/navigation";

export default function Reserve() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tickets, setTickets] = useState("1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPaymentSection, setShowPaymentSection] = useState(false);

  const ticketPrice = 1; // Price per ticket in KES (adjust as needed)
  const totalAmount = parseInt(tickets) * ticketPrice;
  const invoice = `INV-${Date.now()}`; // Generate unique invoice ID (replace with your logic)

  const handleCheckout = () => {
    if (!name || !tickets) {
      setError("Please provide your name and select the number of tickets.");
      return;
    }
    setError(null);
    setShowPaymentSection(true); // Show phone number input for M-Pesa
  };

  const handlePayment = async () => {
    if (!phoneNumber) {
      setError("Please enter your phone number.");
      return;
    }

    // Validate phone number (basic Kenyan format)
    const phoneRegex = /^(?:\+254|0)7\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid Kenyan phone number (e.g., 0722XXXXXX or +254722XXXXXX)");
      return;
    }

    setIsProcessing(true);
    setMessage(null);
    setError(null);

    const paymentData = {
      phone_number: phoneNumber.startsWith("0") ? `+254${phoneNumber.slice(1)}` : phoneNumber,
      amount: totalAmount, // Use totalAmount instead of 1
      external_reference: invoice,
    };

    try {
      // Initiate M-Pesa STK push via Payhero
      const response = await fetch("https://cheppar.co.ke/cheppar/authPay.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      const responseData = await response.json();
      console.log("Handle Payment Response:", responseData);

      if (responseData.success && responseData.status === "QUEUED") {
        setMessage("Please wait for an M-Pesa prompt.");
        // Save reservation to Supabase with pending status
        const { error: supabaseError } = await supabase.from("reservations").insert({
          event_id: "lw14", // Replace with your event ID
          name,
          tickets: parseInt(tickets),
          phone: phoneNumber,
          status: "pending",
          amount: totalAmount,
          mpesacode: null, // Will be updated later
        });

        if (supabaseError) throw supabaseError;

        // Poll payment status
        setTimeout(() => {
          pollPaymentStatus(invoice);
        }, 5000);
      } else {
        setIsProcessing(false);
        setError("Payment failed. Please check your balance and try again.");
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setIsProcessing(false);
      setError("There was an error processing your payment request.");
    }
  };

  const pollPaymentStatus = async (userReference, retryCount = 15, interval = 10000) => {
    if (retryCount <= 0) {
      setIsProcessing(false);
      setError("Payment failed. Check your PIN and balance.");
      return;
    }

    try {
      const response = await fetch(
        `https://cheppar.co.ke/cheppar/payment_status.php?user_reference=${userReference}`
      );
      const responseData = await response.json();
      console.log("Payment Status Response:", responseData);

      if (responseData.success && responseData.payment.status) {
        setIsProcessing(false);
        const mpesaReference = responseData.payment.mpesa_reference;

        // Update reservation with status and M-Pesa code
        const { error: updateError } = await supabase
          .from("reservations")
          .update({
            status: "confirmed",
            mpesacode: mpesaReference,
          })
          .eq("phone", phoneNumber)
          .eq("event_id", "lw14");

        if (updateError) throw updateError;

        setMessage("Payment processed successfully!");
        setTimeout(() => {
          router.push("/orders"); // Redirect to orders page
        }, 2000);
      } else {
        setTimeout(() => {
          pollPaymentStatus(userReference, retryCount - 1, interval);
        }, interval);
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setIsProcessing(false);
      setError("There was an error checking your payment status.");
    }
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
              className="mt-1 w-full"
            />
          </div>

          {/* Number of Tickets Selector */}
          <div>
            <label htmlFor="tickets" className="block text-sm font-medium text-gray-700">
              Number of Tickets
            </label>
            <Select value={tickets} onValueChange={setTickets}>
              <SelectTrigger className="mt-1 w-full">
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
              disabled={isProcessing}
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
                <p className="text-sm text-gray-600 text-center">
                  An M-Pesa prompt of KES{" "}
                  <span className="font-bold">{totalAmount.toLocaleString()}</span> will appear.
                </p>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number (M-Pesa)
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., 0722XXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="mt-1 w-full"
                />
              </div>
              <Button
                type="button"
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full rounded-md bg-black text-white hover:bg-gray-900"
                style={{ border: "0.5px solid #22c55e" }}
              >
                {isProcessing ? "Processing..." : "Pay with M-Pesa"}
              </Button>
            </div>
          )}

          {/* Messages */}
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}