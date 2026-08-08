import {
  Container,
  Section,
  Text,
  Hr,
} from "@react-email/components";

/**
 * Low balance alert template (ADR-014).
 * Triggered by cron when user balance falls below $2.00.
 */
export function LowBalanceTemplate({
  balance,
}: {
  balance: string;
}) {
  return (
    <Container
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "24px",
        backgroundColor: "#FAF9F5",
        borderRadius: 8,
      }}
    >
      <Section style={{ textAlign: "center", marginBottom: 32 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#D97757",
            margin: 0,
          }}
        >
          Ruvicode
        </Text>
      </Section>

      <Text style={{ fontSize: 16, color: "#141413", marginBottom: 16 }}>
        Your balance is running low.
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: "#3d3d3a",
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        Your current balance is{" "}
        <strong style={{ color: "#141413" }}>${balance}</strong>. Top up your
        wallet to avoid service interruption for your API requests.
      </Text>

      <Section style={{ textAlign: "center", marginBottom: 32 }}>
        <Text
          style={{
            fontSize: 14,
            color: "#D97757",
            fontWeight: 600,
          }}
        >
          Log in to top up: https://ruvicode.com/dashboard/topup
        </Text>
      </Section>

      <Hr style={{ borderColor: "#e8e6dc", margin: "32px 0" }} />

      <Text style={{ fontSize: 12, color: "#87867f" }}>
        You received this email because low-balance alerts are enabled in your
        account settings.
      </Text>
      <Text style={{ fontSize: 12, color: "#87867f" }}>
        Ruvicode · Operated by Adi, Sole Trader, Indonesia
      </Text>
    </Container>
  );
}
