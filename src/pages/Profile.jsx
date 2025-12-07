import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { firebaseService } from '../services/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Gamepad2, CheckCircle, Clock, XCircle, Edit2, Save, X, UploadCloud } from 'lucide-react';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';

const Profile = () => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhoto, setEditPhoto] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        // Initialize edit state
        setEditName(currentUser.displayName || '');
        setEditPhoto(currentUser.photoURL || '');

        const unsubscribe = onSnapshot(
            doc(firebaseService.db, "users", currentUser.uid),
            (doc) => {
                if (doc.exists()) {
                    setProfile(doc.data());
                }
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile data. " + err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser, navigate]);

    const handleSaveProfile = async () => {
        setSaving(true);
        console.log("Starting profile save...");
        try {
            // Update Auth Profile
            console.log("Updating Auth profile...");
            await firebaseService.updateUserProfile(currentUser, {
                displayName: editName
            });
            console.log("Auth profile updated.");

            // Update comments with new username
            console.log("Updating comments username...");
            await firebaseService.updateUserCommentsName(currentUser.uid, editName);
            console.log("Comments username updated.");

            // Update Firestore Profile
            console.log("Updating Firestore profile...");
            // Use setDoc with merge: true to create the document if it doesn't exist
            await setDoc(doc(firebaseService.db, "users", currentUser.uid), {
                displayName: editName
            }, { merge: true });
            console.log("Firestore profile updated.");

            setIsEditing(false);
            addToast("Profile updated successfully!", "success");

        } catch (error) {
            console.error("Error updating profile:", error);
            addToast("Failed to update profile. " + error.message, "error");
        } finally {
            setSaving(false);
            console.log("Profile save finished.");
        }
    };

    const handleRemoveGame = async (listName, game) => {
        try {
            await firebaseService.updateUserList(currentUser.uid, listName, game, 'remove');
            addToast(`Removed ${game.name} from ${listName}`, 'success');
        } catch (error) {
            console.error("Error removing game:", error);
            addToast("Failed to remove game.", "error");
        }
    };

    const ListSection = ({ title, items, icon: Icon, color, listName }) => (
        <div className="bg-dark p-6 rounded-xl border border-gray-800">
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-800 pb-4">
                <Icon className={`w-6 h-6 ${color}`} />
                <h3 className="text-xl font-bold text-white">{title} <span className="text-gray-500 text-sm ml-2">({items?.length || 0})</span></h3>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
            ) : items && items.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map((game, index) => (
                        <div key={`${game.guid}-${index}`} className="relative group">
                            <Link to={`/game/${game.guid}`} className="block">
                                <div className="aspect-[3/4] rounded-lg overflow-hidden relative mb-2">
                                    <img
                                        src={game.image || 'https://placehold.co/300x400?text=No+Image'}
                                        alt={game.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-xs font-bold text-white bg-primary px-2 py-1 rounded">View</span>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-300 truncate group-hover:text-primary">{game.name}</p>
                            </Link>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleRemoveGame(listName, game);
                                }}
                                className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-10"
                                title="Remove from list"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-sm italic">No games in this list yet.</p>
            )}
        </div>
    );

    if (!currentUser) return null;

    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-8 text-center bg-dark rounded-2xl border border-red-900/50 text-red-400">
                <h2 className="text-xl font-bold mb-2">Error Loading Profile</h2>
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-darker hover:bg-gray-800 rounded text-white text-sm transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="bg-dark p-8 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-darker bg-darker flex items-center justify-center text-4xl font-bold text-white relative">
                        {currentUser.photoURL ? (
                            <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-primary flex items-center justify-center">
                                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    {isEditing ? (
                        <div className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Display Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-darker border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div className="flex space-x-2 justify-center md:justify-start">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>Save</span>
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-center md:justify-start space-x-3 mb-1">
                                <h1 className="text-3xl font-bold text-white">{currentUser.displayName || 'My Profile'}</h1>
                                <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-primary transition-colors">
                                    <Edit2 className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-gray-400">{currentUser.email}</p>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="grid grid-cols-1 gap-8">
                    <ListSection title="Currently Playing" items={profile?.playing} icon={Gamepad2} color="text-primary" listName="playing" />
                    <ListSection title="Completed" items={profile?.completed} icon={CheckCircle} color="text-green-500" listName="completed" />
                    <ListSection title="Plan to Play" items={profile?.planning} icon={Clock} color="text-blue-500" listName="planning" />
                    <ListSection title="Dropped" items={profile?.dropped} icon={XCircle} color="text-red-800" listName="dropped" />
                </div>
            </div>
        </div>
    );
};

export default Profile;
