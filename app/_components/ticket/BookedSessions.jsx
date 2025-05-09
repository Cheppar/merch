"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle } from "lucide-react";

export default function BookedSessions() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phone, setPhone] = useState("");

  const eventDetails = {
    name: "E-Counselling Session with Maks Psychologists",
    bgImage: "/bg/edge.svg",
  };

  const fetchBookings = async () => {
    if (!phone) {
      setError("Please enter your phone number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, name, session_type, date, time, venue, amount, external_reference, phone, alt_contact")
        .eq("phone", phone)
        .eq("status", "Paid")
        .order("id", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setBookings(data || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const shareViaWhatsApp = (booking) => {
    const message = `Your ${booking.session_type} e-counselling session is confirmed!\nName: ${booking.name}\nAmount: KES ${booking.amount}\n${
      booking.session_type === "virtual"
        ? `Date: ${booking.date}\nTime: ${booking.time}\nAlt Contact: ${booking.alt_contact}`
        : `Venue: ${booking.venue}`
    }\nRef: ${booking.external_reference}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${booking.phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div
      className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${eventDetails.bgImage})` }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-6 text-center">
          Your Booked E-Counselling Sessions
        </h1>

        <div className="mb-6 flex gap-4">
          <Input
            type="tel"
            placeholder="Enter phone number (e.g., +254722XXXXXX)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full"
          />
          <Button
            onClick={fetchBookings}
            disabled={loading}
            className="bg-blue-500 text-white hover:bg-blue-600"
            style={{ border: "0.5px solid #4ade80" }}
          >
            {loading ? "Loading..." : "Fetch Sessions"}
          </Button>
        </div>

        {error && <p className="text-red-600 text-center text-sm sm:text-base">{error}</p>}

        {!loading && bookings.length === 0 && !error && (
          <p className="text-center text-gray-600">
            No booked sessions found for this phone number.
          </p>
        )}

        {!loading && bookings.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {bookings.map((booking) => (
              <Card
                key={booking.id}
                className="relative overflow-hidden bg-blue-50/90 shadow-lg"
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-lg sm:text-xl text-blue-600">
                    {eventDetails.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center text-gray-700">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Name</p>
                    <p className="text-base font-semibold">{booking.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Session Type</p>
                    <p className="text-base font-semibold">
                      {booking.session_type.charAt(0).toUpperCase() + booking.session_type.slice(1)}
                    </p>
                  </div>
                  {booking.session_type === "virtual" ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-blue-700">Date</p>
                        <p className="text-base">{booking.date}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-700">Time</p>
                        <p className="text-base">{booking.time}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-700">Alternative Contact</p>
                        <p className="text-base">{booking.alt_contact}</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-blue-700">Venue</p>
                      <p className="text-base">{booking.venue.charAt(0).toUpperCase() + booking.venue.slice(1)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-blue-700">Amount</p>
                    <p className="text-base">KES {booking.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Reference</p>
                    <p className="text-base">{booking.external_reference}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100"
                    onClick={() => shareViaWhatsApp(booking)}
                    style={{ border: "0.5px solid #4ade80" }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Share via WhatsApp
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}