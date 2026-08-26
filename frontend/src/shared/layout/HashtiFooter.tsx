import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const footerLinks = [
  { href: "#property", label: "ثبت ملک" },
  { href: "#", label: "جستجوی ملک" },
  { href: "#", label: "درباره هشتی" },
  { href: "#", label: "قوانین و مقررات" },
];

export function HashtiFooter() {
  const currentYear = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
  }).format(new Date());

  return (
    <footer className="border-t border-white/10 bg-brand-navy text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* معرفی کوتاه */}
          <section>
            <h2 className="text-lg font-bold text-brand-stone">هشتی</h2>

            <p className="mt-4 text-sm leading-7 text-white/70">
              بستری برای ثبت و جستجوی شفاف، دقیق و قابل‌اعتماد آگهی‌های
              ملکی.
            </p>
          </section>

          {/* دسترسی سریع */}
          <section>
            <h2 className="text-base font-bold text-brand-stone">
              دسترسی سریع
            </h2>

            <ul className="mt-4 space-y-3">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-brand-turquoise focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turquoise"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* راه‌های ارتباطی */}
          <section>
            <h2 className="text-base font-bold text-brand-stone">
              ارتباط با ما
            </h2>

            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-brand-turquoise"
                  aria-hidden="true"
                />
                <span>شاهرود، استان سمنان</span>
              </li>

              <li className="flex items-center gap-2.5" dir="ltr">
                <Phone
                  className="size-4 shrink-0 text-brand-turquoise"
                  aria-hidden="true"
                />
                <a
                  href="tel:+982332000000"
                  className="transition-colors hover:text-white"
                >
                  023-3200-0000
                </a>
              </li>

              <li className="flex items-center gap-2.5" dir="ltr">
                <Mail
                  className="size-4 shrink-0 text-brand-turquoise"
                  aria-hidden="true"
                />
                <a
                  href="mailto:info@hashti.ir"
                  className="transition-colors hover:text-white"
                >
                  info@hashti.ir
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-center text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between sm:text-right">
          <p>© {currentYear} هشتی — تمامی حقوق محفوظ است.</p>

          <p>مسکن، با اصالت و اعتماد</p>
        </div>
      </div>
    </footer>
  );
}
