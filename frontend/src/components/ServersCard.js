import React from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Row,
  Col,
} from "reactstrap";
import { toPersianDate } from "../utils/dateUtils.js";
import { expireDay } from "utils/pubVars.js";
import { useAuth } from "../contexts/AuthContext.js";

const ServerStatus = ({ title, content }) => (
  <div className="server-status">
    <span className="server-status__title">{title}</span>
    <span className="server-status__content">{content}</span>
  </div>
);

function getServerStatus(server) {
  if (!server?.expiration_date) return "Unknown";

  const exp = new Date(server.expiration_date);
  const today = new Date();
  const diffDays = (exp - today) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "Expired";
  if (diffDays <= expireDay) return "Expiring";
  return "Valid";
}

function getStatusLabel(status) {
  switch (status) {
    case "Valid":
      return "فعال";
    case "Expiring":
      return "در حال انقضا";
    case "Expired":
      return "منقضی شده";
    default:
      return "نامشخص";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "Valid":
      return <i className="fa fa-server text-success" />;
    case "Expiring":
      return <i className="fa fa-exclamation-triangle text-warning" />;
    case "Expired":
      return <i className="fa fa-times-circle text-danger" />;
    default:
      return <i className="fa fa-question-circle text-muted" />;
  }
}

export default function ServersCard({ server, onDelete, onViewEdit }) {
  const { user } = useAuth();
  const canEdit = user.role === "admin" || user.role === "editor";

  if (!server) return <div className="error-load"> سروری وجود ندارد</div>;

  const status = getServerStatus(server);

  return (
    <Col lg="4" md="6" sm="6">
      <Card className="card-stats">
        <CardBody>
          <Row>
            <Col md="2" xs="1">
              <div className="icon-big text-center icon-warning">
                {getStatusIcon(status)}
              </div>
            </Col>
            <Col md="8" xs="7">
              <div className="numbers">
                <p className="card-category">{server.name}</p>
                <CardTitle tag="p">{getStatusLabel(status)}</CardTitle>
              </div>
            </Col>
          </Row>
        </CardBody>

        <CardFooter>
          <hr />
          <div className="stats">
            <ServerStatus title="    آدرس آی پی:" content={server.ip_address || "-"} />
            <ServerStatus title="موقعیت مکانی :" content={server.location || "-"} />
            <ServerStatus
              title="تاریخ انقضا :"
              content={
                server.expiration_date
                  ? toPersianDate(server.expiration_date)
                  : "-"
              }
            />
          </div>
        </CardFooter>

        <div className="btn-wrapper">
          {canEdit &&
            <button
              className="item-btn remove-item"
              onClick={() => onDelete(server.id)}
            >
              حذف
            </button>}
          <button className="item-btn open-item" onClick={() => onViewEdit(server)}>
            مشاهده
          </button>
        </div>
      </Card>
    </Col>
  );
}
