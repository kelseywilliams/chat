import { Route, Routes } from "react-router"
import ChatRoom from "./pages/ChatRoom"

function App() {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hiden">
            <Routes>
                <Route path="/lobby" element={<ChatRoom />} />
                <Route path="/chat" element={<ChatRoom />} />
            </Routes>
        </div>
    );
}

export default App
