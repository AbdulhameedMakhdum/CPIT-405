import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const GameCard = ({ game }) => {
    // Support IGDB structure
    const imageUrl = game.image?.medium_url || game.image?.small_url || game.image?.original_url || 'https://placehold.co/300x400?text=No+Image';

    let releaseYear = 'N/A';
    if (game.original_release_date && game.original_release_date !== 'N/A') {
        const date = new Date(game.original_release_date);
        if (!isNaN(date.getTime())) {
            releaseYear = date.getFullYear();
        }
    }

    return (
        <Link to={`/game/${game.guid}`} className="group block bg-dark rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/20">
            <div className="relative aspect-[3/4] overflow-hidden">
                <img
                    src={imageUrl}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-primary font-bold text-sm">View Details</span>
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-white truncate group-hover:text-primary transition-colors">{game.name}</h3>
                <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                    <span>{releaseYear}</span>
                    <div className="flex items-center space-x-1">
                        {game.rating && (
                            <>
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span>{Math.round(game.rating)}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default GameCard;
