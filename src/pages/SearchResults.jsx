import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchGames } from '../services/igdbApi';
import GameCard from '../components/game/GameCard';
import { Loader2 } from 'lucide-react';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;

            setLoading(true);
            setError(null);
            try {
                const data = await searchGames(query);
                setGames(data.results || []);
            } catch (err) {
                setError('Failed to search games. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
                Search Results for <span className="text-primary">"{query}"</span>
            </h2>

            {loading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            )}

            {error && (
                <div className="text-red-500 text-center py-10">{error}</div>
            )}

            {!loading && !error && games.length === 0 && (
                <div className="text-gray-400 text-center py-20">No games found.</div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {games.map(game => (
                    <GameCard key={game.guid} game={game} />
                ))}
            </div>
        </div>
    );
};

export default SearchResults;
