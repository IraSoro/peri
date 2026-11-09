import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import "@/tailwind.css";

async function bootstrap() {
  const start = performance.now();

  console.info(
    `[bootstrap] ${import.meta.env.VITE_APP_NAME} v${import.meta.env.VITE_APP_VERSION} starting (${import.meta.env.MODE})`,
  );

  await import("@/services/store/service");
  await import("@/services/apps/service");
  await import("@/services/algorithms/service");
  await import("@/services/cycles/service");
  await import("@/services/core/service");

  console.info(`[bootstrap] ready in ${performance.now() - start}ms`);

  return Promise.resolve({});
}

const root = createRoot(document.getElementById("root")!);
bootstrap()
  .then(() =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  )
  .catch((err) =>
    console.error(`[bootstrap] failed ${(err as Error).message}`),
  );
