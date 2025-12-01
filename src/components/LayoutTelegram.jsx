export default function LayoutTelegram({ title, children, onBack }) {
  return (
    <div className="flex flex-col h-screen bg-[#E8F5FF]">
      {/* TOP BAR */}
      <div className="bg-[#229ED9] text-white px-4 py-3 flex items-center gap-3 shadow-md">
        {onBack && (
          <button onClick={onBack} className="text-white text-xl">
            ←
          </button>
        )}

        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-3">
        {children}
      </div>
    </div>
  );
}
