import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Simple test component to verify React works
function TestApp() {
  return (
    <div style={{
      background: 'red',
      color: 'white', 
      padding: '50px',
      fontSize: '30px',
      minHeight: '100vh'
    }}>
      <h1>🚀 REACT IS WORKING!</h1>
      <p>Test component loaded successfully</p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TestApp />
  </StrictMode>
);