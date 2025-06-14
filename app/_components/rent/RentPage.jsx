"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

const RentPage = () => {
    const router = useRouter();

    const event = {
        name: "Rent Suite",
        date: "MnDee",
        time: "Mark n Dee",
        location: "White House",
        description: "Bill Payments as per contract"
      };
    
      // Handle navigation to reservation page
      const handleReserveSeat = () => {
        router.push("/pay"); // Replace with your actual reservation route
      };

  return (
    <div
      className="px-4 sm:px-6 md:px-8 flex min-h-screen bg-black items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/bg/edge.svg')`,
      }}
    >
      <div className="w-full max-w-md rounded-lg bg-white/80 p-6 shadow-md backdrop-blur-sm">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          {event.name}
        </h2>
        <div className="space-y-4">
         
          <div>
            <p className="text-lg font-medium text-gray-700">Apartment</p>
            <p className="text-gray-600">{event.time}</p>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">Location</p>
            <p className="text-gray-600">{event.location}</p>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">Description</p>
            <p className="text-gray-600">{event.description}</p>
          </div>
        </div>
        <Button
          onClick={handleReserveSeat}
          className="mt-6 w-full rounded-md bg-black text-white hover:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          style={{ border: "0.5px solid #22c55e" }}
        >
          Reserve a Seat
        </Button>
      </div>
    </div>
  )
}

export default RentPage