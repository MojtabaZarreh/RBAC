
import React from "react";

function FixedPlugin(props) {
  const [classes, setClasses] = React.useState("dropdown");
  const handleClick = () => {
    if (classes === "dropdown") {
      setClasses("dropdown show");
    } else {
      setClasses("dropdown");
    }
  };
  return (
    <div className="fixed-plugin">
      <div className={classes}>
        <div onClick={handleClick}>
        <i class="nc-icon nc-palette"></i> 
        </div>
        <ul className="dropdown-menu show plugin-show">
          <li className="header-title">بک گراند سایدبار</li>
          <li className="adjustments-line">
            <div className="badge-colors text-center">
              <span
                className={
                  props.bgColor === "black"
                    ? "badge filter badge-dark active"
                    : "badge filter badge-dark"
                }
                data-color="black"
                onClick={() => {
                  props.handleBgClick("black");
                }}
              />
              <span
                className={
                  props.bgColor === "white"
                    ? "badge filter badge-light active"
                    : "badge filter badge-light"
                }
                data-color="white"
                onClick={() => {
                  props.handleBgClick("white");
                }}
              />
            </div>
          </li>
          <li className="header-title">رنگ منوی فعال</li>
          <li className="adjustments-line">
            <div className="badge-colors text-center">
              <span
                className={
                  props.activeColor === "primary"
                    ? "badge filter badge-primary active"
                    : "badge filter badge-primary"
                }
                data-color="primary"
                onClick={() => {
                  props.handleActiveClick("primary");
                }}
              />
              <span
                className={
                  props.activeColor === "info"
                    ? "badge filter badge-info active"
                    : "badge filter badge-info"
                }
                data-color="info"
                onClick={() => {
                  props.handleActiveClick("info");
                }}
              />
              <span
                className={
                  props.activeColor === "success"
                    ? "badge filter badge-success active"
                    : "badge filter badge-success"
                }
                data-color="success"
                onClick={() => {
                  props.handleActiveClick("success");
                }}
              />
              <span
                className={
                  props.activeColor === "warning"
                    ? "badge filter badge-warning active"
                    : "badge filter badge-warning"
                }
                data-color="warning"
                onClick={() => {
                  props.handleActiveClick("warning");
                }}
              />
              <span
                className={
                  props.activeColor === "danger"
                    ? "badge filter badge-danger active"
                    : "badge filter badge-danger"
                }
                data-color="danger"
                onClick={() => {
                  props.handleActiveClick("danger");
                }}
              />
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default FixedPlugin;
