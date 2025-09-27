console.log("🚀 main.tsx is executing!");

import { StrictMode } from "react";
console.log("✅ React imported successfully");

import { createRoot } from "react-dom/client";
console.log("✅ createRoot imported successfully");

import App from "./App";
console.log("✅ App imported successfully");

import "./index.css";
console.log("✅ CSS imported successfully");

console.log("🔍 Looking for root element...");
const rootElement = document.getElementById("root");
console.log("🔍 Root element found:", !!rootElement);

if (!rootElement) {
  console.error("❌ No root element found!");
  document.body.innerHTML = '<div style="background: orange; color: black; padding: 20px; font-size: 24px;">ERROR: No root element found!</div>';
} else {
  console.log("✅ Creating React root...");
  try {
    const root = createRoot(rootElement);
    console.log("✅ React root created, rendering App...");
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log("✅ App rendered successfully!");
  } catch (error) {
    console.error("❌ Error during rendering:", error);
    document.body.innerHTML = `<div style="background: red; color: white; padding: 20px; font-size: 24px;">ERROR: ${(error as Error).message}</div>`;
  }
}