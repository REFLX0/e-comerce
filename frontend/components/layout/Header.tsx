'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Heart, User, ChevronDown } from 'lucide-react'
import { MiniCart } from './MiniCart'
import { MobileMenu } from './MobileMenu'
import { useAuthStore } from '@/lib/store/auth.store'
import { useWishlistStore } from '@/lib/store/wishlist.store'
import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import Image from 'next/image'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHoveringMenu, setIsHoveringMenu] = useState(false)
  const { isAuthenticated, user } = useAuthStore()
  const wishlistItems = useWishlistStore((state) => state.items)

  const { data: categories } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
  })

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-soft'
          : 'bg-white shadow-sm'
      }`}
    >
      {/* Top bar */}
      <div className="bg-brand-primary text-white text-xs py-2">
        <div className="section-padding flex justify-between items-center">
          <p className="hidden md:block">Livraison Gratuite à partir de 100 DT</p>
          <p className="md:hidden text-center w-full">Livraison Gratuite à partir de 100 DT</p>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/contact" className="hover:text-brand-accent transition-colors">Contact</Link>
            <Link href="/faq" className="hover:text-brand-accent transition-colors">FAQ</Link>
            <Link href="/contact?service=professionel" className="hover:text-brand-accent transition-colors text-brand-accent font-semibold">Vous êtes professionnel ?</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="section-padding py-4">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center gap-4">
            <MobileMenu />
            <Link href="/" className="shrink-0 flex items-center">
              <span className="font-display font-bold text-2xl tracking-tight text-brand-primary">
                Best<span className="text-brand-accent">oil</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-brand-primary transition-colors">
              Accueil
            </Link>
            
            {/* Mega Menu Trigger */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsHoveringMenu(true)}
              onMouseLeave={() => setIsHoveringMenu(false)}
            >
              <Link href="/catalogue" className="flex items-center gap-1 text-sm font-medium hover:text-brand-primary transition-colors py-4">
                Catalogue <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
              </Link>

              {/* Mega Menu Dropdown */}
              {isHoveringMenu && categories && categories.length > 0 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[800px] bg-white shadow-card-hover rounded-xl border border-gray-100 p-6 grid grid-cols-3 gap-8">
                  {categories.slice(0, 6).map(category => (
                    <div key={category.id}>
                      <Link 
                        href={`/categorie/${category.slug}`}
                        className="font-display font-semibold text-brand-primary hover:text-brand-accent mb-3 block"
                      >
                        {category.name}
                      </Link>
                      <ul className="space-y-2">
                        {category.children?.slice(0, 5).map(sub => (
                          <li key={sub.id}>
                            <Link 
                              href={`/categorie/${sub.slug}`}
                              className="text-sm text-gray-500 hover:text-brand-primary transition-colors block"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/promotions" className="text-sm font-medium text-brand-accent hover:text-brand-accent-hover transition-colors">
              Promotions
            </Link>
            <Link href="/trouver-mon-huile" className="text-sm font-medium hover:text-brand-primary transition-colors">
              Configurateur
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md relative">
            <input 
              type="text" 
              placeholder="Rechercher une huile, une marque, une viscosité..." 
              className="w-full bg-brand-surface border-transparent focus:bg-white focus:border-brand-primary/30 rounded-full py-2.5 pl-5 pr-12 text-sm transition-all outline-none"
              aria-label="Recherche"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-brand-primary" aria-label="Lancer la recherche">
              <Search size={18} />
            </button>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            <button className="lg:hidden p-2 text-gray-600 hover:text-brand-primary" aria-label="Rechercher">
              <Search size={24} />
            </button>
            
            <Link 
              href={isAuthenticated ? "/compte" : "/auth/login"} 
              className="p-2 text-gray-600 hover:text-brand-primary hidden sm:block relative group"
              aria-label="Mon compte"
            >
              <User size={24} />
              {isAuthenticated && (
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </Link>

            <Link href="/compte/favoris" className="p-2 text-gray-600 hover:text-brand-primary relative" aria-label="Favoris">
              <Heart size={24} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-brand-accent rounded-full">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <MiniCart />
          </div>
        </div>
      </div>
    </header>
  )
}
