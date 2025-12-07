import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { searchGames } from '../../services/igdbApi';
import { Search, Menu, X, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsMenuOpen(false);
            setShowDropdown(false);
        }
    };

    React.useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsSearching(true);
                try {
                    const data = await searchGames(searchQuery);
                    setSearchResults(data.results || []);
                    setShowDropdown(true);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <nav className="bg-dark border-b border-gray-800 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-primary tracking-tighter">
                        MY<span className="text-white">GAMELIST</span>
                    </Link>

                    {/* Desktop Search */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
                        <input
                            type="text"
                            placeholder="Search games..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => { if (searchQuery.trim()) setShowDropdown(true); }}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                            className="w-full bg-darker border border-gray-700 rounded-full py-2 px-4 pl-10 focus:outline-none focus:border-primary text-sm transition-colors"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />

                        {/* Search Dropdown */}
                        {showDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-darker border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                                {isSearching ? (
                                    <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    <ul>
                                        {searchResults.map((game) => (
                                            <li key={game.guid} className="border-b border-gray-800 last:border-none">
                                                <Link
                                                    to={`/game/${game.guid}`}
                                                    className="flex items-center p-3 hover:bg-gray-800 transition-colors"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    {game.image && (
                                                        <img
                                                            src={game.image.original_url}
                                                            alt={game.name}
                                                            className="w-10 h-14 object-cover rounded mr-3"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-sm text-white">{game.name}</div>
                                                        <div className="text-xs text-gray-400">{game.original_release_date.split('-')[0]}</div>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-4 text-center text-gray-400 text-sm">No results found</div>
                                )}
                            </div>
                        )}
                    </form>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center space-x-6">
                        {currentUser ? (
                            <>
                                <Link to="/profile" className="flex items-center space-x-2 hover:text-primary transition-colors">
                                    <User className="h-5 w-5" />
                                    <span>Profile</span>
                                </Link>
                                <button onClick={handleLogout} className="flex items-center space-x-2 hover:text-primary transition-colors">
                                    <LogOut className="h-5 w-5" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
                                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors font-medium text-sm">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-300 hover:text-white">
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-darker border-t border-gray-800 p-4">
                    <form onSubmit={handleSearch} className="mb-4 relative">
                        <input
                            type="text"
                            placeholder="Search games..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-dark border border-gray-700 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-primary"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </form>
                    <div className="flex flex-col space-y-4">
                        {currentUser ? (
                            <>
                                <Link to="/profile" className="flex items-center space-x-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                                    <User className="h-5 w-5" />
                                    <span>Profile</span>
                                </Link>
                                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex items-center space-x-2 hover:text-primary text-left">
                                    <LogOut className="h-5 w-5" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hover:text-primary" onClick={() => setIsMenuOpen(false)}>Login</Link>
                                <Link to="/register" className="text-primary font-medium" onClick={() => setIsMenuOpen(false)}>Register</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
