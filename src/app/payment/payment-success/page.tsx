import { Button } from "@/components/ui/button";
import { completeStep } from "@/lib/transactions/actions";
import { redirect } from "next/navigation";

export default async function PaymentSuccess({
    searchParams,
  }: {
    searchParams: Promise<{ payment_intent_client_secret: string, amount: string, transaction_id: number }>;
  }) {
    const { payment_intent_client_secret, amount, transaction_id } = await searchParams;

    if (payment_intent_client_secret) {
      const checkPayment = await completeStep("deposit_paid", transaction_id);
      if (checkPayment && checkPayment.success) {
        redirect(`/transactions/${transaction_id}`);
      }
    }
  
    return (
      <main className="max-w-6xl mx-auto p-10 text-white text-center border m-10 rounded-md bg-gradient-to-tr from-gray-100 to-gray-200 shadow-md">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2 text-black">Payment Successful</h1>
          <div className="bg-purple-300 p-2 rounded-md text-black mt-5 text-4xl font-bold">
            £{amount}
          </div>
          <Button>
              Back to Transaction
          </Button>
        </div>
      </main>
    );
  }
  