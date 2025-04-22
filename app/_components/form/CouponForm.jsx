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
import {supabase} from "../../../utils/supabase/client";

const CouponForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("merch")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setMessage("Email found! Please provide your details.");
        setIsDialogOpen(true); // Open dialog
      } else {
        setError("Email not found in the merch table.");
      }
    } catch (err) {
      console.error("Error querying merch table:", err);
      setError("An error occurred while searching for the email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Example: Save name and phone to Supabase (adjust table/columns as needed)
      const { error } = await supabase
        .from("merch")
        .update({ name, phone })
        .eq("email", email);

      if (error) throw error;

      setMessage("Details submitted successfully!");
      setIsDialogOpen(false);
      setName("");
      setPhone("");
    } catch (err) {
      console.error("Error saving details:", err);
      setError("Failed to submit details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/bg/world.png')`,
        }}
      >
        <div className="w-full max-w-md rounded-lg bg-white/80 p-6 shadow-md backdrop-blur-sm">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
            Confirm Your Email
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
                className="mt-1 w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            {message && <p className="text-green-600 text-sm">{message}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-black text-white hover:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              style={{ border: "2px solid #22c55e" }}
            >
              {isLoading ? "Searching..." : "Confirm Email"}
            </Button>
          </form>
        </div>
      </div>

      {/* Dialog for Name and Phone Number */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                placeholder="Enter your phone number"
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
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-black text-white hover:bg-gray-900"
                style={{ border: "2px solid #22c55e" }}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponForm;