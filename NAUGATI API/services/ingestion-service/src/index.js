import "dotenv/config";
import { loadRuntimeConfig } from "./config/runtimeConfig.js";
import { createIngestionRuntime } from "./runtime/createIngestionRuntime.js";

async function bootstrap() {
  try {
    const config = loadRuntimeConfig();
    const runtime = createIngestionRuntime(config);

    await runtime.start();

    console.log("NAUGATI ingestion-service started.");
    console.log(
      `Scheduler: ${config.schedulerEnabled ? "ENABLED" : "DISABLED"}`
    );
    console.log(
      `Configured tasks: ${
        runtime.tasks.length > 0
          ? runtime.tasks.map((t) => t.name).join(", ")
          : "none"
      }`
    );

    let isShuttingDown = false;
    const handleShutdown = () => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      runtime.stop();
      console.log("NAUGATI ingestion-service stopped.");
      process.exit(0);
    };

    process.once("SIGINT", handleShutdown);
    process.once("SIGTERM", handleShutdown);

    return runtime;
  } catch (error) {
    console.error(`Failed to start NAUGATI ingestion-service: ${error.message}`);
    process.exit(1);
  }
}

bootstrap();