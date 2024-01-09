import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../asset/avatar.svg";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../createInstance";
import { loginSuccess } from "../redux/user/userSlice";
import { logout } from "../redux/user/userApiRequest";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const user = useSelector((state) => state.user.login.currentUser);
  const accessToken = user?.accessToken;
  const id = user?.id;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let axiosJWT = createAxios(user, dispatch, loginSuccess);

  const handleLogout = () => {
    logout(dispatch, id, navigate, accessToken, axiosJWT);
  };

  useEffect(() => {
    setName(user?.name);
    setEmail(user?.email);
  }, [user?.name, user?.email]);

  return (
    <div>
      <div>
        <div className=" fixed top-0 w-full z-10 bg-black/10">
          <div className="">
            <div className="flex justify-between p-2 mx-3">
              <Link to="/chats">
                <div className="text-[rgb(134,122,245)]">
                  <AiOutlineArrowLeft className="w-8 h-8" />
                </div>
              </Link>
              <div className="flex items-center">
                <p className="text-[rgb(134,122,245)]">My Profile</p>
              </div>
              <Link to="/profile/edit" className="flex items-center">
                <div className="text-[rgb(134,122,245)]">Edit</div>
              </Link>
            </div>
          </div>
        </div>
        <div className="h-screen flex flex-col justify-start mt-20 sm:mx-32 md:mx-40 lg:mx-60 xl:mx-80">
          <div className="flex justify-center">
            <img src={Avatar} alt="avatar" className="w-32 h-32 rounded-full" />
          </div>
          <div className="m-6">
            <div className="my-12 text-md mx-4 lg:mx-28 md:mx-12">
              <div className="flex flex-col  my-6 gap-y-1">
                <label className="font-thin" htmlFor="username">
                  Name
                </label>
                <div>{name}</div>
              </div>

              <div className="flex flex-col  my-6 gap-y-1">
                <label className="font-thin" htmlFor="email">
                  Email
                </label>
                <div>{email}</div>
              </div>
            </div>

            <div className="pb-12">
              <div className="flex justify-center items-center rounded-md h-8 bg-[rgb(134,122,245)] text-white mt-10 lg:mx-28 md:mx-12">
                <button onClick={handleLogout}>LOGOUT</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
