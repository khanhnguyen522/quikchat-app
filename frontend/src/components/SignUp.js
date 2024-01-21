import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../redux/user/userApiRequest";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pic, setPic] = useState(
    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmedPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    const newUser = {
      name: name,
      email: email,
      password: password,
    };
    registerUser(newUser, dispatch, navigate);
  };

  return (
    <div className="">
      <form
        className="my-12 text-sm mx-4 lg:mx-28 md:mx-12"
        onSubmit={handleSignup}
      >
        <div className="flex flex-col  my-6 gap-y-1">
          <label className="font-thin" htmlFor="name">
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
            type="password"
            onChange={(e) => setPassword(e.target.value)}
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
            type="password"
            onChange={(e) => setConfirmedPassword(e.target.value)}
          />
        </div>

        <div className="pb-12">
          <div className="flex justify-center items-center rounded-md h-8 bg-[rgb(134,122,245)] text-white mt-10 xs:mt-6 sm:mx-8 md:mx-8 lg:mx-12 p-2">
            <button type="submit">REGISTER</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
