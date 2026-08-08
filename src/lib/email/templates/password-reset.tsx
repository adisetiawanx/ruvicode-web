import {
  Container,
  Section,
  Text,
  Button,
  Hr,
  Link,
} from "@react-email/components";

/**
 * Password reset template (ADR-014).
 * Sent when user requests a password reset.
 * The reset URL expires after 30 minutes (Better-auth default).
 */
export function PasswordResetTemplate({
  resetUrl,
  name,
}: {
  resetUrl: string;
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
        We received a request to reset your password. Click the button below to
        choose a new password. This link expires in 30 minutes.
      </Text>

      <Section style={{ textAlign: "center", marginBottom: 32 }}>
        <Button
          href={resetUrl}
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
          Reset Password
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
        <Link href={resetUrl} style={{ color: "#D97757" }}>
          {resetUrl}
        </Link>
      </Text>

      <Hr style={{ borderColor: "#e8e6dc", margin: "32px 0" }} />

      <Text style={{ fontSize: 12, color: "#87867f" }}>
        If you didn&apos;t request a password reset, you can safely ignore this
        email. Your password has not been changed.
      </Text>
      <Text style={{ fontSize: 12, color: "#87867f" }}>
        Ruvicode · Operated by Adi, Sole Trader, Indonesia
      </Text>
    </Container>
  );
}
