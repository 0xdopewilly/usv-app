import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
import App from "./App";
import "./index.css";
import "./lib/i18n";

// Polyfill Buffer for browser (required for Solana/crypto modules)
globalThis.Buffer = Buffer;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);