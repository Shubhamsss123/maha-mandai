import { Card } from "@/components/ui/Card";
import { Container, PageHeader } from "@/components/ui/PageHeader";

export default function TermsPage() {
  return (
    <Container className="max-w-3xl">
      <PageHeader title="Terms & Conditions" subtitle="Please read before placing an order." />
      <Card className="mt-6 space-y-3 text-sm leading-relaxed text-slate-600">
        <p>
          Orders are accepted only within our serviceable pincodes, and only for verified accounts. Prices,
          discounts, and stock availability may change without prior notice. Payment is currently accepted via
          Cash on Delivery; online payment is coming soon.
        </p>
        <p>
          By placing an order on Maha Mandai, you agree to provide accurate delivery information and to be
          available to receive the order at the address provided.
        </p>
      </Card>
    </Container>
  );
}
