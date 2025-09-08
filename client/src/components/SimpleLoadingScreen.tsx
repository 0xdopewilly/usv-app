export default function SimpleLoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white font-bold text-xl">USV</span>
        </div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}