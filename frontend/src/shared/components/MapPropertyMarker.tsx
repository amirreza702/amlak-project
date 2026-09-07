
interface MapPropertyMarkerProps {
  price: string;
  top: string;
  left: string;
}

/*
  ================================================================
  Marker نمونه ملک
  ================================================================
*/
export function MapPropertyMarker({
  price,
  top,
  left,
}: MapPropertyMarkerProps) {
  return (
    <button
      type="button"
      style={{
        top,
        left,
      }}
      className="
        absolute
        z-10
        -translate-x-1/2
        -translate-y-1/2
        opacity-35
      "
    >
      {/* قیمت */}
      <span
        className="
          block
          rounded-full
          bg-brand-navy/70
          px-3
          py-2
          text-[10px]
          font-bold
          text-white
          shadow-md
        "
      >
        {price}
      </span>

      {/* نوک Marker */}
      <span
        className="
          mx-auto
          block
          h-2
          w-2
          -translate-y-1
          rotate-45
          bg-brand-navy/70
        "
      />
    </button>
  );
}

