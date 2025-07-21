"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import { supabase } from "../../../utils/supabase/client";

const CouponForm = () => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [claimedPhones, setClaimedPhones] = useState(new Set());

  const resetForm = () => {
    setPhone("");
    setEmail("");
    setMessage(null);
    setError(null);
    setName("");
    setLocation("");
    setIsLoading(false);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true);

    // Normalize phone number to match database format (e.g., 254716813545)
    let normalizedPhone = phone.replace(/[\s+]/g, "");
    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = "254" + normalizedPhone.slice(1);
    } else if (!normalizedPhone.startsWith("254")) {
      normalizedPhone = "254" + normalizedPhone;
    }

    try {
      const { data, error } = await supabase
        .from("merchembulw15")
        .select("status, code, contact")
        .eq("contact", normalizedPhone)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        if (data.status === "claimed") {
          if (claimedPhones.has(normalizedPhone)) {
            setError(
              "This phone number has already claimed a coupon and cannot be checked again."
            );
            setIsLoading(false);
            return;
          }
          setMessage(
            "Phone number has already claimed a coupon. Please provide your details to resend the coupon code."
          );
          setIsDialogOpen(true);
          setClaimedPhones((prev) => new Set(prev).add(normalizedPhone));
        } else {
          setMessage("Phone number found! Please provide your details.");
          setIsDialogOpen(true);
        }
      } else {
        setError(
          "Your phone number is missing, you did not provide your phone number or there is a typo. Contact Godfrey."
        );
      }
    } catch (err) {
      console.error("Error querying merch table:", err);
      setError("An error occurred while searching for the phone number.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendWhatsAppMessage = async (phone, code) => {
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
      const message = `Thank you for claiming your Supabase LW15 coupon! 🎉\n\nHere is your LW15 T-Shirt Coupon Code: ${code}\nCheckout here: https://supabase.store/ \n \n For support, contact: +254 716 813 545 \n Support on X: https://x.com/chepparing\n\n Let's build with Supabase!`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, "_blank");
      return true;
    } catch (err) {
      console.error("Error sending WhatsApp message:", err);
      return false;
    }
  };

  const handleDialogSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Normalize phone number to match database format (e.g., 254716813545)
      let normalizedPhone = phone.replace(/[\s+]/g, "");
      if (normalizedPhone.startsWith("0")) {
        normalizedPhone = "254" + normalizedPhone.slice(1);
      } else if (!normalizedPhone.startsWith("254")) {
        normalizedPhone = "254" + normalizedPhone;
      }

      console.log("Querying with phone:", normalizedPhone);

      const { data: couponData } = await supabase
        .from("merchembulw15")
        .select("code, status")
        .eq("contact", normalizedPhone)
        .single();

      if (!couponData?.code) {
        throw new Error("No coupon code found");
      }

      const { error } = await supabase
        .from("merchembulw15")
        .update({
          name,
          email,
          location,
          status: couponData.status === "claimed" ? "claimed" : "claimed",
        })
        .eq("contact", normalizedPhone);

      if (error) throw error;

      const messageSent = await sendWhatsAppMessage(normalizedPhone, couponData.code);

      if (messageSent) {
        setMessage(
          couponData.status === "claimed"
            ? "Coupon code resent successfully! Check your WhatsApp for details."
            : "Coupon claimed successfully! Check your WhatsApp for details."
        );
      } else {
        setMessage(
          couponData.status === "claimed"
            ? "Coupon code resent, but failed to send WhatsApp message. Please note your coupon code: " +
              couponData.code
            : "Coupon claimed, but failed to send WhatsApp message. Please note your coupon code: " +
              couponData.code
        );
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error saving details:", err);
      setError("Failed to process coupon: " + err.message);
      setIsDialogOpen(false);
      resetForm();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div>
      <div
        className="flex min-h-screen mt-18 bg-black items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/bg/edge.svg')`,
        }}
      >
        <div className="w-full max-w-md rounded-lg bg-white/80 p-6 shadow-md backdrop-blur-sm">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
            Claim Your LW15 Tshirt Coupon
          </h2>
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-lg font-medium text-gray-700 mb-4"
              >
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number (e.g., +254716813545 or 0716813545)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                pattern="(\+?254|0)[0-9]{9}"
                className="mt-1 w-full bg-white rounded-md focus:border-green-500 focus:ring-green-500"
              />
            </div>
            {message && <p className="text-green-600 text-sm">{message}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-black text-white hover:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              style={{ border: "0.5px solid #22c55e" }}
            >
              {isLoading ? "Searching..." : "Confirm Phone Number"}
            </Button>
          </form>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Your Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDialogSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
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
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email (e.g., example@domain.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full"
              />
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location
              </label>
              <Input
                id="location"
                type="text"
                placeholder="Enter your location (e.g., Nairobi, Kenya)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="mt-1 w-full"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-black text-white hover:bg-gray-900"
                style={{ border: "2px solid #22c55e" }}
              >
                {isLoading ? "Processing..." : "Submit Details"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponForm;