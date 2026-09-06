import { HashtiBrand } from "../branding/components/HashtiBrand";

export function HashtiHeader() {
  return (
    <header className="bg-white px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <HashtiBrand />
        <nav className="flex gap-6 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-brand-navy">خانه</a>
          <a href="#" className="hover:text-brand-navy">جستجوی ملک</a>
          <a href="#" className="hover:text-brand-navy">ثبت‌نام مشاورین</a>
        </nav>
        <div className="flex gap-4">
          <button className="text-sm font-semibold text-brand-navy">ورود</button>
          <button className="rounded-lg bg-brand-navy px-5 py-2 text-sm text-white hover:bg-brand-navy-dark">
            ثبت‌نام
          </button>
        </div>
      </div>
    </header>
  );
}
