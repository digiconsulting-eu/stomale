import { Search } from "lucide-react";

export const SearchBar = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Cerca sintomi o patologie..."
        className="input pl-12"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
    </div>
  );
};