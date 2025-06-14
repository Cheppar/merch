// app/orders/page.js
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phone, setPhone] = useState("");

  const eventDetails = {
    name: "LiveWire Event",
    date: "2025-05-10",
    venue: "Nairobi Convention Center",
    bgImage: "/ticket-bg.jpg",
  };

  const fetchOrders = async () => {
    if (!phone) {
      setError("Please enter your phone number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("id, name, tickets, external_reference, phone")
        .eq("phone", phone)
        .eq("status", "Paid")
        .order("id", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setOrders(data || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const shareViaWhatsApp = (order) => {
    const message = `Your ticket for ${eventDetails.name} is confirmed!\nName: ${order.name}\nAdmits: ${order.tickets} ${order.tickets === 1 ? "Person" : "People"}\nDate: ${eventDetails.date}\nVenue: ${eventDetails.venue}\nRef: ${order.external_reference}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${order.phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Your Purchased Tickets
        </h1>

        <div className="mb-6 flex gap-4">
          <Input
            type="tel"
            placeholder="Enter phone number (e.g., +254722XXXXXX)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full"
          />
          <Button onClick={fetchOrders} disabled={loading}>
            {loading ? "Loading..." : "Fetch Tickets"}
          </Button>
        </div>

        {error && <p className="text-red-600 text-center text-sm sm:text-base">{error}</p>}

        {!loading && orders.length === 0 && !error && (
          <p className="text-center text-gray-600">
            No purchased tickets found for this phone number.
          </p>
        )}

        {!loading && orders.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="relative overflow-hidden bg-cover bg-center shadow-lg"
                style={{ backgroundImage: `url(${eventDetails.bgImage})` }}
              >
                <div className="absolute inset-0 bg-black/50" />
                <CardHeader className="relative z-10 text-center">
                  <CardTitle className="text-lg sm:text-xl text-white">
                    {eventDetails.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4 text-center text-white">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-base font-semibold">{order.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Admits</p>
                    <p className="text-base font-semibold">
                      {order.tickets} {order.tickets === 1 ? "Person" : "People"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-base">{eventDetails.date}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Venue</p>
                    <p className="text-base">{eventDetails.venue}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reference</p>
                    <p className="text-base">{order.external_reference}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto bg-white text-black hover:bg-gray-200"
                    onClick={() => shareViaWhatsApp(order)}
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