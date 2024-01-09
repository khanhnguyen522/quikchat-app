import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../asset/avatar.svg";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../createInstance";
import { loginSuccess } from "../redux/user/userSlice";
import { editProfile } from "../redux/user/userApiRequest";

const EditProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const user = useSelector((state) => state.user.login.currentUser);
  const accessToken = user?.accessToken;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let axiosJWT = createAxios(user, dispatch, loginSuccess);

  const handleEditProfile = (e) => {
    e.preventDefault();
    const editedUser = {
      name: name,
      password: password,
      email: email,
    };
    editProfile(dispatch, editedUser, navigate, accessToken, axiosJWT);
  };

  return (
    <div>
      <div>
        <div className=" fixed top-0 w-full z-10 bg-black/10">
          <div className="">
            <div className="flex p-2 mx-3 justify-start">
              <Link to="/profile">
                <div className="text-[rgb(134,122,245)]">
                  <AiOutlineArrowLeft className="w-8 h-8" />
                </div>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-20 sm:mx-32 md:mx-40 lg:mx-60 xl:mx-80">
          <div className="flex justify-center">
            <img src={Avatar} alt="avatar" className="w-32 h-32 rounded-full" />
          </div>
          <div className="m-6">
            <form
              className="my-12 text-sm mx-4 lg:mx-28 md:mx-12"
              onSubmit={handleEditProfile}
            >
              <div className="flex flex-col  my-6 gap-y-1">
                <label className="font-thin" htmlFor="username">
                  Name
                </label>
                <input
                  className="rounded-md h-8 border border-1"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col  my-6 gap-y-1">
                <label className="font-thin" htmlFor="email">
                  Email
                </label>
                <input
                  className="rounded-md h-8 border border-1"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col  my-6 gap-y-1">
                <label className="font-thin" htmlFor="password">
                  Password
                </label>
                <input
                  className="rounded-md h-8 border border-1"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.password)}
                />
              </div>

              <div className="flex flex-col  my-6 gap-y-1">
                <label className="font-thin" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  className="rounded-md h-8 border border-1"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-center items-center rounded-md h-8 bg-[rgb(134,122,245)] text-white mx-4 lg:mx-28 md:mx-12">
                <button type="submit">UPDATE</button>
              </div>
            </form>
            <div className="pb-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
