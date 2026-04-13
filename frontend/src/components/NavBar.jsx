import ThemeToggle from './ThemeToggle.jsx'
import { useEffect, useState } from 'react';
import { useSessionStore } from '../store/useSessionStore.js'
import { useNavigate } from 'react-router';
import { PROTOCOL, API_DOMAIN } from '../config/index.js';
import axios from 'axios';

export default function Navbar({ right }) {
    const navigate = useNavigate();
    const socket = useSessionStore((s) => s.socket);
    const user = useSessionStore((s) => s.user);
    const authLost = useSessionStore((s) => s.authLost);
    const [error, setError] = useState(null);
    const logout = async () => {

        axios.post(`${PROTOCOL}://${API_DOMAIN}/auth/logout`, {}, { withCredentials: true })
            .then((res) => {
                if (res.status == 200) {
                    window.location.href = "/";
                } else {
                    throw Error("Unexpected server error.");
                }

            })
            .catch(() => setError(err))
    }

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
                            <div className="btn btn-primary btn-sm" onClick={() => navigate("/login")}>Login</div>
                            <div className="btn btn-secondary btn-sm" onClick={() => navigate("/signup")}>Signup</div>
                        </>
                    ) : (
                        <>
                            <a href="https://kelseywilliams.co/profile" className="text-sm">{user}</a>
                            <button className="btn btn-primary btn-sm" onClick={logout}>Logout</button>
                        </>
                    )}
                </div>
            </div>
            {error && <p className="text-error text-xs mt-1">{error}</p>}
        </header>
    )
}