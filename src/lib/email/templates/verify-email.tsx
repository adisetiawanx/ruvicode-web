import {
  Container,
  Section,
  Text,
  Button,
  Hr,
  Link,
} from "@react-email/components";

/**
 * Email verification template (ADR-014).
 * Sent on registration — contains the verification URL from Better-auth.
 * Design: Clay accent button, Ruvicode branding, email-safe HTML (no flex/grid).
 */
export function VerifyEmailTemplate({
  verificationUrl,
  name,
}: {
  verificationUrl: string;
  name?: string;
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
        Hi {name || "there"},
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: "#3d3d3a",
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        Welcome to Ruvicode! Please verify your email address to activate your
        account and start using 20+ AI models with a single API key.
      </Text>

      <Section style={{ textAlign: "center", marginBottom: 32 }}>
        <Button
          href={verificationUrl}
          style={{
            background: "#D97757",
            color: "#FAF9F5",
            padding: "12px 32px",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Verify Email Address
        </Button>
      </Section>

      <Text style={{ fontSize: 14, color: "#87867f", marginBottom: 8 }}>
        Or copy this link:
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#87867f",
          wordBreak: "break-all",
        }}
      >
        <Link href={verificationUrl} style={{ color: "#D97757" }}>
          {verificationUrl}
        </Link>
      </Text>

      <Hr style={{ borderColor: "#e8e6dc", margin: "32px 0" }} />

      <Text style={{ fontSize: 12, color: "#87867f" }}>
        If you didn&apos;t create an account, you can safely ignore this email.
      </Text>
      <Text style={{ fontSize: 12, color: "#87867f" }}>
        Ruvicode · Operated by Adi, Sole Trader, Indonesia
      </Text>
    </Container>
  );
}
