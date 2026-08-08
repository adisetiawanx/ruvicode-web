/**
 * Email rendering helpers (ADR-014).
 *
 * Isolates JSX (React Email templates) into a .tsx file so that
 * auth.ts and send.ts (both .ts files) can call render functions
 * without needing JSX syntax themselves.
 */

import { render } from "@react-email/components";
import { VerifyEmailTemplate } from "@/lib/email/templates/verify-email";
import { PasswordResetTemplate } from "@/lib/email/templates/password-reset";
import { LowBalanceTemplate } from "@/lib/email/templates/low-balance";
import { TopupConfirmationTemplate } from "@/lib/email/templates/topup-confirmation";

export async function renderVerifyEmail(
  verificationUrl: string,
  name?: string,
): Promise<string> {
  return render(<VerifyEmailTemplate verificationUrl={verificationUrl} name={name} />);
}

export async function renderPasswordReset(
  resetUrl: string,
  name?: string,
): Promise<string> {
  return render(<PasswordResetTemplate resetUrl={resetUrl} name={name} />);
}

export async function renderLowBalance(balance: string): Promise<string> {
  return render(<LowBalanceTemplate balance={balance} />);
}

export async function renderTopupConfirmation(
  amount: string,
  newBalance: string,
  method: string,
): Promise<string> {
  return render(
    <TopupConfirmationTemplate
      amount={amount}
      newBalance={newBalance}
      method={method}
    />,
  );
}
