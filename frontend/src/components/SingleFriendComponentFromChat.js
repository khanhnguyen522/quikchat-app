import React from "react";

const SingleFriendComponentFromChat = ({ chat }) => {
  const { name, email, pic } = chat?.users[1];
  return (
    <div>
      <div className="w-full">
        <div className="grid grid-cols-5 text-left ">
          <div className="">
            <img className="w-14 h-14 rounded-full" src={pic} alt="ava" />
          </div>
          <div className="col-span-4 flex flex-col items-start justify-center">
            <div className="text-black font-[500]">{name}</div>
            <div className="text-black font-[400]">{email}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleFriendComponentFromChat;
