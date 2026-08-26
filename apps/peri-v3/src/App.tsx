import { DirectionProvider } from "@base-ui/react/direction-provider";
import { AppLayout, type Page } from "./components/layouts/AppLayout";
import { PagerProvider } from "./components/layouts/PagerProvider";
import { FooterProvider } from "./components/layouts/Footer";
import { WelcomePage } from "./pages/WelcomePage";
import { SetupPage } from "./pages/SetupPage";
import { InitializationPage } from "./pages/InitializationPage";
import { FirstPage } from "./pages/FirstPage";
import { SecondPage } from "./pages/SecondPage";

const pages: Page[] = [
  { id: "welcome", content: <WelcomePage /> },
  { id: "setup", content: <SetupPage /> },
  { id: "initialization", content: <InitializationPage /> },
  { id: "first", content: <FirstPage /> },
  { id: "second", content: <SecondPage /> },
];

function App() {
  // Once an i18n/locale layer exists, drive `dir` from the active locale
  // instead of the static value in index.html, and keep <DirectionProvider>
  // below in sync with it, e.g.:
  //
  // import { useLocale, isRtlLocale } from "@/lib/i18n";
  // const locale = useLocale();
  // const dir = isRtlLocale(locale) ? "rtl" : "ltr";
  // useEffect(() => {
  //   document.documentElement.lang = locale;
  //   document.documentElement.dir = dir;
  // }, [locale, dir]);
  //
  // For now `dir` is set by hand in index.html.

  const dir = "ltr";
  document.documentElement.dir = dir;

  return (
    <DirectionProvider direction={dir}>
      <PagerProvider pageIds={pages.map((page) => page.id)}>
        <FooterProvider>
          <AppLayout pages={pages} />
        </FooterProvider>
      </PagerProvider>
    </DirectionProvider>
  );
}

export default App;
