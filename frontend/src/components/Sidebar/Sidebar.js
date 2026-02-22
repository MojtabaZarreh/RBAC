import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Nav } from "reactstrap";
import PerfectScrollbar from "perfect-scrollbar";
import CompanyLogo from "../../components/CompanyLogo";
import { useCompanyLogo } from "hooks/useCompanyLogo";
import Username from "../../components/User/Username";

let ps;

function Sidebar({ routes, bgColor, activeColor }) {
  const location = useLocation();
  const sidebar = React.useRef(null);
  const { logo, loading } = useCompanyLogo();

  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1 && sidebar.current) {
      ps = new PerfectScrollbar(sidebar.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
    }
    return () => {
      if (ps) ps.destroy();
    };
  }, []);

  const isActive = (path) => {
    return location.pathname === `/admin/${path}` ||
      location.pathname.startsWith(`/admin/${path}/`);
  };

  if (loading) return null;
  return (
    <div
      className="sidebar"
      data-color={bgColor}
      data-active-color={activeColor}>
      <div className="logo">
        <CompanyLogo size={80} src={logo} />
      </div>
      <div className="sidebar-wrapper" ref={sidebar}>
        <Nav>
          {routes
            .filter((r) => r.layout === "/admin")
            .map((prop, key) => (
              <li
                key={key}
                className={`${isActive(prop.path) ? "active" : ""} ${prop.pro ? "active-pro" : ""
                  }`}
              >
                <NavLink
                  to={`/admin/${prop.path}`}
                  className="nav-link"
                >
                  <i className={prop.icon} />
                  <p>{prop.name}</p>
                </NavLink>
              </li>
            ))}
        </Nav>
      </div>
      <div className="user-name">
          <p>
            <Username />
          </p>
        </div>
    </div>
  );
}

export default Sidebar;