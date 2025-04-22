"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, {useState, useEffect} from 'react'

const CouponForm = () => {
    const [email, setEmail] = useState("");

    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     // Placeholder for form submission logic
    //     console.log("Email submitted:", email);
    //   };

  return (
    <div>
       <div className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat mt-18"
           style={{
             backgroundImage: `url('/bg/world.png')`,
           }}
       >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Confirm Your Email
        </h2>
        <form onSubmit={"/"} className="space-y-4">
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
          <Button
            type="submit"
            className="w-full rounded-md bg-black text-white hover:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        
          >
            Confirm Email
          </Button>
        </form>
      </div>
    </div>
    </div>
  )
}

export default CouponForm