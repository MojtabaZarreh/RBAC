import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.scss";
import { register } from "../../services/auth.api.js";

export default function SignUpForm({ onSwitch }) {
  const navigate = useNavigate();

  const [company, setCompany] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!company || !fullname || !email || !password || !confirmPassword) {
      setError("تمام فیلدها الزامی هستند");
      return;
    }

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند");
      return;
    }

    try {
      const data = await register(company, email, password, fullname);

      navigate("/admin/dashboard", {
        state: {
          showWelcome: true,
          username: data.username || email,
        },
      });
    } catch (err) {
      setError("ثبت نام انجام نشد. ممکن است ایمیل تکراری باشد");
    }
  };

  const changeTypeHandle = (e) => {
    e.preventDefault();
  };

  return (
    <div className="form-container sign-up-container">
      <form>
        <h1 className="login-text">ایجاد حساب کاربری</h1>

        <input
          type="text"
          placeholder="نام شرکت"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <input
          type="text"
          placeholder="نام و نام خانوادگی"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
        />

        <input
          type="email"
          placeholder="ایمیل"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="تکرار رمز عبور"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="login-btn" onClick={handleSubmit}>
          ایجاد حساب
        </button>

        <button
          type="button"
          className="to-submit-btn"
          onClick={changeTypeHandle}
        >
          ورود
        </button>
        <button
          type="button"
          className="mobile-switch-btn"
          onClick={onSwitch}
        >
          حساب دارید؟ وارد شوید
        </button>
      </form>
    </div>
  );
}
