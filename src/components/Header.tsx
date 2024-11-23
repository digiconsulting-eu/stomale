import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "/logo.png"; // Import the logo directly

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            <img src={logo} alt="StoMale.info" className="h-8" />
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/recensioni" className="text-text hover:text-primary transition-colors">
              Leggi le recensioni
            </Link>
            <Link to="/nuova-recensione" className="text-text hover:text-primary transition-colors">
              Racconta la tua esperienza
            </Link>
            <Link to="/cerca-patologia" className="text-text hover:text-primary transition-colors">
              Cerca patologia
            </Link>
            <Link to="/cerca-sintomi" className="text-text hover:text-primary transition-colors">
              Cerca Sintomi
            </Link>
            <Link to="/patologie" className="text-text hover:text-primary transition-colors">
              Elenco Patologie
            </Link>
            <Link to="/inserisci-patologia" className="text-text hover:text-primary transition-colors">
              Inserisci Patologia
            </Link>
            <Link to="/blog" className="text-text hover:text-primary transition-colors">
              Blog
            </Link>
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link to="/login">Accedi</Link>
            </Button>
            <Button asChild>
              <Link to="/registrati">Registrati</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/recensioni"
                className="text-text hover:text-primary transition-colors px-2 py-1"
                onClick={toggleMenu}
              >
                Leggi le recensioni
              </Link>
              <Link
                to="/nuova-recensione"
                className="text-text hover:text-primary transition-colors px-2 py-1"
                onClick={toggleMenu}
              >
                Racconta la tua esperienza
              </Link>
              <Link
                to="/cerca-patologia"
                className="text-text hover:text-primary transition-colors px-2 py-1"
                onClick={toggleMenu}
              >
                Cerca patologia
              </Link>
              <Link
                to="/cerca-sintomi"
                className="text-text hover:text-primary transition-colors px-2 py-1"
                onClick={toggleMenu}
              >
                Cerca Sintomi
              </Link>
              <Link
                to="/patologie"
                className="text-text hover:text-primary transition-colors px-2 py-1"
                onClick={toggleMenu}
              >
                Elenco Patologie
              </Link>
              <Link
                to="/inserisci-patologia"
                className="text-text hover:text-primary transition-colors px-2 py-1"
                onClick={toggleMenu}
              >
                Inserisci Patologia
              </Link>
              <Link
                to="/blog"
                className="text-text hover:text-primary transition-colors px-2 py-1"
                onClick={toggleMenu}
              >
                Blog
              </Link>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" asChild>
                  <Link to="/login" onClick={toggleMenu}>Accedi</Link>
                </Button>
                <Button asChild>
                  <Link to="/registrati" onClick={toggleMenu}>Registrati</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};