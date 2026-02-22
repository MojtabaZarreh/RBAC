import { Link } from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom";

export default function NotFound() {
  const isAuthenticated = !!localStorage.getItem("api_token");

  return (
    <div style={styles.container}>
      <h1 style={styles.code}>404</h1>
      <h2 style={styles.title}>صفحه مورد نظر پیدا نشد</h2>
      <p style={styles.text}>
        آدرسی که وارد کردید وجود ندارد یا حذف شده است.
      </p>

      <Link
        to={isAuthenticated ? "/admin/dashboard" : "/auth"}
        style={styles.button}
      >
        {isAuthenticated ? "بازگشت به داشبورد" : "بازگشت به ورود"}
      </Link>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    color: "#fff",
    textAlign: "center",
  },
  code: {
    fontSize: "8rem",
    margin: 0,
    color: "#38bdf8",
  },
  title: {
    fontSize: "1.8rem",
    margin: "10px 0",
  },
  text: {
    opacity: 0.8,
  },
  button: {
    marginTop: "20px",
    padding: "10px 24px",
    backgroundColor: "#38bdf8",
    color: "#0f172a",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
