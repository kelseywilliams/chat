import { Route, Routes } from "react-router";
import ProtectedPage from "./components/ProtectedPage";
import ChatRoom from "./pages/ChatRoom";

function App() {
    return (
        <Routes>
            <Route element={<ProtectedPage />}>
                <Route path="lobby" element={<ChatRoom />} />
                <Route path="chat" element={<ChatRoom />} />
            </Route>
        </Routes>
    );
}

export default App;