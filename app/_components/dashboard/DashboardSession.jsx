"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, MessageCircle } from "lucide-react";

export default function DashboardSession() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bookings from Supabase
  useEffect(() => {
    async function fetchBookings() {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("id, name, phone, session_type, date, time, venue, amount, external_reference, status, alt_contact")
          .order("date", { ascending: true });

        if (error) {
          throw new Error(error.message);
        }

        // Filter for upcoming sessions
        const now = new Date();
        const upcomingBookings = data.filter((booking) => {
          if (booking.session_type === "virtual" && booking.date && booking.time) {
            const sessionDateTime = new Date(`${booking.date}T${booking.time}`);
            return sessionDateTime > now;
          }
          // For physical sessions, assume they're upcoming if no date (or add date logic if needed)
          return true;
        });

        setBookings(upcomingBookings || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  // WhatsApp message handler
  const sendWhatsAppMessage = (phone, name, external_reference, session_type) => {
    const message = `Hello ${name}, your ${session_type} e-counselling session (Ref: ${external_reference}) is scheduled. How can we assist you?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  // Calculate hours until session
  const getHoursUntil = (date, time) => {
    if (!date || !time) return "N/A";
    const sessionDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const diffMs = sessionDateTime - now;
    if (diffMs < 0) return "Past";
    const hours = Math.round(diffMs / (1000 * 60 * 60));
    return `${hours} hours`;
  };

  // Filter bookings by session type and status
  const virtualBookings = bookings.filter((booking) => booking.session_type === "virtual" && booking.status === "Paid");
  const physicalBookings = bookings.filter((booking) => booking.session_type === "physical" && booking.status === "Paid");
  const pendingBookings = bookings.filter((booking) => booking.status === "pending");

  // Render booking card for mobile
  const renderBookingCard = (booking) => (
    <Card key={booking.id} className="mb-4 bg-blue-50/90">
      <CardHeader>
        <CardTitle className="text-lg text-blue-600">{booking.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p><strong className="text-blue-700">Session Type:</strong> {booking.session_type.charAt(0).toUpperCase() + booking.session_type.slice(1)}</p>
        {booking.session_type === "virtual" ? (
          <>
            <p><strong className="text-blue-700">Date:</strong> {booking.date}</p>
            <p><strong className="text-blue-700">Time:</strong> {booking.time}</p>
            <p><strong className="text-blue-700">Alt Contact:</strong> {booking.alt_contact}</p>
            <p className="flex items-center">
              <Bell className="h-4 w-4 mr-2 text-blue-600" />
              <strong className="text-blue-700">In:</strong> {getHoursUntil(booking.date, booking.time)}
            </p>
          </>
        ) : (
          <p><strong className="text-blue-700">Venue:</strong> {booking.venue.charAt(0).toUpperCase() + booking.venue.slice(1)}</p>
        )}
        <p><strong className="text-blue-700">Phone:</strong> {booking.phone}</p>
        <p><strong className="text-blue-700">Amount:</strong> KES {booking.amount.toLocaleString()}</p>
        <p><strong className="text-blue-700">Reference:</strong> {booking.external_reference}</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 bg-white text-blue-600 hover:bg-gray-100"
          onClick={() => sendWhatsAppMessage(booking.phone, booking.name, booking.external_reference, booking.session_type)}
          style={{ border: "0.5px solid #4ade80" }}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div
      className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/bg/edge.svg')` }}
    >
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-600 mb-4 sm:mb-6">
          Upcoming Sessions Dashboard
        </h1>

        {loading && (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin"></div>
          </div>
        )}

        {error && <p className="text-red-600 text-center text-sm sm:text-base">{error}</p>}

        {!loading && !error && (
          <Tabs defaultValue="virtual" className="w-full">
            <TabsList className="grid grid-cols-3 w-full sm:w-auto mb-4">
              <TabsTrigger value="virtual" className="text-sm sm:text-base">
                Virtual ({virtualBookings.length})
              </TabsTrigger>
              <TabsTrigger value="physical" className="text-sm sm:text-base">
                Physical ({physicalBookings.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-sm sm:text-base">
                Pending ({pendingBookings.length})
              </TabsTrigger>
            </TabsList>

            {/* Virtual Tab */}
            <TabsContent value="virtual">
              {/* Desktop: Table */}
              <div className="hidden sm:block">
                <ScrollArea className="h-[60vh] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Name</TableHead>
                        <TableHead className="text-xs sm:text-sm">Phone</TableHead>
                        <TableHead className="text-xs sm:text-sm">Date</TableHead>
                        <TableHead className="text-xs sm:text-sm">Time</TableHead>
                        <TableHead className="text-xs sm:text-sm">Alt Contact</TableHead>
                        <TableHead className="text-xs sm:text-sm">In</TableHead>
                        <TableHead className="text-xs sm:text-sm">Amount (KES)</TableHead>
                        <TableHead className="text-xs sm:text-sm">Reference</TableHead>
                        <TableHead className="text-xs sm:text-sm">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {virtualBookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-sm">
                            No upcoming virtual sessions found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        virtualBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="text-xs sm:text-sm">{booking.name}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{booking.phone}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{booking.date}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{booking.time}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{booking.alt_contact}</TableCell>
                            <TableCell className="text-xs sm:text-sm flex items-center">
                              <Bell className="h-4 w-4 mr-2 text-blue-600" />
                              {getHoursUntil(booking.date, booking.time)}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {booking.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {booking.external_reference}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  sendWhatsAppMessage(
                                    booking.phone,
                                    booking.name,
                                    booking.external_reference,
                                    booking.session_type
                                  )
                                }
                                className="text-blue-600 hover:bg-gray-100"
                                style={{ border: "0.5px solid #4ade80" }}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                WhatsApp
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              {/* Mobile: Cards */}
              <div className="block sm:hidden">
                {virtualBookings.length === 0 ? (
                  <p className="text-center text-sm">No upcoming virtual sessions found.</p>
                ) : (
                  virtualBookings.map(renderBookingCard)
                )}
              </div>
            </TabsContent>

            {/* Physical Tab */}
            <TabsContent value="physical">
              {/* Desktop: Table */}
              <div className="hidden sm:block">
                <ScrollArea className="h-[60vh] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Name</TableHead>
                        <TableHead className="text-xs sm:text-sm">Phone</TableHead>
                        <TableHead className="text-xs sm:text-sm">Venue</TableHead>
                        <TableHead className="text-xs sm:text-sm">Amount (KES)</TableHead>
                        <TableHead className="text-xs sm:text-sm">Reference</TableHead>
                        <TableHead className="text-xs sm:text-sm">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {physicalBookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-sm">
                            No upcoming physical sessions found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        physicalBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="text-xs sm:text-sm">{booking.name}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{booking.phone}</TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {booking.venue.charAt(0).toUpperCase() + booking.venue.slice(1)}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {booking.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {booking.external_reference}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  sendWhatsAppMessage(
                                    booking.phone,
                                    booking.name,
                                    booking.external_reference,
                                    booking.session_type
                                  )
                                }
                                className="text-blue-600 hover:bg-gray-100"
                                style={{ border: "0.5px solid #4ade80" }}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                WhatsApp
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              {/* Mobile: Cards */}
              <div className="block sm:hidden">
                {physicalBookings.length === 0 ? (
                  <p className="text-center text-sm">No upcoming physical sessions found.</p>
                ) : (
                  physicalBookings.map(renderBookingCard)
                )}
              </div>
            </TabsContent>

            {/* Pending Tab */}
            <TabsContent value="pending">
              {/* Desktop: Table */}
              <div className="hidden sm:block">
                <ScrollArea className="h-[60vh] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Name</TableHead>
                        <TableHead className="text-xs sm:text-sm">Phone</TableHead>
                        <TableHead className="text-xs sm:text-sm">Session Type</TableHead>
                        <TableHead className="text-xs sm:text-sm">Date</TableHead>
                        <TableHead className="text-xs sm:text-sm">Time</TableHead>
                        <TableHead className="text-xs sm:text-sm">Venue</TableHead>
                        <TableHead className="text-xs sm:text-sm">Amount (KES)</TableHead>
                        <TableHead className="text-xs sm:text-sm">Reference</TableHead>
                        <TableHead className="text-xs sm:text-sm">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingBookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-sm">
                            No pending sessions found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pendingBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="text-xs sm:text-sm">{booking.name}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{booking.phone}</TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {booking.session_type.charAt(0).toUpperCase() + booking.session_type.slice(1)}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">{booking.date || "N/A"}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{booking.time || "N/A"}</TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {booking.venue ? booking.venue.charAt(0).toUpperCase() + booking.venue.slice(1) : "N/A"}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {booking.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {booking.external_reference}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  sendWhatsAppMessage(
                                    booking.phone,
                                    booking.name,
                                    booking.external_reference,
                                    booking.session_type
                                  )
                                }
                                className="text-blue-600 hover:bg-gray-100"
                                style={{ border: "0.5px solid #4ade80" }}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                WhatsApp
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              {/* Mobile: Cards */}
              <div className="block sm:hidden">
                {pendingBookings.length === 0 ? (
                  <p className="text-center text-sm">No pending sessions found.</p>
                ) : (
                  pendingBookings.map(renderBookingCard)
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}