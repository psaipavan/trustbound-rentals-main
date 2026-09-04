import { useState } from "react";
import { cn } from "@/lib/utils";

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-border">
        <img
          src={images[active]}
          alt={`${title} — photo ${active + 1}`}
          width={1280}
          height={853}
          className="aspect-[3/2] w-full object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              className={cn(
                "overflow-hidden rounded-xl border-2 transition",
                i === active ? "border-primary" : "border-transparent hover:border-border",
              )}
            >
              <img
                src={img}
                alt=""
                loading="lazy"
                width={1280}
                height={853}
                className="aspect-[3/2] w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
