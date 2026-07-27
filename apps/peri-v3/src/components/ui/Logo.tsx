import { cva, type VariantProps } from "class-variance-authority";
import logoIconFilled from "@/assets/logo-icon-filled.webp";
import logoIconTransparent from "@/assets/logo-icon-transparent.webp";
import logoLockupFilled from "@/assets/logo-lockup-filled.webp";
import logoLockupTransparent from "@/assets/logo-lockup-transparent.webp";
import logoWordmarkFilled from "@/assets/logo-wordmark-filled.webp";
import logoWordmarkTransparent from "@/assets/logo-wordmark-transparent.webp";

const logoVariants = cva("object-cover", {
  variants: {
    variant: {
      icon: "",
      wordmark: "",
      lockup: "",
    },
    background: {
      filled: "",
      transparent: "",
    },
    size: {
      1: "h-8 w-8",
      2: "h-12 w-12",
      3: "h-16 w-16",
      4: "h-24 w-24",
      5: "h-32 w-32",
      6: "h-40 w-40",
      7: "h-48 w-48",
      8: "h-56 w-56",
      9: "h-64 w-64",
    },
  },
  defaultVariants: {
    variant: "icon",
    background: "transparent",
    size: 4,
  },
});

export type LogoProps = VariantProps<typeof logoVariants>;

const sources = {
  icon: {
    filled: logoIconFilled,
    transparent: logoIconTransparent,
  },
  wordmark: {
    filled: logoWordmarkFilled,
    transparent: logoWordmarkTransparent,
  },
  lockup: {
    filled: logoLockupFilled,
    transparent: logoLockupTransparent,
  },
};

export const Logo = ({ variant, background, size }: LogoProps) => {
  return (
    <img
      loading="lazy"
      src={sources[variant ?? "icon"]?.[background ?? "transparent"]}
      alt="Peri"
      className={logoVariants({ size })}
    />
  );
};
