import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { Menu } from "lucide-react";
import { IconButton } from "../ui/IconButton";

type MenuButtonEntry = {
  id: string;
  visible: boolean;
};

type HeaderContextProps = {
  showMenuButton: boolean;
  setMenuButtonVisible: (id: string, visible: boolean) => void;
  clearMenuButtonVisible: (id: string) => void;
};

const HeaderContext = createContext<HeaderContextProps | null>(null);

function useHeaderContext() {
  const context = useContext(HeaderContext);

  if (!context) {
    throw new Error(
      "useHeaderContext must be used within a <HeaderProvider />",
    );
  }

  return context;
}

type HeaderProviderProps = {
  children: React.ReactNode;
};

export const HeaderProvider = ({ children }: HeaderProviderProps) => {
  const [menuButtonEntries, setMenuButtonEntries] = useState<MenuButtonEntry[]>(
    [],
  );

  const setMenuButtonVisible = useCallback((id: string, visible: boolean) => {
    setMenuButtonEntries((prev) => [
      ...prev.filter((entry) => entry.id !== id),
      { id, visible },
    ]);
  }, []);

  const clearMenuButtonVisible = useCallback((id: string) => {
    setMenuButtonEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const showMenuButton =
    menuButtonEntries.length > 0
      ? menuButtonEntries[menuButtonEntries.length - 1].visible
      : true;

  const value = useMemo(
    () => ({ showMenuButton, setMenuButtonVisible, clearMenuButtonVisible }),
    [showMenuButton, setMenuButtonVisible, clearMenuButtonVisible],
  );

  return <HeaderContext value={value}>{children}</HeaderContext>;
};

export function useHeaderMenuButton(visible: boolean | null | undefined) {
  const { setMenuButtonVisible, clearMenuButtonVisible } = useHeaderContext();
  const id = useId();

  useEffect(() => {
    if (visible === null || visible === undefined) {
      clearMenuButtonVisible(id);
      return;
    }

    setMenuButtonVisible(id, visible);
    return () => clearMenuButtonVisible(id);
  }, [visible, id, setMenuButtonVisible, clearMenuButtonVisible]);
}

export const Header = () => {
  const { showMenuButton } = useHeaderContext();

  if (!showMenuButton) {
    return null;
  }

  return (
    <div className="bg-base-bg absolute top-0 z-20 flex min-h-10 w-full items-center justify-center md:min-h-14">
      {/* Left block */}
      <div className="flex h-full items-center justify-center gap-x-2 ps-3">
        {showMenuButton && (
          <IconButton size="sm">
            <Menu />
          </IconButton>
        )}
      </div>
      {/* Center block */}
      <div className="flex size-full items-center justify-center gap-x-2" />
      {/* Right block */}
      <div className="flex h-full items-center justify-center gap-x-2 pe-3" />
    </div>
  );
};
