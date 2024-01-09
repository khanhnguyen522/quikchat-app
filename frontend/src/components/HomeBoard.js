import React, { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";

const HomeBoard = () => {
  const homeTabs = ["Login", "Sign Up"];
  const [activeHomeTab, setActiveHomeTab] = useState(0);

  const handleHomeTabClick = (idx) => {
    setActiveHomeTab(idx);
  };

  return (
    <div className="bg-[#f7f8f9] rounded-md text-black">
      <div className="flex justify-around pt-6">
        {homeTabs.map((tab, idx) => {
          return (
            <div key={idx}>
              <button
                key={idx}
                className={
                  activeHomeTab === idx
                    ? "bg-[rgb(134,122,245)] bg-blur-filter py-2 px-3 rounded-xl"
                    : "py-2 px-3"
                }
                onClick={() => handleHomeTabClick(idx)}
              >
                {tab}
              </button>
            </div>
          );
        })}
      </div>
      <div>{activeHomeTab === 0 ? <Login /> : <SignUp />}</div>
    </div>
  );
};

export default HomeBoard;
