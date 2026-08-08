import {
  Container,
  Section,
  Text,
  Hr,
} from "@react-email/components";

/**
 * Top-up confirmation template (ADR-014).
 * Sent after a successful Paddle payment or USDC deposit (ADR-015).
 */
export function TopupConfirmationTemplate({
  amount,
  newBalance,
  method,
}: {
  amount: string;
  newBalance: string;
  method: string;
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
        Your wallet has been credited.
      </Text>

      <Section
        style={{
          backgroundColor: "#F0EEE6",
          borderRadius: 8,
          padding: "20px",
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: "#87867f",
            margin: 0,
            marginBottom: 8,
          }}
        >
          Payment method
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#141413",
            fontWeight: 600,
            margin: 0,
            marginBottom: 16,
          }}
        >
          {method}
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: "#87867f",
            margin: 0,
            marginBottom: 8,
          }}
        >
          Amount credited
        </Text>
        <Text
          style={{
            fontSize: 24,
            color: "#141413",
            fontWeight: 700,
            margin: 0,
            marginBottom: 16,
            fontFamily: "monospace",
          }}
        >
          ${amount}
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: "#87867f",
            margin: 0,
            marginBottom: 8,
          }}
        >
          New balance
        </Text>
        <Text
          style={{
            fontSize: 20,
            color: "#D97757",
            fontWeight: 600,
            margin: 0,
            fontFamily: "monospace",
          }}
        >
          ${newBalance}
        </Text>
      </Section>

      <Text
        style={{
          fontSize: 14,
          color: "#3d3d3a",
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        Your balance is ready to use. Start making API requests with any of our
        20+ AI models.
      </Text>

      <Hr style={{ borderColor: "#e8e6dc", margin: "32px 0" }} />

      <Text style={{ fontSize: 12, color: "#87867f" }}>
        Ruvicode · Operated by Adi, Sole Trader, Indonesia
      </Text>
    </Container>
  );
}
