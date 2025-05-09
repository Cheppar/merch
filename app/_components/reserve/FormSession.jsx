"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookSession() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sessionType, setSessionType] = useState("virtual");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [altContact, setAltContact] = useState("");
  const [venue, setVenue] = useState("office");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPaymentSection, setShowPaymentSection] = useState(false);

  const prices = { virtual: 500, physical: 2000 };
  const totalAmount = prices[sessionType];
  const invoice = `INV-${Date.now()}`;

  const handleCheckout = () => {
    if (!name) {
      setError("Please provide your name.");
      return;
    }
    if (sessionType === "virtual" && (!date || !time || !altContact)) {
      setError("Please provide date, time, and alternative contact for virtual sessions.");
      return;
    }
    if (sessionType === "virtual") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^(?:\+254|0)7\d{8}$/;
      if (!emailRegex.test(altContact) && !phoneRegex.test(altContact)) {
        setError("Please provide a valid email or Kenyan phone number for alternative contact.");
        return;
      }
    }
    if (sessionType === "physical" && !venue) {
      setError("Please select a venue for physical sessions.");
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
      if (!responseData.success || responseData.status !== "QUEUED") {
        throw new Error(responseData.message || "Payment initiation failed.");
      }

      setMessage("Please wait for an M-Pesa prompt.");

      // Save booking to Supabase
      const bookingData = {
        event_id: "counselling_session",
        name,
        session_type: sessionType,
        phone: phoneNumber,
        status: "pending",
        amount: totalAmount,
        mpesacode: null,
        external_reference: invoice,
        ...(sessionType === "virtual" && { date, time, alt_contact: altContact }),
        ...(sessionType === "physical" && { venue }),
      };

      const { error: supabaseError } = await supabase.from("bookings").insert(bookingData);
      if (supabaseError) {
        throw new Error(`Failed to save booking: ${supabaseError.message}`);
      }

      // Poll payment status
      setTimeout(() => {
        pollPaymentStatus(invoice);
      }, 5000);
    } catch (err) {
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
      const { data: paymentData, error: paymentError } = await supabase
        .from("gaspayments")
        .select("status, mpesa_reference")
        .eq("user_reference", userReference)
        .single();

      if (paymentError || !paymentData) {
        setTimeout(() => {
          pollPaymentStatus(userReference, retryCount - 1, interval);
        }, interval);
        return;
      }

      if (paymentData.status === true) {
        setIsProcessing(false);
        const mpesaReference = paymentData.mpesa_reference;

        const { error: updateError } = await supabase
          .from("bookings")
          .update({ status: "Paid", mpesacode: mpesaReference })
          .eq("external_reference", userReference);

        if (updateError) {
          throw new Error(`Failed to update booking: ${updateError.message}`);
        }

        setMessage("Your payment has been processed successfully.");
        setTimeout(() => {
          router.push("/confirmation");
        }, 2000);
      } else {
        setTimeout(() => {
          pollPaymentStatus(userReference, retryCount - 1, interval);
        }, interval);
      }
    } catch (error) {
      setIsProcessing(false);
      setError(error.message || "There was an error checking your payment status.");
    }
  };

  return (
    <div
      className="flex min-h-screen bg-gray-100 px-4 sm:px-6 md:px-8 items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/bg/edge.svg')` }}
    >
      <div className="w-full max-w-md rounded-lg bg-blue-50/90 p-6 shadow-md backdrop-blur-sm">
        <h2 className="mb-6 text-center text-2xl font-bold text-blue-600">
          Book an E-Session with Us
        </h2>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <Tabs defaultValue="virtual" onValueChange={setSessionType} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="virtual">Virtual (KES 500)</TabsTrigger>
              <TabsTrigger value="physical">Physical (KES 2000)</TabsTrigger>
            </TabsList>
            <TabsContent value="virtual" className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-blue-700">
                  Date
                </label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="mt-1 w-full"
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-blue-700">
                  Time
                </label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="mt-1 w-full"
                />
              </div>
              <div>
                <label htmlFor="altContact" className="block text-sm font-medium text-blue-700">
                  Alternative Contact (Email or Phone)
                </label>
                <Input
                  id="altContact"
                  type="text"
                  placeholder="e.g., email@example.com or 0722XXXXXX"
                  value={altContact}
                  onChange={(e) => setAltContact(e.target.value)}
                  required
                  className="mt-1 w-full"
                />
              </div>
            </TabsContent>
            <TabsContent value="physical" className="space-y-4">
              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-blue-700">
                  Venue
                </label>
                <Select value={venue} onValueChange={setVenue}>
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="elsewhere">Elsewhere</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-blue-700">
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
          <div>
            <p className="text-lg font-medium text-blue-700">Total Amount</p>
            <p className="text-gray-600">KES {totalAmount.toLocaleString()}</p>
          </div>
          {!showPaymentSection && (
            <Button
              type="button"
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
              style={{ border: "0.5px solid #4ade80" }}
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
                <label htmlFor="phone" className="block text-sm font-medium text-blue-700">
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
                className="w-full bg-blue-500 text-white hover:bg-blue-600"
                style={{ border: "0.5px solid #4ade80" }}
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