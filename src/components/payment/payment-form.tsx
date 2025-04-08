"use client";

import CheckoutPage from "@/components/CheckoutPage";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

export default function Payment({ amount, transaction_id }: { amount: number, transaction_id: number }) {
  if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
  }
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
  return (
    <main className="max-w-6xl mx-auto p-10 text-white text-center border m-10 rounded-md bg-gradient-to-tr from-gray-100 to-gray-200 shadow-md">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-2 text-black">Tool owner</h1>
        <h2 className="text-2xl text-black">
          has requested <span className="font-bold"> £{amount}</span> for tool
        </h2>
      </div>

      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
          amount: convertToSubcurrency(amount),
          currency: "usd",
        }}
      >
        <CheckoutPage amount={amount} transaction_id={transaction_id}/>
      </Elements>
    </main>
  );
}