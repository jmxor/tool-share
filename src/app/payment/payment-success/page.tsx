export default async function PaymentSuccess({
    searchParams,
  }: {
    searchParams: { amount: string };
  }) {
    const { amount } = await Promise.resolve(searchParams);
  
    return (
      <main className="max-w-6xl mx-auto p-10 text-white text-center border m-10 rounded-md bg-gradient-to-tr from-gray-100 to-gray-200 shadow-md">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2 text-black">Payment Successful</h1>
          <div className="bg-purple-300 p-2 rounded-md text-black mt-5 text-4xl font-bold">
            £{amount}
          </div>
        </div>
      </main>
    );
  }
  