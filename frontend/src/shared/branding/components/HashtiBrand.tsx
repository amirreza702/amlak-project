import Image from "next/image";

interface HashtiBrandProps {
  variant?: "default" | "compact";
}

export function HashtiBrand({
  variant = "default",
}: HashtiBrandProps) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3">
        <Image
          src="/hashti-logo.png"
          alt="هشتی"
          width={56}
          height={56}
          className="h-12 w-12 object-contain"
        />

        <div className="leading-tight">
          <div className="text-xl font-bold text-[#0b3158]">
            هشتی
          </div>

          <div className="text-xs text-[#159ca8]">
            مسکن، با اصالت و اعتماد
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <Image
        src="/hashti-logo.png"
        alt="هشتی - مسکن، با اصالت و اعتماد"
        width={180}
        height={180}
        priority
        className="h-36 w-36 object-contain sm:h-44 sm:w-44"
      />

      <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0b3158] sm:text-4xl">
        هشتی
      </h1>

      <p className="mt-2 text-sm text-[#159ca8] sm:text-base">
        مسکن، با اصالت و اعتماد
      </p>
    </div>
  );
}