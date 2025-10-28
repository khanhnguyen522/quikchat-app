import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./screens/Homepage";
import Chatpage from "./screens/Chatpage";
import Profile from "./screens/Profile";
import EditProfile from "./screens/EditProfile";
import CreateGroup from "./screens/CreateGroup";
import Chat from "./screens/Chat";
import ChatInfo from "./screens/ChatInfo";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <Homepage />
            </PublicOnlyRoute>
          }
        />

        {/* Authenticated routes */}
        <Route path="chats" element={<Chatpage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/edit" element={<EditProfile />} />
        <Route path="creategroup" element={<CreateGroup />} />
        <Route path="chats/:id" element={<Chat />} />
        <Route path="chats/:id/info" element={<ChatInfo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
