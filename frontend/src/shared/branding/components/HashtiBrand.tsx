import Image from "next/image";

export function HashtiBrand({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* اصلاح مسیر لوگو از /logo.png به /hashti-logo.png */}
      <Image
        src="/hashti-logo.png"
        alt="هشتی"
        width={44}
        height={44}
        className="object-contain"
        priority
      />
      <div className="flex flex-col">
        <span className="text-xl font-bold text-[#043873]">هشتی</span>
        <span className="text-[10px] text-brand-blue">مسکن، با اصالت و اعتماد</span>
      </div>
    </div>
  );
}
