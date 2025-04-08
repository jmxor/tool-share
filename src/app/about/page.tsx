import Image from "next/image";

export default function AboutPage() {
  const steps = [
    {
      id: 1,
      description:
        "Find a tool that you would like to borrow, and select the 'Borrow' button.",
      image: "/step1.png",
    },
    {
      id: 2,
      description:
        "Enter how many days you would like to borrow the tool for, up to the maximum borrow period of the tool, and confirm by selecting the 'Request to Borrow' button .",
      image: "/step2.png",
    },
    {
      id: 3,
      description:
        "Wait for the tool owner to accept your request or cancel the request if you change your mind.",
      image: "/step3.png",
    },
    {
      id: 4,
      description:
        "Once accepted, navigate to the transaction page where you can now pay the deposit for the tool.",
      image: "/step4.png",
    },
    {
      id: 5,
      description:
        "Once you have paid the deposit, you can view the code that you use to confirm you identity to the tool owner when you exchange the tool. Use the chat function to arrange a time and place for the exchange.",
      image: "/step5.png",
    },
    {
      id: 6,
      description:
        "To confirm that you have returned the tool, enter the code from the owner.",
      image: "/step6.png",
    },
    {
      id: 7,
      description:
        "Once you have entered the owner's confirmation code, wait for the owner to finalise the transaction.",
      image: "/step7.png",
    },
    {
      id: 8,
      title: "Support",
      description:
        "The transaction is now complete. Leaving a review of the owner helps other users find trustworthy owners to borrow from.",
      image: "/step8.png",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          How It Works
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          8 simple steps from start to finish of borrowing a tool.
        </p>
      </div>

      <div className="space-y-24">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-12`}
          >
            <div className="w-full md:w-1/2">
              <div className="relative aspect-video overflow-hidden rounded-xl shadow-lg">
                <Image
                  src={step.image || "/placeholder.svg"}
                  alt={`Step ${step.id}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {step.id}
                </div>
              </div>
            </div>
            <div className="w-full space-y-4 md:w-1/2">
              <h2 className="text-3xl font-bold tracking-tight">
                Step {step.id}
              </h2>
              <p className="text-lg text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
