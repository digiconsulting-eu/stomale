import { Link } from "react-router-dom";

interface NavigationMenuProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

export const NavigationMenu = ({ isMobile = false, onItemClick }: NavigationMenuProps) => {
  const menuItems = [
    { to: "/recensioni", label: "Ultime Recensioni" },
    { to: "/nuova-recensione", label: "Racconta la tua esperienza" },
    { to: "/cerca-patologia", label: "Cerca Patologia" },
    { to: "/inserisci-patologia", label: "Inserisci Patologia" },
    { to: "/cerca-sintomi", label: "Cerca Sintomi" },
  ];

  const baseClasses = "text-gray-600 hover:text-primary transition-colors";
  const mobileClasses = "block py-2";

  return (
    <nav className={`${isMobile ? 'flex flex-col space-y-2' : 'hidden md:flex space-x-6'}`}>
      {menuItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`${baseClasses} ${isMobile ? mobileClasses : ''}`}
          onClick={onItemClick}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};