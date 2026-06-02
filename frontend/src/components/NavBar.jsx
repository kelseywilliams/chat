import ThemeToggle from './ThemeToggle.jsx';
import { useEffect, useState } from 'react';
import { useSessionStore } from '../store/useSessionStore.js';
import { PROTOCOL, API_DOMAIN } from '../config/index.js';
import axios from 'axios';

export default function Navbar({ right }) {
    const user = useSessionStore((s) => s.user);
    const authLost = useSessionStore((s) => s.authLost);
    const setAuthLost = useSessionStore((s) => s.setAuthLost);
    const disconnectSocket = useSessionStore((s) => s.disconnectSocket);

    const [error, setError] = useState(null);

    // EFFECT: Monitor background authentication health
    // If auth is lost, perform a hard browser redirect to the separate login service
    useEffect(() => {
        if (authLost) {
            window.location.replace("/login");
        }
    }, [authLost]);

    const logout = async () => {
        axios.post(`${PROTOCOL}://${API_DOMAIN}/auth/logout`, {}, { withCredentials: true })
            .then((res) => {
                if (res.status !== 200) {
                    throw new Error("Unexpected server error.");
                }
            })
            .catch((err) => {
                setError(err.response?.data?.message || err.message);
            })
            .finally(() => {
                // ALWAYS clear client state and redirect, even if the session was already dead
                disconnectSocket();
                window.location.replace("/");
            });
    };

    return (
        <header className="bg-neutral text-neutral-content px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="text-xl">
                    <a href="/" className="font-medium">kelseywilliams.co</a>
                    <span>/chat</span>
                </div>
                {right}
            </div>
            <div className="flex items-center justify-between mt-2">
                <ThemeToggle />
                <div className="flex items-center gap-3">
                    {authLost ? (
                        <>
                            {/* Hard window locations to cross over to your separate auth service endpoints */}
                            <button className="btn btn-primary btn-sm" onClick={() => window.location.href = "/login"}>Login</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => window.location.href = "/signup"}>Signup</button>
                        </>
                    ) : (
                        <>
                            <a href="/profile" className="text-sm">{user}</a>
                            <button className="btn btn-primary btn-sm" onClick={logout}>Logout</button>
                        </>
                    )}
                </div>
            </div>
            {error && <p className="text-error text-xs mt-1">{error}</p>}
        </header>
    );
}