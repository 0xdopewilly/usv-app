import { createRoot } from "react-dom/client";

function App() {
  return (
    <div style={{ 
      background: '#000', 
      color: '#fff', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '32px',
      fontWeight: 'bold'
    }}>
      <div>
        <h1>🚀 USV TOKEN APP IS WORKING! 🚀</h1>
        <p style={{fontSize: '18px', textAlign: 'center', marginTop: '20px'}}>
          External browser test successful!
        </p>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found!");
}