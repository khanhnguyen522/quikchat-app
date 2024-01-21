import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../redux/user/userApiRequest";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const newUser = {
      email: email,
      password: password,
    };
    loginUser(newUser, dispatch, navigate);
  };

  return (
    <div className="">
      <form
        className="my-12 text-sm lg:mx-28 md:mx-12 mx-4"
        onSubmit={handleLogin}
      >
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

        <div className="pb-12">
          <div className="flex justify-center items-center rounded-md h-8 bg-[rgb(134,122,245)] text-white mt-10 xs:mt-6 sm:mx-8 md:mx-8 lg:mx-12">
            <button type="submit">CONTINUE</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
