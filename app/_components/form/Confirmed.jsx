"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const Confirmed = () => {
  const [claimedCoupons, setClaimedCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClaimedCoupons = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("merchembulw15")
        .select("name, contact")
        .eq("status", "claimed")
        .order("name", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setClaimedCoupons(data);
      } else {
        setError("No claimed coupons found.");
        setClaimedCoupons([]);
      }
    } catch (err) {
      console.error("Error fetching claimed coupons:", err);
      setError("Failed to fetch claimed coupons. Please try again.");
      setClaimedCoupons([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchClaimedCoupons();
  }, []);

  return (
    <div
      className="flex min-h-screen bg-black items-center justify-center bg-cover bg-center bg-no-repeat py-12"
      style={{
        backgroundImage: `url('/bg/edge.svg')`,
      }}
    >
      <div className="w-full max-w-4xl rounded-lg bg-white/80 p-6 shadow-md backdrop-blur-sm">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Claimed LW15 T-Shirt Coupons
        </h2>

        <div className="mb-6 flex justify-center">
          <Button
            onClick={fetchClaimedCoupons}
            disabled={isLoading}
            className="rounded-md bg-black text-white hover:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            style={{ border: "0.5px solid #22c55e" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              "Refresh List"
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {claimedCoupons.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-700">Name</TableHead>
                  <TableHead className="text-gray-700">Phone Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claimedCoupons.map((coupon, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {coupon.name || "N/A"}
                    </TableCell>
                    <TableCell>{coupon.contact || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          !isLoading &&
          !error && (
            <p className="text-center text-gray-600">
              No claimed coupons available.
            </p>
          )
        )}

        {isLoading && (
          <div className="flex justify-center items-center mt-6">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Confirmed;