import React from "react";

const SingleFriendComponent = ({ user }) => {
  const { name, email, ava } = user;
  return (
    <div>
      <div className="w-full">
        <div className="grid grid-cols-5 text-left ">
          <div className="">
            <img className="w-14 h-14 rounded-full" src={ava} alt="ava" />
          </div>
          <div className="col-span-4 flex items-center">
            <div className="text-black font-[400]">{name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleFriendComponent;
