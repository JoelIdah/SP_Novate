import type { CSSProperties } from "react";
import type { ReactNode } from "react";

const PUBLIC_AVATAR_IMAGES = [
  "/images/ava 1.jpg",
  "/images/ava 2.jpg",
  "/images/man.png",
  "/images/profile.png",
  "/images/woman.png",
] as const;

type AvatarProps = {
  initials?: string;
  src?: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  randomImage?: boolean;
  randomSeed?: string;
};

function pickRandomPublicImage(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PUBLIC_AVATAR_IMAGES.length;
  return PUBLIC_AVATAR_IMAGES[index];
}

export function Avatar({ initials, src, alt, className = "", style, children, randomImage = false, randomSeed }: AvatarProps) {
  const baseClass = className.trim();
  const resolvedSrc = src ?? (randomImage ? pickRandomPublicImage(randomSeed ?? `${alt ?? ""}-${initials ?? ""}`) : undefined);

  if (resolvedSrc) {
    return (
      <div
        aria-label={alt}
        className={baseClass}
        role={alt ? "img" : undefined}
        style={{
          ...style,
          backgroundImage: `url(${resolvedSrc})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={baseClass} style={style}>
      {children ?? (
        <span className="flex h-full w-full items-center justify-center text-sm font-semibold">{initials}</span>
      )}
    </div>
  );
}

