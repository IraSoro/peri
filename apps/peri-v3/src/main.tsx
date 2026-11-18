import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/tailwind.css";
import { NoDataError } from "@/lib/sdk/app/errors";

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

  await import("@/algorithms/median-menstruation/algorithm");
  await import("@/algorithms/median-ovulation/algorithm");

  // Dev only, `?seed=<name>` loads test cycles. Vite drops it from a build
  if (import.meta.env.DEV) {
    await import("@/dev/seed");
  }

  await import("@/apps/Calendar/App");
  await import("@/apps/CycleInfo/App");
  await import("@/apps/PeriodStatus/App");
  await import("@/apps/PhaseInfo/App");

  // NOTE: Imported here, not at the top: App pulls in the services, which must
  // start before it
  const { default: App } = await import("@/App");

  console.info(
    `[bootstrap] ready in ${(performance.now() - start).toFixed(1)}ms`,
  );

  return { App };
}

const root = createRoot(document.getElementById("root")!, {
  // An app with no data throws NoDataError on purpose, React would log it as
  // a failure each time. The rest is logged as React does by default
  onCaughtError: (error, info) => {
    if (!(error instanceof NoDataError)) {
      console.error(error, info.componentStack);
    }
  },
});
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
