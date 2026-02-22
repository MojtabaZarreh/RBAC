import React, { useState } from "react";
import "./style.scss";
import SignInForm from "./SignIn";
import SignUpForm from "./SignUp";

export default function AuthPage() {
  const [type, setType] = useState("signIn");

  const handleOnClick = (text) => {
    if (text !== type) setType(text);
  };

  const handleChangeType = () => {
    alert("hello");
  };

  const containerClass =
    "container " + (type === "signUp" ? "right-panel-active" : "");

  return (
    <div className="auth-page">
      <div className={containerClass} id="container">
        <SignUpForm onSwitch={() => handleOnClick("signIn")} />
        <SignInForm onSwitch={() => handleOnClick("signUp")} />
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>خوش آمدید</h1>
              <p>لطفا اطلاعات کاربری خود را وارد کنید</p>
              <div className="auth-text-wrapper">
                <span>حساب کاربری دارید؟</span>
                <button
                  className="ghost"
                  onClick={() => handleOnClick("signIn")}
                >
                  وارد شوید
                </button>
              </div>
            </div>

            <div className="overlay-panel overlay-right">
              <h1></h1>
              <h3>ورود به داشبورد مدیریت سرویس ها</h3>
              <div className="auth-text-wrapper">
                <span>حساب ندارید؟ </span>
                <button
                  className="ghost"
                  onClick={() => handleOnClick("signUp")}
                >
                  ثبت نام کنید
                </button>
              </div>
              {/* <a style={{ marginTop: "3rem" }}
                className="btn ghost"
                href="https://leca.ae/">
                صفحه مخصوص شرکت 
              </a> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
