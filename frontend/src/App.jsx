import { Route, Routes } from "react-router"
import ChatRoom from "./pages/ChatRoom"
import ThemeDemo from "./pages/ThemeDemo"

function App() {
    return (
        <div class="min-h-screen relative flex items-center justify-center p-4 overflow-hiden">
            <Routes>
                <Route path="/chat" element={<ChatRoom />} />
                <Route path="/themes" element={<ThemeDemo />} />
            </Routes>
        </div>
    );
}

export default App
