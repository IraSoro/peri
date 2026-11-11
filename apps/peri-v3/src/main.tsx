import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
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

  // NOTE: Imported here, not at the top: App pulls in the services and the widget
  // registration, which must start after the services above
  const { default: App } = await import("@/App");

  console.info(
    `[bootstrap] ready in ${(performance.now() - start).toFixed(1)}ms`,
  );

  return { App };
}

const root = createRoot(document.getElementById("root")!);
bootstrap()
  .then(({ App }) =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  )
  .catch((err) =>
    console.error(`[bootstrap] failed ${(err as Error).message}`),
  );
