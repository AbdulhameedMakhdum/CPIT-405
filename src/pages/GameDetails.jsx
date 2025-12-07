import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameDetails } from '../services/igdbApi';
import { firebaseService } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader2, Star, Heart, Clock, CheckCircle, XCircle, Calendar, Trash2 } from 'lucide-react';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';

const GameDetails = () => {
    const { guid } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // User interaction states
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [listStatus, setListStatus] = useState(''); // 'playing', 'completed', 'dropped', 'planning'

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const data = await getGameDetails(guid);
                setGame(data);
            } catch (err) {
                setError('Failed to load game details.');
            } finally {
                setLoading(false);
            }
        };

        fetchGame();
    }, [guid]);

    // Fetch comments and ratings
    useEffect(() => {
        if (!guid) return;

        // Reset states when guid changes (start fresh for new game)
        setListStatus('');
        setUserRating(0);
        setComments([]);

        const fetchUserData = async () => {
            // Fetch comments
            try {
                const fetchedComments = await firebaseService.getGameComments(guid);
                setComments(fetchedComments);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }

            if (currentUser) {
                // Fetch rating
                try {
                    const rating = await firebaseService.getUserRating(currentUser.uid, guid);
                    setUserRating(rating);
                } catch (error) {
                    console.error("Error fetching rating:", error);
                }

                // Fetch list status
                try {
                    const profile = await firebaseService.getUserProfile(currentUser.uid);
                    if (profile) {
                        if (profile.playing?.some(g => g.guid == guid)) setListStatus('playing');
                        else if (profile.completed?.some(g => g.guid == guid)) setListStatus('completed');
                        else if (profile.planning?.some(g => g.guid == guid)) setListStatus('planning');
                        else if (profile.dropped?.some(g => g.guid == guid)) setListStatus('dropped');
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            }
        };

        fetchUserData();
    }, [guid, currentUser]);


    const handleRate = async (rating) => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        // Optimistic update
        const previousRating = userRating;
        setUserRating(rating);

        try {
            await firebaseService.addRating(guid, rating, currentUser.uid);
            addToast('Rating saved!', 'success');
        } catch (err) {
            console.error(err);
            setUserRating(previousRating);
            addToast('Failed to save rating.', 'error');
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        if (!comment.trim()) return;

        try {
            await firebaseService.addComment(guid, comment, currentUser.uid, currentUser.displayName || currentUser.email);
            setComment('');

            // Fetch latest comments
            const fetchedComments = await firebaseService.getGameComments(guid);
            setComments(fetchedComments);
            addToast('Comment posted!', 'success');
        } catch (err) {
            console.error(err);
            addToast('Failed to post comment.', 'error');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await firebaseService.deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
            addToast('Comment deleted.', 'success');
        } catch (err) {
            console.error(err);
            addToast('Failed to delete comment.', 'error');
        }
    };

    const handleListUpdate = async (status) => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const previousStatus = listStatus;
        const isRemoving = listStatus === status;
        const newStatus = isRemoving ? '' : status;

        // Optimistic update
        setListStatus(newStatus);

        try {
            const gameData = {
                guid: game.guid,
                name: game.name,
                image: game.image?.original_url || game.image?.medium_url
            };

            if (isRemoving) {
                await firebaseService.updateUserList(currentUser.uid, status, gameData, 'remove');
                addToast(`Removed from ${status} list`, 'info');
            } else {
                // Remove from all other lists first to ensure mutual exclusivity
                const lists = ['playing', 'completed', 'planning', 'dropped'];
                for (const list of lists) {
                    if (list !== status) {
                        await firebaseService.updateUserList(currentUser.uid, list, gameData, 'remove');
                    }
                }
                // Add to the new list
                await firebaseService.updateUserList(currentUser.uid, status, gameData, 'add');
                addToast(`Added to ${status} list!`, 'success');
            }
        } catch (err) {
            console.error(err);
            setListStatus(previousStatus);
            addToast('Failed to update list.', 'error');
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;
    if (error) return <div className="text-red-500 text-center py-20">{error}</div>;
    if (!game) return <div className="text-center py-20">Game not found.</div>;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Hero Header */}
            <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8">
                <img
                    src={game.image?.original_url || 'https://placehold.co/1920x1080?text=No+Image'}
                    alt={game.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/60 to-transparent flex items-end p-8">
                    <div>
                        <h1 className="text-5xl font-black text-white mb-4">{game.name}</h1>
                        <div className="flex items-center space-x-6 text-gray-300">
                            <span className="flex items-center"><Calendar className="w-5 h-5 mr-2" /> {game.original_release_date}</span>
                            {/* Genres */}
                            {game.genres && (
                                <div className="flex space-x-2">
                                    {game.genres.map(g => (
                                        <span key={g.name} className="bg-dark/80 px-3 py-1 rounded-full text-sm border border-gray-700">{g.name}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-dark p-6 rounded-xl border border-gray-800">
                        <h2 className="text-2xl font-bold mb-4 text-primary">About</h2>
                        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: game.description || game.deck }} />
                    </section>

                    {/* Comments Section */}
                    <section className="bg-dark p-6 rounded-xl border border-gray-800">
                        <h2 className="text-2xl font-bold mb-6">Comments</h2>
                        <form onSubmit={handleComment} className="mb-8">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full bg-darker border border-gray-700 rounded-lg p-4 focus:outline-none focus:border-primary text-white"
                                placeholder="Share your thoughts..."
                                rows="3"
                            ></textarea>
                            <button type="submit" className="mt-2 bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors">
                                Post Comment
                            </button>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-4">
                            {comments.length > 0 ? (
                                comments.map((c) => (
                                    <div key={c.id} className="bg-darker p-4 rounded-lg relative group">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold text-primary">{c.userName}</span>
                                            <span className="text-xs text-gray-500">{c.timestamp?.toDate ? c.timestamp.toDate().toLocaleDateString() : 'Just now'}</span>
                                        </div>
                                        <p className="text-gray-300">{c.comment}</p>
                                        {currentUser && currentUser.uid === c.userId && (
                                            <button
                                                onClick={() => handleDeleteComment(c.id)}
                                                className="absolute bottom-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete Comment"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No comments yet. Be the first!</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* User Actions */}
                    <div className="bg-dark p-6 rounded-xl border border-gray-800">
                        {/* User Actions */}
                        <h3 className="text-xl font-bold mb-4">Your Activity</h3>

                        <div className="space-y-6">
                            {/* Status */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['playing', 'completed', 'planning', 'dropped'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleListUpdate(status)}
                                            className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-200 ${listStatus === status
                                                ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                                                : 'border-gray-700 text-gray-400 hover:border-primary hover:text-white'
                                                }`}
                                        >
                                            {status === 'playing' && <Loader2 className={`w-4 h-4 mr-2 ${listStatus === status ? 'animate-spin' : ''}`} />}
                                            {status === 'completed' && <CheckCircle className="w-4 h-4 mr-2" />}
                                            {status === 'planning' && <Clock className="w-4 h-4 mr-2" />}
                                            {status === 'dropped' && <XCircle className="w-4 h-4 mr-2" />}
                                            <span className="capitalize">{status === 'planning' ? 'Plan to Play' : status}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Your Rating: <span className="text-primary font-bold">{userRating > 0 ? userRating : 'Not Rated'}</span></label>
                                <div className="flex space-x-2" onMouseLeave={() => setHoverRating(0)}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleRate(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${(hoverRating || userRating) >= star
                                                    ? 'fill-yellow-500 text-yellow-500'
                                                    : 'text-gray-600'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Game Info */}
                    <div className="bg-dark p-6 rounded-xl border border-gray-800">
                        <h3 className="text-xl font-bold mb-4">Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-gray-800 pb-2">
                                <span className="text-gray-400">Developer</span>
                                <span className="text-white text-right">{game.developers?.map(d => d.name).join(', ') || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-800 pb-2">
                                <span className="text-gray-400">Publisher</span>
                                <span className="text-white text-right">{game.publishers?.map(p => p.name).join(', ') || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-800 pb-2">
                                <span className="text-gray-400">Franchises</span>
                                <span className="text-white text-right">{game.franchises?.map(f => f.name).join(', ') || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameDetails;
