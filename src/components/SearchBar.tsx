import { Search } from "lucide-react";

export const SearchBar = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Cerca sintomi o patologie..."
        className="w-full px-6 py-4 pl-14 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 backdrop-blur-sm shadow-lg text-lg"
      />
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={24} />
    </div>
  );
};