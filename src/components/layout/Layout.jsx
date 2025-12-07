import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-darker text-light flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <Outlet />
            </main>
            <footer className="bg-dark p-4 text-center text-gray-500">
                <p>&copy; {new Date().getFullYear()} MyGameList. Powered by IGDB API.</p>
                <p>Developed by Abdulhameed, Waleed and Muath</p>
            </footer>
        </div>
    );
};

export default Layout;
