"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const CTAred = () => {
  // WhatsApp link
  const whatsappNumber = "+254716813545";
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <div
      className="flex min-h-screen bg-black items-center justify-center bg-cover bg-center bg-no-repeat py-12"
      style={{
        backgroundImage: `url('/bg/edge.svg')`,
      }}
    >
      <div className="w-full max-w-md rounded-lg bg-white/80 p-6 shadow-lg backdrop-blur-sm">
        {/* Image Section */}
        <div className="mb-6">
          <img
            src="/party.jpg"
            alt="Colorful Party Cups"
            className="w-full h-3/4 object-cover object-center"
          />
        </div>

        {/* Explainer Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Party Cups Kenya
          </h2>
          <p className="text-gray-600 mb-6">
            Brighten up your party with our vibrant red, blue, yellow, and green
            party cups! These durable and recyclable cups are perfect for any
            celebration, adding a fun splash of color while being eco-friendly.
          </p>

           <p className="text-gray-600 mb-6">
            Based in Nakuru and supplying across Kenya, we ensure timely delivery
            for all your party needs. Order now and make your event unforgettable
            with our colorful party cups!
          </p>

          {/* WhatsApp Contact Button */}
          <Button
            as="a"
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600 w-full py-2 rounded-md focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            style={{ border: "0.5px solid #22c55e" }}
          >
            <MessageSquare className="h-5 w-5" />
            Contact Us on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CTAred;