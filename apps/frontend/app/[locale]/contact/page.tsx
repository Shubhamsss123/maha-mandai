import { Card } from "@/components/ui/Card";
import { Container, PageHeader } from "@/components/ui/PageHeader";

const items = [
  { icon: "📍", label: "Address", value: "Baramati, Pune District, Maharashtra" },
  { icon: "📞", label: "Phone", value: "+91 98765 43210" },
  { icon: "✉️", label: "Email", value: "support@mahamandai.in" },
  { icon: "🕒", label: "Hours", value: "7:00 AM – 9:00 PM, all days" },
];

export default function ContactPage() {
  return (
    <Container className="max-w-3xl">
      <PageHeader title="Contact Us" subtitle="We're happy to help with orders, deliveries, or feedback." />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Card key={item.label} className="flex items-start gap-3">
            <span className="text-xl">{item.icon}</span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
              <p className="text-sm text-slate-500">{item.value}</p>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
