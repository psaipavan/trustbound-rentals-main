import { useState, type ImgHTMLAttributes } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Fixed-ratio image with reserved space, skeleton while loading and a designed
 * fallback on failure. Only opacity/transform animate — never width/height.
 */
export function PropertyImage({
  src,
  alt,
  className,
  imgClassName,
  zoomOnHover = false,
  loading = "lazy",
  sizes,
  fetchPriority,
}: {
  src: string | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  zoomOnHover?: boolean;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  sizes?: string;
  fetchPriority?: ImgHTMLAttributes<HTMLImageElement>["fetchPriority"];
}) {
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>();
  const [failedSrc, setFailedSrc] = useState<string | undefined>();
  const loaded = loadedSrc === src;
  const failed = !src || failedSrc === src;

  return (
    <div className={cn("relative w-full overflow-hidden bg-muted", className)}>
      {!loaded && !failed ? (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden />
      ) : null}

      {failed ? (
        <div className="absolute inset-0 grid place-items-center bg-muted text-muted-foreground">
          <div className="flex flex-col items-center gap-1.5">
            <ImageOff className="h-6 w-6" aria-hidden />
            <span className="text-xs font-medium">Photo unavailable</span>
          </div>
          <span className="sr-only">{alt}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          sizes={sizes}
          fetchPriority={fetchPriority}
          // Cached images can finish before React attaches onLoad — check on mount.
          ref={(el) => {
            if (el?.complete && el.naturalWidth > 0) setLoadedSrc(src);
          }}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
            loaded ? "opacity-100" : "opacity-0",
            zoomOnHover && "group-hover:scale-[1.03] motion-reduce:group-hover:scale-100",
            imgClassName,
          )}
        />
      )}
    </div>
  );
}
