import { Card } from "@/components/ui/Card";
import { Container, PageHeader } from "@/components/ui/PageHeader";

export default function PrivacyPage() {
  return (
    <Container className="max-w-3xl">
      <PageHeader title="Privacy Policy" subtitle="How we handle your information." />
      <Card className="mt-6 space-y-3 text-sm leading-relaxed text-slate-600">
        <p>
          We collect your mobile number to identify your account, and your address details to fulfill deliveries.
          We do not sell your personal information to third parties.
        </p>
        <p>
          Order and payment information is used solely to process your purchases and improve our service.
          You may request deletion of your account data at any time by contacting support.
        </p>
      </Card>
    </Container>
  );
}
