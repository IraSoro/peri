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
      1: "h-16 w-16 md:h-28 md:w-28 lg:w-44 lg:h-44",
      2: "h-28 w-28 md:h-36 md:w-36 lg:w-52 lg:h-52",
      3: "h-36 w-36 md:h-44 md:w-44 lg:w-64 lg:h-64",
      4: "h-44 w-44 md:h-52 md:w-52 lg:w-76 lg:h-76",
      5: "h-52 w-52 md:h-64 md:w-64 lg:w-88 lg:h-88",
    },
  },
  defaultVariants: {
    variant: "icon",
    background: "transparent",
    size: 1,
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
