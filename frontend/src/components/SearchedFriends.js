import React, { useState } from "react";
import avatar from "../asset/avatar.svg";
import { Link } from "react-router-dom";
import SingleFriendComponent from "./SingleFriendComponent";
import SingleFriendComponentFromUser from "./SingleFriendComponentFromUser";

const SearchedFriends = ({ users }) => {
  return (
    <div>
      {users?.map((user) => (
        <div className="w-full px-4 py-2" key={user._id}>
          <SingleFriendComponentFromUser user={user} />
        </div>
      ))}
    </div>
  );
};

export default SearchedFriends;
