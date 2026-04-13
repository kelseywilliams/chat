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
        <header className="bg-neutral text-neutral-content flex px-6 py-2 items-center justify-between">
            <div>
                <a href="/" className="text-xl">kelseywilliams.co</a>
                <span className="text-xl">/chat</span>
            </div>

            <div className="flex items-center gap-4">
                {right}
                <ThemeToggle />
                {authLost ? (
                    <>
                        <div className="btn btn-primary" onClick={navigate("/login")}>Login</div>
                        <div className="btn btn-secondary" onClick={navigate("/signup")}>Signup</div>
                    </>
                ) : (
                    <>
                        <span>{user}</span>
                        <button className="btn btn-primary" onClick={logout}>Logout</button>
                    </>

                )}
            </div>
            {error && <p className="text-error text-xs mt-2">{error}</p>}
        </header>
    )
}