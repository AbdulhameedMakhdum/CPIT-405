import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

class FirebaseService {
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);

        // Initialize Firestore with persistent local cache
        this.db = initializeFirestore(this.app, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager()
            })
        });

        this.storage = getStorage(this.app);
    }

    // Storage Methods
    async uploadProfilePicture(file, userId) {
        const storageRef = ref(this.storage, `profile_pictures/${userId}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    }

    // Auth Methods
    register(email, password) {
        return createUserWithEmailAndPassword(this.auth, email, password);
    }

    login(email, password) {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    logout() {
        return signOut(this.auth);
    }

    googleLogin() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(this.auth, provider);
    }

    resetPassword(email) {
        return sendPasswordResetEmail(this.auth, email);
    }

    onAuthStateChanged(callback) {
        return onAuthStateChanged(this.auth, callback);
    }

    updateUserProfile(user, updates) {
        return updateProfile(user, updates);
    }

    // User Data Methods
    async getUserProfile(uid) {
        const docRef = doc(this.db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            // Create default profile if not exists
            const defaultProfile = {
                favorites: [],
                playing: [],
                completed: [],
                dropped: [],
                planning: []
            };
            await setDoc(docRef, defaultProfile);
            return defaultProfile;
        }
    }

    async updateUserList(uid, listName, gameData, action = 'add') {
        const docRef = doc(this.db, "users", uid);
        if (action === 'add') {
            await updateDoc(docRef, {
                [listName]: arrayUnion(gameData)
            });
        } else {
            await updateDoc(docRef, {
                [listName]: arrayRemove(gameData)
            });
        }
    }

    // Ratings & Comments
    async addRating(gameId, rating, userId) {
        const ratingRef = doc(this.db, "ratings", `${gameId}_${userId}`);
        await setDoc(ratingRef, {
            gameId,
            userId,
            rating,
            timestamp: new Date()
        });
    }

    async addComment(gameId, comment, userId, userName) {
        const commentRef = doc(this.db, "comments", `${gameId}_${userId}_${Date.now()}`);
        await setDoc(commentRef, {
            gameId,
            userId,
            userName,
            comment,
            timestamp: new Date()
        });
    }

    async getGameComments(gameId) {
        const q = query(collection(this.db, "comments"), where("gameId", "==", gameId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => b.timestamp - a.timestamp);
    }

    async getUserRating(userId, gameId) {
        const docRef = doc(this.db, "ratings", `${gameId}_${userId}`);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data().rating : 0;
    }

    async updateUserCommentsName(userId, newName) {
        const q = query(collection(this.db, "comments"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(this.db);

        querySnapshot.forEach((doc) => {
            batch.update(doc.ref, { userName: newName });
        });

        await batch.commit();
    }

    async deleteComment(commentId) {
        await deleteDoc(doc(this.db, "comments", commentId));
    }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
