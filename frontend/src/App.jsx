import { Route, Routes } from "react-router"
import ChatRoom from "./pages/ChatRoom"

function App() {
    return (
        <div>
            <Routes>
                <Route path="/lobby" element={<ChatRoom />} />
                <Route path="/chat" element={<ChatRoom />} />
            </Routes>
        </div>
    );
}

export default App
