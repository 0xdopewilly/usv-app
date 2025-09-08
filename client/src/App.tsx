import { useState, useEffect } from 'react';

function SimpleApp() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">USV Token App</h1>
        <p className="text-lg mb-4">App is working! Count: {count}</p>
        <button 
          onClick={() => setCount(c => c + 1)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg"
        >
          Click me! {count}
        </button>
      </div>
    </div>
  );
}

export default SimpleApp;