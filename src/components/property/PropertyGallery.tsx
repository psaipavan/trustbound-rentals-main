import { useState } from "react";
import { cn } from "@/lib/utils";
import { PropertyImage } from "@/components/property/PropertyImage";

export function getNextGalleryIndex(
  current: number,
  length: number,
  direction: "previous" | "next",
) {
  if (length <= 1) return 0;
  return (current + (direction === "next" ? 1 : -1) + length) % length;
}

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const selectAdjacent = (direction: "previous" | "next") => {
    setActive((current) => getNextGalleryIndex(current, images.length, direction));
  };

  return (
    <div
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      role="group"
      aria-label={`${title} photo gallery`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          selectAdjacent("previous");
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          selectAdjacent("next");
        }
      }}
    >
      <div className="overflow-hidden rounded-2xl border border-border">
        <PropertyImage
          src={images[active]}
          alt={`${title} — photo ${active + 1}`}
          className="aspect-[3/2]"
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1024px) 62vw, 100vw"
        />
      </div>
      <p className="sr-only" aria-live="polite">
        Photo {active + 1} of {images.length}
      </p>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === active}
              className={cn(
                "overflow-hidden rounded-xl border-2 transition",
                i === active ? "border-primary" : "border-transparent hover:border-border",
              )}
            >
              <img
                src={img}
                alt=""
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1024px) 10rem, 25vw"
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
