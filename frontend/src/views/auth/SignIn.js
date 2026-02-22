import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.scss";
import { login } from "../../services/auth.api.js";
import { useAuth } from "../../contexts/AuthContext";
export default function SignInForm({ onSwitch }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { loginAction } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("نام کاربری و رمز عبور الزامی است");
      return;
    }
    try {
      const data = await login(username, password);

      if (data && data.key) {
        await loginAction(data.key);

        navigate("/admin/dashboard", {
          state: {
            showWelcome: true,
            username,
          },
          replace: true,
        });
      } else {
        setError("پاسخ نامعتبر از سرور");
      }
    } catch (err) {
      console.error(err);
      setError("نام کاربری یا رمز عبور اشتباه است");
    }
  };

  const changeTypeHandle = (event) => {
    event.preventDefault();
  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleSubmit}>
        <h1 className="login-text">ورود به داشبورد</h1>

        <input
          type="text"
          placeholder="نام کاربری"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="login-btn">
          ورود
        </button>
        <button type="button" className="mobile-switch-btn" onClick={onSwitch}>
          حساب کاربری ندارید؟ ثبت‌نام کنید
        </button>
      </form>
    </div>
  );
}
