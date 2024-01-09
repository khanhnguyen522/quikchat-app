import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./screens/Homepage";
import Chatpage from "./screens/Chatpage";
import Profile from "./screens/Profile";
import EditProfile from "./screens/EditProfile";
import CreateGroup from "./screens/CreateGroup";
import Chat from "./screens/Chat";
import ChatInfo from "./screens/ChatInfo";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Homepage />} />
          <Route path="chats" element={<Chatpage />} />
          <Route path="profile" index element={<Profile />} />
          <Route path="profile/edit" index element={<EditProfile />} />
          <Route path="creategroup" element={<CreateGroup />} />
          <Route path="chats/:id" element={<Chat />} />
          <Route path="chats/:id/info" element={<ChatInfo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
