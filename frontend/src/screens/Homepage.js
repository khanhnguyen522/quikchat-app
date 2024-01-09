import React from "react";
import HomeBoard from "../components/HomeBoard";

const Homepage = () => {
  return (
    <div className="h-screen flex flex-col ">
      <div className="sm:flex sm:justify-start">
        <p className="text-3xl p-3 text-[rgb(134,122,245)]">QuikChat</p>
      </div>
      <div className="my-24 sm:flex sm:justify-center">
        <div className="px-10 xs:w-[80%] sm:w-[70%] md:w-[60%] lg:w-[50%] xl:w-[40%] lg:px-120">
          <HomeBoard />
        </div>
      </div>
    </div>
  );
};

export default Homepage;
