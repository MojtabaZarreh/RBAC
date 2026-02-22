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

const SSLStatus = ({ title, content }) => (
  <div className="domain-status">
    <span className="domain-status__title">{title}</span>
    <span className="domain-status__content">{content}</span>
  </div>
);

function getSSLStatus(ssl) {
  if (!ssl.expiration_date) return "Unknown";
  const exp = new Date(ssl.expiration_date);
  const today = new Date();

  if (exp < today) return "Expired";
  if ((exp - today) / (1000 * 60 * 60 * 24) <= expireDay) return "Expiring";
  return "Valid";
}

function getStatusLabel(status) {
  switch (status) {
    case "Valid":
      return "معتبر";
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
      return <i className="fa fa-lock text-success" />;
    case "Expiring":
      return <i className="fa fa-exclamation-triangle text-warning" />;
    case "Expired":
      return <i className="fa fa-unlock-alt text-danger" />;
    default:
      return <i className="fa fa-question-circle text-muted" />;
  }
}

export default function SSLCard({ ssl, onDelete, onViewEdit }) {
  const { user } = useAuth();
  
  if (!ssl) return <div className="error-load"> ssl وجود ندارد</div>;

  const status = getSSLStatus(ssl);

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
                <p className="card-category">{ssl.name}</p>
                <CardTitle tag="p">{getStatusLabel(status)}</CardTitle>
              </div>
            </Col>
          </Row>
        </CardBody>

        <CardFooter>
          <hr />
          <div className="stats">
            <SSLStatus title="صادرکننده :" content={ssl.issuer || "-"} />
            <SSLStatus
              title="تاریخ انقضا :"
              content={
                ssl.expiration_date
                  ? toPersianDate(ssl.expiration_date)
                  : "-"
              }
            />
          </div>
        </CardFooter>

        <div className="btn-wrapper">
          {(user.role === "admin" || user.role === "editor") &&
            <button
              className="item-btn remove-item"
              onClick={() => onDelete(ssl.id)}
            >
              حذف
            </button>}
          <button className="item-btn open-item" onClick={() => onViewEdit(ssl)}>
            مشاهده
          </button>
        </div>
      </Card>
    </Col>
  );
}
