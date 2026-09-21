import { Card } from "@/components/ui/Card";
import { Container, PageHeader } from "@/components/ui/PageHeader";

export default function AboutPage() {
  return (
    <Container className="max-w-3xl">
      <PageHeader title="About Us" subtitle="Connecting Baramati's farms to your kitchen." />
      <Card className="mt-6">
        <p className="text-sm leading-relaxed text-slate-600">
          Maha Mandai is an online agriculture and grocery delivery platform serving Baramati and nearby areas.
          We work directly with local farmers and wholesalers to bring fresh produce and everyday essentials to
          your doorstep at honest prices — no middlemen, no hidden markups.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Our mission is simple: fresh from farm to your home, every single day.
        </p>
      </Card>
    </Container>
  );
}
