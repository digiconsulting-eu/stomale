import { Link } from "react-router-dom";

interface NavigationMenuProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

export const NavigationMenu = ({ isMobile = false, onItemClick }: NavigationMenuProps) => {
  const menuItems = [
    { to: "/recensioni", label: "Recensioni" },
    { to: "/nuova-recensione", label: "Racconta la tua esperienza" },
    { to: "/cerca-patologia", label: "Cerca Patologia" },
    { to: "/inserisci-patologia", label: "Inserisci Patologia" },
    { to: "/cerca-sintomi", label: "Cerca Sintomi" },
    { to: "/blog", label: "Blog" },
  ];

  return (
    <nav className={`${isMobile ? 'flex flex-col space-y-4' : 'hidden md:flex space-x-4'}`}>
      {menuItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="text-gray-600 hover:text-primary transition-colors"
          onClick={onItemClick}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};