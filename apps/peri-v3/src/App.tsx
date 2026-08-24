import { AppLayout, type Page } from "./components/layouts/AppLayout";
import { PagerProvider } from "./components/layouts/PagerProvider";
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
  return (
    <PagerProvider pageIds={pages.map((page) => page.id)}>
      <AppLayout pages={pages} />
    </PagerProvider>
  );
}

export default App;
