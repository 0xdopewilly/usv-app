export default function SimpleLoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 animate-pulse">
          <img 
            src="/usv-logo.png" 
            alt="USV Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}