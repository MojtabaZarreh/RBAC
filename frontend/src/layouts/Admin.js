import React from "react";
import PerfectScrollbar from "perfect-scrollbar";
import { Routes, Route, useLocation } from "react-router-dom";

import DemoNavbar from "components/Navbars/DemoNavbar";
import Footer from "components/Footer/Footer";
import Sidebar from "components/Sidebar/Sidebar";
import { CompanyLogoProvider } from "../contexts/CompanyLogoContext";

import routes from "routes";
import Swal from "sweetalert2";
import { expireDay } from "utils/pubVars.js";
import NotFound from "views/NotFound"
let ps;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const WARN_DAYS = expireDay;

const daysUntil = (iso) => {
  const diff = Math.ceil((new Date(iso) - new Date()) / 86400000);
  return diff > 0 ? diff : 0;
};

const safeJson = async (res) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} → ${text.slice(0, 80)}`);
  }
  const type = res.headers.get("content-type");
  if (!type || !type.includes("application/json")) {
    throw new Error(`Invalid content-type: ${type}`);
  }
  return res.json();
};

function Admin() {
  const [backgroundColor, setBackgroundColor] = React.useState("white");
  const [activeColor, setActiveColor] = React.useState("info");
  const mainPanel = React.useRef(null);
  const location = useLocation();

  React.useEffect(() => {
    const hasShown = sessionStorage.getItem("welcomeAlertShown");
    console.log("LOCATION STATE 👉", location.state);
    if (location.state?.showWelcome && !hasShown) {
      Swal.fire({
        title: ` خوش آمدید`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        customClass: { popup: "my-popup" },
      });
      sessionStorage.setItem("welcomeAlertShown", "true");
    }
  }, [location.state]);

  React.useEffect(() => {
    const token = localStorage.getItem("api_token");
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    async function checkExpirations() {
      try {
        const [domainsRes, sslRes, serversRes, websitesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/domains`, { headers }),
          fetch(`${API_BASE_URL}/ssl`, { headers }),
          fetch(`${API_BASE_URL}/servers`, { headers }),
          fetch(`${API_BASE_URL}/websites`, { headers })
        ]);


        const [domains, ssls, servers, websites] = await Promise.all([
          safeJson(domainsRes),
          safeJson(sslRes),
          safeJson(serversRes),
          safeJson(websitesRes),
        ]);

        const items = [];

        domains.forEach(d => {
          if (!d.expiration_date) return;
          const days = daysUntil(d.expiration_date);

          if (days > 0 && days <= WARN_DAYS) {
            items.push(`🌐 دامنه ${d.name} (${days} روز)`);
          }
        });

        ssls.forEach(s => {
          if (!s.expiration_date) return;
          const days = daysUntil(s.expiration_date);
          if (days > 0 && days <= WARN_DAYS) {
            items.push(`🔐 SSL ${s.name} (${days} روز)`);
          }
        });

        servers.forEach(s => {
          if (!s.expiration_date) return;
          const days = daysUntil(s.expiration_date);
          if (days > 0 && days <= WARN_DAYS) {
            items.push(`🖥️ سرور ${s.name} (${days} روز)`);
          }
        });
        websites.forEach(s => {
          if (!s.expiration_date) return;
          const days = daysUntil(s.expiration_date);
          if (days > 0 && days <= WARN_DAYS) {
            items.push(`وب سایت  ${s.name} (${days} روز)`);
          }
        });

        if (items.length > 0) {
          Swal.fire({
            title: "⚠️ موارد در حال انقضا",
            html: `
            <div style="text-align:right">
              <p>موارد زیر کمتر از ${WARN_DAYS} روز تا انقضا دارند:</p>
              <ul style="padding-right:18px">
                ${items.map(i => `<li>${i}</li>`).join("")}
              </ul>
            </div>
          `,
            icon: "warning",
            showConfirmButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: "متوجه شدم",
            customClass: {
              popup: "my-popup",
            },
          });
        }

      } catch (err) {
        console.error("Expire alert error:", err.message);
      }
    }

    checkExpirations();
  }, []);

  React.useEffect(() => {
    if (navigator.platform.includes("Win") && mainPanel.current) {
      ps = new PerfectScrollbar(mainPanel.current);
      document.body.classList.add("perfect-scrollbar-on");
    }

    return () => {
      if (ps) {
        ps.destroy();
      }
      document.body.classList.remove("perfect-scrollbar-on");
    };
  }, []);

  React.useEffect(() => {
    if (mainPanel.current) {
      mainPanel.current.scrollTop = 0;
    }
    document.scrollingElement.scrollTop = 0;
  }, [location.pathname]);

  return (
    <CompanyLogoProvider>
      <div className="wrapper">
        <Sidebar routes={routes} bgColor={backgroundColor} activeColor={activeColor} />

        <div className="main-panel" ref={mainPanel}>
          <DemoNavbar
            bgColor={backgroundColor}
            activeColor={activeColor}
            setBgColor={setBackgroundColor}
            setActiveColor={setActiveColor}
          />

          <Routes>
            {routes
              .filter((r) => r.layout === "/admin")
              .map((r, i) => (
                <Route key={i} path={r.path} element={r.element} />
              ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer fluid />
        </div>
      </div>
    </CompanyLogoProvider>
  );
}

export default Admin;
