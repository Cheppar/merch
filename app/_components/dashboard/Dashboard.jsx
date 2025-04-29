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
import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reservations from Supabase
  useEffect(() => {
    async function fetchReservations() {
      try {
        const { data, error } = await supabase
          .from("reservations")
          .select("id, event_id, name, phone, tickets, status, amount, mpesacode, external_reference")
          .order("id", { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        setReservations(data || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchReservations();
  }, []);

  // WhatsApp message handler
  const sendWhatsAppMessage = (phone, name, external_reference) => {
    const message = `Hello ${name}, thank you for your reservation (Ref: ${external_reference}). How can we assist you today?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  // Filter reservations by status
  const paidReservations = reservations.filter((res) => res.status === "Paid");
  const pendingReservations = reservations.filter((res) => res.status === "pending");

  // Render reservation card for mobile
  const renderReservationCard = (res) => (
    <Card key={res.id} className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{res.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p><strong>Phone:</strong> {res.phone}</p>
        <p><strong>Tickets:</strong> {res.tickets}</p>
        <p><strong>Amount:</strong> KES {res.amount.toLocaleString()}</p>
        <p><strong>M-Pesa Code:</strong> {res.mpesacode || "N/A"}</p>
        <p><strong>Reference:</strong> {res.external_reference}</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => sendWhatsAppMessage(res.phone, res.name, res.external_reference)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Reservations Dashboard
        </h1>

        {loading && (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin"></div>
          </div>
        )}

        {error && <p className="text-red-600 text-center text-sm sm:text-base">{error}</p>}

        {!loading && !error && (
          <Tabs defaultValue="paid" className="w-full">
            <TabsList className="grid grid-cols-2 w-full sm:w-auto mb-4">
              <TabsTrigger value="paid" className="text-sm sm:text-base">
                Paid ({paidReservations.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-sm sm:text-base">
                Pending ({pendingReservations.length})
              </TabsTrigger>
            </TabsList>

            {/* Paid Tab */}
            <TabsContent value="paid">
              {/* Desktop: Table */}
              <div className="hidden sm:block">
                <ScrollArea className="h-[60vh] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Name</TableHead>
                        <TableHead className="text-xs sm:text-sm">Phone</TableHead>
                        <TableHead className="text-xs sm:text-sm">Tickets</TableHead>
                        <TableHead className="text-xs sm:text-sm">Amount (KES)</TableHead>
                        <TableHead className="text-xs sm:text-sm">M-Pesa Code</TableHead>
                        <TableHead className="text-xs sm:text-sm">Reference</TableHead>
                        <TableHead className="text-xs sm:text-sm">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paidReservations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-sm">
                            No paid reservations found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paidReservations.map((res) => (
                          <TableRow key={res.id}>
                            <TableCell className="text-xs sm:text-sm">{res.name}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{res.phone}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{res.tickets}</TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {res.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {res.mpesacode || "N/A"}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {res.external_reference}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  sendWhatsAppMessage(res.phone, res.name, res.external_reference)
                                }
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
                {paidReservations.length === 0 ? (
                  <p className="text-center text-sm">No paid reservations found.</p>
                ) : (
                  paidReservations.map(renderReservationCard)
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
                        <TableHead className="text-xs sm:text-sm">Tickets</TableHead>
                        <TableHead className="text-xs sm:text-sm">Amount (KES)</TableHead>
                        <TableHead className="text-xs sm:text-sm">M-Pesa Code</TableHead>
                        <TableHead className="text-xs sm:text-sm">Reference</TableHead>
                        <TableHead className="text-xs sm:text-sm">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingReservations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-sm">
                            No pending reservations found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pendingReservations.map((res) => (
                          <TableRow key={res.id}>
                            <TableCell className="text-xs sm:text-sm">{res.name}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{res.phone}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{res.tickets}</TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {res.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {res.mpesacode || "N/A"}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {res.external_reference}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  sendWhatsAppMessage(res.phone, res.name, res.external_reference)
                                }
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
                {pendingReservations.length === 0 ? (
                  <p className="text-center text-sm">No pending reservations found.</p>
                ) : (
                  pendingReservations.map(renderReservationCard)
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}