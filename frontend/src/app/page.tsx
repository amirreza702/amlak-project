import { PropertyForm } from "@/features/property/components/PropertyForm";
import { PropertyPageHeader } from "@/features/property/components/layout/PropertyPageHeader";
import { HashtiFooter } from "@/shared/layout/HashtiFooter";
import { HashtiHeader } from "@/shared/layout/HashtiHeader";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-warm">
      <HashtiHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div id="property" className="mx-auto max-w-5xl space-y-8">
          <PropertyPageHeader
            title="ثبت ملک در هشتی"
            description="ملک خود را با اطلاعات دقیق و قابل اعتماد ثبت کنید."
          />

          <PropertyForm />
        </div>
      </main>

      <HashtiFooter />
    </div>
  );
}
