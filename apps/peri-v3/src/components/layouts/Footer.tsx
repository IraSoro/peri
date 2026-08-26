import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { Loader } from "../ui/Loader";

type LoaderEntry = {
  id: string;
  message: string;
};

type FooterContextProps = {
  loaderMessage: string | null;
  showLoader: (id: string, message: string) => void;
  hideLoader: (id: string) => void;
};

const FooterContext = createContext<FooterContextProps | null>(null);

function useFooterContext() {
  const context = useContext(FooterContext);

  if (!context) {
    throw new Error(
      "useFooterContext must be used within a <FooterProvider />",
    );
  }

  return context;
}

type FooterProviderProps = {
  children: React.ReactNode;
};

export const FooterProvider = ({ children }: FooterProviderProps) => {
  const [loaderEntries, setLoaderEntries] = useState<LoaderEntry[]>([]);

  const showLoader = useCallback((id: string, message: string) => {
    setLoaderEntries((prev) => [
      ...prev.filter((entry) => entry.id !== id),
      { id, message },
    ]);
  }, []);

  const hideLoader = useCallback((id: string) => {
    setLoaderEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const loaderMessage =
    loaderEntries.length > 0
      ? loaderEntries[loaderEntries.length - 1].message
      : null;

  const value = useMemo(
    () => ({ loaderMessage, showLoader, hideLoader }),
    [loaderMessage, showLoader, hideLoader],
  );

  return <FooterContext value={value}>{children}</FooterContext>;
};

export function useFooterLoader(message: string | null | undefined) {
  const { showLoader, hideLoader } = useFooterContext();
  const id = useId();

  useEffect(() => {
    if (!message) {
      hideLoader(id);
      return;
    }

    showLoader(id, message);
    return () => hideLoader(id);
  }, [message, id, showLoader, hideLoader]);
}

export const Footer = () => {
  const { loaderMessage } = useFooterContext();

  if (!loaderMessage || loaderMessage?.length == 0) {
    return null;
  }

  return (
    <div className="bg-base-bg absolute bottom-0 z-20 flex min-h-10 w-full items-center justify-center md:min-h-14">
      {/* Left block */}
      <div className="flex h-full items-center justify-center gap-x-2 pl-3" />
      {/* Center block */}
      <div className="flex size-full items-center justify-center gap-x-2">
        {loaderMessage && <Loader message={loaderMessage} />}
      </div>
      {/* Right block */}
      <div className="flex h-full items-center justify-center gap-x-2 pr-3" />
    </div>
  );
};
