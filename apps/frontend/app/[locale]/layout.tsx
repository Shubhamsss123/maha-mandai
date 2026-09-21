import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { isLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { AuthProvider } from "@/lib/auth/AuthContext";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;

  if (!isLocale(resolvedParams?.locale)) {
    notFound();
  }

  const locale = resolvedParams.locale as Locale;
  const t = getDictionary(locale);

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header locale={locale} t={t} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} t={t} />
      </div>
    </AuthProvider>
  );
}
