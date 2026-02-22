import React from "react";
import Dashboard from "views/Dashboard";
import Websites from "views/Websites.js";
import Servers from "views/Servers.js";
import SSL from "views/SSL.js";
import Finacial from "views/Finacial";
import UserPage from "views/User.js";
import AuthPage from "views/auth/AuthPage.js";
import Passwords from "views/Passwords";
import NotFound from "views/NotFound";

const routes = [
  {
    path: "/auth",
    element: <AuthPage />,
    layout: ""
  },
  {
    path: "dashboard",
    name: "دامنه ها",
    icon: "nc-icon nc-world-2",
    element: <Dashboard />,
    layout: "/admin"
  },
  {
    path: "websites",
    name: "وب سایت ها",
    icon: "nc-icon nc-layout-11",
    element: <Websites />,
    layout: "/admin"
  },
  {
    path: "ssl",
    name: "گواهینامه امنیتی",
    icon: "nc-icon nc-lock-circle-open",
    element: <SSL />,
    layout: "/admin"
  },
  {
    path: "servers",
    name: "سرور ها",
    icon: "nc-icon nc-cloud-upload-94",
    element: <Servers />,
    layout: "/admin"
  },
  {
    path: "finacial",
    name: "بخش مالی",
    icon: "nc-icon nc-money-coins",
    element: <Finacial />,
    layout: "/admin"
  },
  {
    path: "passwords",
    name: "رمزهای عبور",
    icon: "nc-icon nc-key-25",
    element: <Passwords />,
    layout: "/admin"
  },
  {
    path: "profile",
    name: "پروفایل شخصی",
    icon: "nc-icon nc-single-02",
    element: <UserPage />,
    layout: "/admin"
  },
  {
    path: "404",
    name: "صفحه یافت نشد",
    element: <NotFound />,
    layout: "/"
  },
];

export default routes;
