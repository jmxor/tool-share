"use client";

import { TransactionData } from "@/lib/transactions/types";
import { ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { checkCode, completeStep, getCode } from "@/lib/transactions/actions";
import { useRouter } from "next/navigation";
import { createRef, useState } from "react";
import { useEffect } from "react";
import PaymentForm from "@/components/payment/payment-form";

const StepActionArea = ({ isBorrower, nextStep, transaction }: { isBorrower: boolean, nextStep: string, transaction: TransactionData }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Next Action</h2>
      {nextStep === "deposit_paid" && <DepositStep isBorrower={isBorrower} transaction={transaction} />}
      {nextStep === "tool_borrowed" && <FirstExchangeStep isBorrower={isBorrower} transaction={transaction} />}
      {nextStep === "tool_returned" && <SecondExchangeStep isBorrower={isBorrower} transaction={transaction} />}
      {nextStep === "transaction_completed" && <CompletedStep isBorrower={isBorrower} transaction={transaction} />}
      {nextStep === "" && <TransactionCompletedStep isBorrower={isBorrower} transaction={transaction} />}
    </div>
  );
};

const DepositStep = ({ isBorrower, transaction }: { isBorrower: boolean, transaction: TransactionData }) => {
  const router = useRouter();
  const handleClick = async () => {
    const result = await completeStep("deposit_paid", transaction.id);
    if (result && result.success) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-background shadow-sm">
      {isBorrower ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pay Deposit</h3>
            <Badge variant="outline">Required</Badge>
          </div>
          <p className="text-muted-foreground">
            To proceed with borrowing {transaction.tool_name}, you need to pay a deposit.
          </p>
          <Button className="w-full" onClick={handleClick}>Pay Deposit Now</Button>
          <PaymentForm amount={59.99} transaction_id={transaction.id}/>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Waiting for Deposit</h3>
          <p className="text-muted-foreground">
            {transaction.borrower.username} needs to pay the deposit before proceeding.
            We&apos;ll notify you when the payment is complete.
          </p>
        </div>
      )}
    </div>
  );
};

