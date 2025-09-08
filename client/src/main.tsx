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
      fontSize: '24px'
    }}>
      <h1>USV Token App is WORKING!</h1>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}