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

  const ticketPrice = 1; // Price per ticket in KES
  const totalAmount = parseInt(tickets) * ticketPrice;
  const invoice = `INV-${Date.now()}`; // Unique invoice ID

  const handleCheckout = () => {
    if (!name || !tickets) {
      setError("Please provide your name and select the number of tickets.");
      return;
    }
    setError(null);
    setShowPaymentSection(true);
  };

  const handlePayment = async () => {
    if (!phoneNumber) {
      setError("Please enter your phone number.");
      return;
    }

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
      amount: totalAmount,
      external_reference: invoice,
    };

    try {
      // Initiate M-Pesa STK push
      const response = await fetch("https://cheppar.co.ke/cheppar/authPay.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const responseData = await response.json();
      console.log("Handle Payment Response:", responseData);

      if (!responseData.success || responseData.status !== "QUEUED") {
        throw new Error(responseData.message || "Payment initiation failed.");
      }

      setMessage("Please wait for an M-Pesa prompt.");

      // Save reservation to Supabase
      const { error: supabaseError } = await supabase.from("reservations").insert({
        event_id: "lw14",
        name,
        tickets: parseInt(tickets),
        phone: phoneNumber,
        status: "pending",
        amount: totalAmount,
        mpesacode: null,
        external_reference: invoice,
      });

      if (supabaseError) {
        console.error("Supabase insert error:", supabaseError);
        throw new Error(`Failed to save reservation: ${supabaseError.message}`);
      }

      // Poll payment status
      setTimeout(() => {
        pollPaymentStatus(invoice);
      }, 5000);
    } catch (err) {
      console.error("Error processing payment:", err);
      setIsProcessing(false);
      setError(err.message || "There was an error processing your payment request.");
    }
  };

  const pollPaymentStatus = async (userReference, retryCount = 15, interval = 10000) => {
    if (retryCount <= 0) {
      setIsProcessing(false);
      setError("Payment verification timed out. Please check your M-Pesa balance or try again.");
      return;
    }

    try {
      // Query gaspayments table for payment status
      const { data: paymentData, error: paymentError } = await supabase
        .from("gaspayments")
        .select("status, transaction_code")
        .eq("user_reference", userReference)
        .single();

      console.log("GasPayments Query Response:", { paymentData, paymentError });

      if (paymentError || !paymentData) {
        console.warn("Payment not found or error:", paymentError?.message || "No payment record");
        setTimeout(() => {
          pollPaymentStatus(userReference, retryCount - 1, interval);
        }, interval);
        return;
      }

      // Check if payment is successful
      if (paymentData.status === "Paid" || paymentData.status === true) {
        setIsProcessing(false);
        const transactionCode = paymentData.transaction_code;

        // Update reservations table
        const { error: updateError } = await supabase
          .from("reservations")
          .update({
            status: "Paid",
            mpesacode: transactionCode,
          })
          .eq("external_reference", userReference);

        if (updateError) {
          console.error("Supabase update error:", updateError);
          throw new Error(`Failed to update reservation: ${updateError.message}`);
        }

        setMessage("Your payment has been processed successfully.");
        setTimeout(() => {
          router.push("/orders");
        }, 2000);
      } else {
        // Payment not yet completed, retry
        setTimeout(() => {
          pollPaymentStatus(userReference, retryCount - 1, interval);
        }, interval);
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setIsProcessing(false);
      setError(error.message || "There was an error checking your payment status.");
    }
  };

  return (
    <div
      className="flex min-h-screen bg-black items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/bg/edge.svg')` }}
    >
      <div className="w-full max-w-md rounded-lg bg-white/80 p-6 shadow-md backdrop-blur-sm">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Reserve Your Seat</h2>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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
            <label htmlFor="tickets" className="block text-sm font-medium text-gray-700">
              Number of Tickets
            </label>
            <Select value={tickets} onValueChange={setTickets}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select tickets" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">Total Amount</p>
            <p className="text-gray-600">KES {totalAmount.toLocaleString()}</p>
          </div>
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