const FirstExchangeStep = ({ isBorrower, transaction }: { isBorrower: boolean, transaction: TransactionData }) => {
  const [codeValues, setCodeValues] = useState<string[]>(Array(6).fill(''));
  const [displayCode, setDisplayCode] = useState<string | null>(null);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const stepNumber = 1;
  const router = useRouter();
  const inputRefs = Array(6).fill(0).map(() => createRef<HTMLInputElement>());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCode = async () => {
      const result = await getCode(transaction.id, stepNumber);
      if (result) {
        setDisplayCode(result.code.toString());
        setExpiryTime(new Date(result.expiresAt));
      }
    }
    fetchCode();
  }, [transaction.id, stepNumber]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }
    
    const newCodeValues = [...codeValues];
    newCodeValues[index] = value;
    setCodeValues(newCodeValues);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeValues[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = codeValues.join('');
    if (fullCode.length !== 6) return;
    
    const result = await checkCode(transaction, stepNumber, fullCode);
    if (result && result.success) {
      await completeStep("tool_borrowed", transaction.id);
      router.refresh();
    } else if(result && !result.success) {
      setError("Invalid code");
    }
  };
  
  return (
    <div className="space-y-4 p-6 border rounded-lg bg-background shadow-sm">
      {isBorrower ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pickup Code</h3>
          <p className="text-muted-foreground">
            Only share this code with the owner in person when you pick up the tool.
          </p>
          {displayCode ? (
            <div className="space-y-3">
              <div className="flex justify-center gap-2">
                { displayCode.split('').map((code, index) => (
                  <div key={index} className="bg-neutral-100 w-12 h-12 text-center flex items-center justify-center text-xl font-semibold rounded-md">
                    {code}
                  </div>
                ))}
              </div>
              {expiryTime && (
                <p className="text-sm text-center text-muted-foreground">
                  Code expires: {expiryTime.toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <p className="text-muted-foreground">
                Getting pickup code...
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Enter Pickup Code</h3>
          <p className="text-muted-foreground">
            Ask the borrower for their pickup code when in person to confirm the handover.
          </p>
          <div className="flex justify-center gap-2 my-4">
            {Array(6).fill(0).map((_, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={codeValues[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-semibold border rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
              />
            ))}
          </div>
          <Button className="w-full" onClick={handleVerify}>Verify Code</Button>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </div>
      )}
    </div>
  );
};

const SecondExchangeStep = ({ isBorrower, transaction }: { isBorrower: boolean, transaction: TransactionData }) => {
  const [codeValues, setCodeValues] = useState<string[]>(Array(6).fill(''));
  const [displayCode, setDisplayCode] = useState<string | null>(null);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const stepNumber = 2;
  const router = useRouter();
  const inputRefs = Array(6).fill(0).map(() => createRef<HTMLInputElement>());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCode = async () => {
      const result = await getCode(transaction.id, stepNumber);
      if (result) {
        setDisplayCode(result.code.toString());
        setExpiryTime(new Date(result.expiresAt));
      }
    }
    fetchCode();
  }, [transaction.id, stepNumber]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }
    
    const newCodeValues = [...codeValues];
    newCodeValues[index] = value;
    setCodeValues(newCodeValues);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeValues[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = codeValues.join('');
    if (fullCode.length !== 6) return;
    
    const result = await checkCode(transaction, stepNumber, fullCode);
    if (result && result.success) {
      await completeStep("tool_returned", transaction.id);
      router.refresh();
    } else if(result && !result.success) {
      setError("Invalid code");
    }
  };
  
  return (
    <div className="space-y-4 p-6 border rounded-lg bg-background shadow-sm">
      {!isBorrower ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Return Code</h3>
          <p className="text-muted-foreground">
            Only share this code with the borrower in person when they return the tool.
          </p>
          {displayCode ? (
            <div className="space-y-3">
              <div className="flex justify-center gap-2">
                { displayCode.split('').map((code, index) => (
                  <div key={index} className="bg-neutral-100 w-12 h-12 text-center flex items-center justify-center text-xl font-semibold rounded-md">
                    {code}
                  </div>
                ))}
              </div>
              {expiryTime && (
                <p className="text-sm text-center text-muted-foreground">
                  Code expires: {expiryTime.toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <p className="text-muted-foreground">
                Getting return code...
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Enter Return Code</h3>
          <p className="text-muted-foreground">
            Ask the owner for their return code to confirm the handover.
          </p>
          <div className="flex justify-center gap-2 my-4">
            {Array(6).fill(0).map((_, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={codeValues[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-semibold border rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
              />
            ))}
          </div>
          <Button className="w-full" onClick={handleVerify}>Verify Code</Button>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </div>
      )}
    </div>
  );
};

const CompletedStep = ({ isBorrower, transaction }: { isBorrower: boolean, transaction: TransactionData }) => {
  const router = useRouter();
  const handleFinalize = async () => {
    const result = await completeStep("transaction_completed", transaction.id);
    if (result && result.success) {
      router.refresh();
    }
  }
  return (
    <div className="space-y-4 p-6 border rounded-lg bg-background shadow-sm">
      {isBorrower ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Waiting for Finalization</h3>
          <p className="text-muted-foreground">
            The tool has been returned. Waiting for {transaction.owner.username} to finalize the transaction.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Finalize Transaction</h3>
          <p className="text-muted-foreground">
            The tool has been returned. Please finalize the transaction to release the deposit.
          </p>
          <Button onClick={handleFinalize} className="w-full">Finalize Transaction</Button>
        </div>
      )}
    </div>
  );
};

const TransactionCompletedStep = ({ isBorrower, transaction }: { isBorrower: boolean, transaction: TransactionData }) => {
  return (
    <div className="space-y-4 p-6 border rounded-lg bg-green-50 shadow-sm">
      <h3 className="text-lg font-semibold text-green-700">Transaction Completed</h3>
      <div className="space-y-4">
        <p className="text-green-700">
          This transaction has been completed successfully. There are no more steps to complete.
        </p>
        <div className="rounded-md bg-green-100 p-4">
          <p className="text-sm text-green-800">
            Consider leaving a review for {isBorrower ? transaction.owner.username : transaction.borrower.username} to help build our community.
          </p>
          <Link 
            href={`/user/${isBorrower ? transaction.owner.first_username : transaction.borrower.first_username}`}
            className="mt-2 inline-flex items-center text-sm font-medium text-green-700 hover:text-green-800"
          >
            Leave a review <ExternalLinkIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StepActionArea;