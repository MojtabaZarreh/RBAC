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
import { useAuth } from "../contexts/AuthContext.js";

const WebsiteStatus = ({ title, content }) => (
  <div className="domain-status">
    <span className="domain-status__title">{title}</span>
    <span className="domain-status__content">{content}</span>
  </div>
);

function getStatusLabel(status) {
  switch (status) {
    case "up":
      return "فعال";
    case "down":
      return "غیر فعال";
    default:
      return "نامشخص";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "up":
      return <i className="fa fa-check-circle text-success" />;
    case "down":
      return <i className="fa fa-times-circle text-danger" />;
    default:
      return <i className="fa fa-question-circle text-muted" />;
  }
}

export default function WebsiteCard({ site, onDelete, onCheck }) {
  const { user } = useAuth();
  const canEdit = user.role === "admin" || user.role === "editor";

  if (!site) return <div className="error-load"> وب سایت وجود ندارد</div>;

  const status = site.status || "Unknown";

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
                <p className="card-category">
                  {site.url?.replace(/^https?:\/\//, "")}
                </p>
                <CardTitle tag="p">{getStatusLabel(status)}</CardTitle>
              </div>
            </Col>
          </Row>
        </CardBody>

        <CardFooter>
          <hr />
          <div className="stats">
            <WebsiteStatus
              title="آخرین بررسی :"
              content={
                site.last_checked
                  ? toPersianDate(site.last_checked)
                  : "-"
              }
            />
          </div>
        </CardFooter>

        {canEdit && <div className="btn-wrapper">
          <button
            className="item-btn remove-item"
            onClick={() => onDelete(site.id)}
          >
            حذف
          </button>
          <button className="item-btn open-item" onClick={() => onCheck(site.id, site.status)}>
            بررسی
          </button>
        </div>
        }
      </Card>
    </Col>
  );
}


