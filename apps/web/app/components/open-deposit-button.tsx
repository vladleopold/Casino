"use client";

import { useSlotcityAccount } from "./account-context";

export function OpenDepositButton({
  placement,
  className,
  children
}: {
  placement: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { requestDeposit } = useSlotcityAccount();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        void requestDeposit(placement);
      }}
    >
      {children}
    </button>
  );
}
