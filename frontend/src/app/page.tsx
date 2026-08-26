import { PropertyForm } from "@/features/property/components/PropertyForm";
import { PropertyPageHeader } from "@/features/property/components/layout/PropertyPageHeader";
import { HashtiHeader } from "@/shared/layout/HashtiHeader";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8fafb]">

      <HashtiHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-12">

        <div
          id="property"
          className="mx-auto max-w-5xl space-y-8"
        >

          <PropertyPageHeader
            title="ثبت ملک در هشتی"
            description="ملک خود را با اطلاعات دقیق و قابل اعتماد ثبت کنید."
          />

          <PropertyForm />

        </div>

      </main>

    </div>
  );
}