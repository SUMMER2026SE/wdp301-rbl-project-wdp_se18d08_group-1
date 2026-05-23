import { Search, LogIn, LogOut, User, X, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../auth/AuthModal";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import { movieService } from "../../services/movieService";

const API_BASE =
  process.env.BACKEND_URL?.replace(/\/$/, "") || "https://cinema-ticket-booking-system-3.onrender.com";

function getAvatarUrl(avatar) {
  if (!avatar) return `${API_BASE}/uploads/default-avatar.svg`;
  if (avatar.startsWith("data:")) return avatar;
  if (avatar.startsWith("http")) return avatar;
  return `${API_BASE}${avatar}`;
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const loginBtnRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await movieService.searchMovies(query, { limit: 10 });
      let results = [];
      if (response?.data && Array.isArray(response.data)) {
        results = response.data;
      } else if (Array.isArray(response)) {
        results = response;
      }
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const goToFullSearchResults = () => {
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      goToFullSearchResults();
    }
  };

  const handleMovieClick = (uuid) => {
    navigate(`/movies/${uuid}`);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "admin") navigate("/admin");
        else if (decoded.role === "staff") navigate("/staff");
        else if (decoded.role === "manager") navigate("/manager");
        else navigate("/profile");
      } catch (err) { navigate("/login"); }
    } else navigate("/login");
    setShowMenu(false);
  };

  return (
    <header className={`fixed top-0 z-[100] w-full transition-all duration-500 px-6 lg:px-24 py-5 flex items-center justify-between ${scrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-white/5 py-4' : 'bg-transparent'}`}>
      <div className="flex items-center gap-16">
        <Link to={`/`} className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
            <span className="font-black text-3xl italic">S</span>
          </div>
          <h2 className="text-white text-2xl font-black tracking-tighter uppercase italic group-hover:text-primary transition-colors italic">FCINEMA</h2>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          <Link className="text-white/60 hover:text-white transition-all text-sm font-black uppercase tracking-[0.2em]" to="/movies">Movies</Link>
          <Link className="text-white/60 hover:text-white transition-all text-sm font-black uppercase tracking-[0.2em]" to="/">Venues</Link>
          <Link className="text-white/60 hover:text-white transition-all text-sm font-black uppercase tracking-[0.2em]" to="/">Offers</Link>
          {user && (user.role === "manager" || user.role === "admin" || user.role === "staff") && (
            <Link className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors hover:text-white" to="/manager">
              Portal
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-8">
        {/* Search */}
        <div ref={searchRef} className="relative hidden lg:block">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center bg-white/5 rounded-2xl px-5 py-2.5 gap-3 border border-white/5 focus-within:border-primary/50 transition-all">
              {isSearching ? (
                <Loader2 className="text-white/20 w-4 h-4 animate-spin" />
              ) : (
                <Search className="text-white/20 w-4 h-4" />
              )}
              <input
                type="text"
                className="bg-transparent border-none focus:outline-none text-xs font-bold text-white placeholder:text-white/20 w-40"
                placeholder="SEARCH MOVIES..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => { if (searchResults.length > 0) setShowSearchResults(true); }}
              />
              {searchQuery && (
                <button type="button" onClick={clearSearch} className="text-white/20 hover:text-white transition-colors">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </form>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-neutral-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto no-scrollbar p-2"
              >
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((movie) => (
                      <button
                        key={movie.UUID || movie._id}
                        onClick={() => handleMovieClick(movie.UUID)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors text-left"
                      >
                        <div
                          className="w-10 h-14 bg-cover bg-center rounded-lg flex-shrink-0 border border-white/5"
                          style={{ backgroundImage: `url('${movie.posterUrl || movie.poster || "/no-poster.jpg"}')` }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-xs truncate uppercase tracking-tighter">
                            {movie.title}
                          </h4>
                          <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider mt-0.5">
                            {movie.genres?.map((g) => g.name).slice(0, 1).join(", ") || "Movie"} • {movie.duration}m
                          </p>
                        </div>
                        <span className="text-yellow-500 text-[10px] font-black flex items-center gap-0.5 flex-shrink-0">
                          ★ {movie.rating || "5"}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={goToFullSearchResults}
                      className="w-full p-3 text-center text-primary text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors border-t border-white/5 mt-2"
                    >
                      View All Results for “{searchQuery}”
                    </button>
                  </>
                ) : (
                  <div className="p-4 text-center text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    No results found
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!user ? (
          <button
            ref={loginBtnRef}
            onClick={() => {
              const rect = loginBtnRef.current.getBoundingClientRect();
              setModalPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
              setShowAuth(true);
            }}
            className="btn-primary !px-8 !py-3 !text-xs"
          >
            Login
          </button>
        ) : (
          <div ref={menuRef} className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10 hover:border-primary transition-all p-0.5">
              <div className="w-full h-full bg-primary/20 flex items-center justify-center rounded-[0.8rem]">
                {user?.avatar ? <img src={getAvatarUrl(user.avatar)} className="w-full h-full object-cover rounded-[0.8rem]" /> : <User className="text-white w-6 h-6" />}
              </div>
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-4 w-56 bg-neutral-900/95 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden p-2"
                >
                  <button onClick={handleProfileClick} className="w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all">Profile Setup</button>
                  <Link to="/booking-history" onClick={() => setShowMenu(false)} className="block w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all">Booking History</Link>
                  <div className="h-px bg-white/5 my-1 mx-2" />
                  <button onClick={() => { logout(); setShowMenu(false); }} className="w-full flex items-center gap-3 px-5 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><LogOut className="w-4 h-4" /> Sign Out</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} origin={modalPos} />
    </header>
  );
}
