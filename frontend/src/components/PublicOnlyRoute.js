import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicOnlyRoute = ({ children }) => {
  const user = useSelector((state) => state.user.login.currentUser);
  if (user) {
    // if logged in → redirect to chats
    return <Navigate to="/chats" replace />;
  }
  return children;
};

export default PublicOnlyRoute;
