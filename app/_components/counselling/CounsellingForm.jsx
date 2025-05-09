"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

const FormEvent = () => {
  const router = useRouter();

  const event = {
    name: "Book an E-Session with Us",
    description:
      "Experience a safe and supportive virtual e-counselling session with Maks Psychologists. Book now to start your journey toward healing and growth.",
  };

  // Handle navigation to reservation page
  const handleReserveSeat = () => {
    router.push("/session"); // Replace with your actual reservation route
  };

  return (
    <div
      className="px-4 sm:px-6 md:px-8 flex min-h-screen bg-gray-100 items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/bg/edge.svg')`,
      }}
    >
      <div className="w-full max-w-md rounded-lg bg-white/90 p-6 shadow-md backdrop-blur-sm">
        <h2 className="mb-6 text-center text-2xl font-bold text-blue-600">
          {event.name}
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-lg font-medium text-blue-700">Description</p>
            <p className="text-gray-600">{event.description}</p>
          </div>
        </div>
        <Button
          onClick={handleReserveSeat}
          className="mt-6 w-full rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          style={{ border: "0.5px solid #4ade80" }}
        >
          Book Your Session
        </Button>
      </div>
    </div>
  );
};

export default FormEvent;