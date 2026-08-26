import { Menu } from "lucide-react";
import { IconButton } from "../ui/IconButton";

export const Header = () => {
  return (
    <div className="bg-base-bg absolute top-0 z-20 flex min-h-10 w-full items-center justify-center md:min-h-14">
      {/* Left block */}
      <div className="flex h-full items-center justify-center gap-x-2 pl-3">
        <IconButton size="sm">
          <Menu />
        </IconButton>
      </div>
      {/* Center block */}
      <div className="flex size-full items-center justify-center gap-x-2" />
      {/* Right block */}
      <div className="flex h-full items-center justify-center gap-x-2 pr-3" />
    </div>
  );
};
