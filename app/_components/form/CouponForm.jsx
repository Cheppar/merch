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
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [claimedEmails, setClaimedEmails] = useState(new Set()); // Track claimed emails

  const resetForm = () => {
    setEmail("");
    setMessage(null);
    setError(null);
    setName("");
    setPhone("");
    setIsLoading(false);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("merch")
        .select("email, status, code")
        .eq("email", email)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        if (data.status === "claimed") {
          if (claimedEmails.has(email)) {
            // If email was already checked once, block further attempts
            setError(
              "This email has already claimed a coupon and cannot be checked again."
            );
            setIsLoading(false);
            return;
          }
          // Allow one more check for claimed email
          setMessage(
            "Email has already claimed a coupon. Please provide your details to resend the coupon code."
          );
          setIsDialogOpen(true);
          setClaimedEmails((prev) => new Set(prev).add(email)); // Mark email as checked
        } else {
          // Unclaimed email, proceed normally
          setMessage("Email found! Please provide your details.");
          setIsDialogOpen(true);
        }
      } else {
        setError(
          "Your Email is missing, You did not provide your email or a typo. Contact Godfrey."
        );
      }
    } catch (err) {
      console.error("Error querying merch table:", err);
      setError("An error occurred while searching for the email.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendWhatsAppMessage = async (phone, code) => {
    try {
      const formattedPhone = phone.replace(/\s/g, "").startsWith("+")
        ? phone.replace(/\s/g, "")
        : `+254${phone.replace(/\s/g, "")}`;

      const message = `Thank you for claiming your Supabase LW14 coupon! 🎉\n\nHere is your LW14 T-Shirt Coupon Code: ${code}\nCheckout here: https://supabase.store/products/supalaunchweek14-dark-mode-tee \n \n For support, contact: +254 716 813 545 \n Support on X: https://x.com/chepparing\n\n Let's build with Supabase!`;
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
      // Get the coupon code and status
      const { data: couponData } = await supabase
        .from("merch")
        .select("code, status")
        .eq("email", email)
        .single();

      if (!couponData?.code) {
        throw new Error("No coupon code found");
      }

      // Update name and phone (status remains "claimed" if already claimed)
      const { error } = await supabase
        .from("merch")
        .update({
          name,
          phone,
          status: couponData.status === "claimed" ? "claimed" : "claimed",
        })
        .eq("email", email);

      if (error) throw error;

      // Send WhatsApp message
      const messageSent = await sendWhatsAppMessage(phone, couponData.code);

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
            Claim Your #LW14 Tshirt
          </h2>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-lg font-medium text-gray-700 mb-4"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              {isLoading ? "Searching..." : "Confirm Email"}
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
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="start with 0716 / 0112"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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