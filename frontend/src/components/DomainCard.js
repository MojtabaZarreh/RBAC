import React from "react";
import { Card, CardBody, CardFooter, CardTitle, Row, Col } from "reactstrap";
import { toPersianDate } from "../utils/dateUtils.js";
import { useAuth } from "../contexts/AuthContext.js";
import { expireDay } from "utils/pubVars.js";

const DomainStatus = ({ title, content }) => (
  <div className="domain-status">
    <span className="domain-status__title">{title}</span>
    <span className="domain-status__content">{content}</span>
  </div>
);

// function getDomainStatus(domain) {
//   if (!domain) return "Inactive";
//   if (!domain.expiration_date) return domain.status || "Inactive";

//   const expDate = new Date(domain.expiration_date);
//   const today = new Date();
//   if (expDate < today) return "Expired";

//   return domain.status;
// }

  function getDomainStatus(domain) {
    if (!domain) return "Inactive";
    if (!domain.expiration_date) return domain.status || "Inactive";
    const expDate = new Date(domain.expiration_date);
    const today = new Date();
    if (expDate < today) return "Expired";
    if ((expDate - today) / (1000 * 60 * 60 * 24) <= expireDay)
      return "Expiring";
    return domain.status;
  }


function getStatusLabel( status) {
  switch (status) {
    case "Active":
      return "فعال";
    case "Parked":
      return "رزرو شده";
    case "Expired":
      return "منقضی شده";
    case "Expiring":
      return "درحال انقضا";
    default:
      return "غیرفعال";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "Active":
      return <i className="fa fa-check-circle text-success"></i>;
    case "Expired":
      return <i className="fa fa-times-circle text-danger"></i>;
    case "Expiring":
      return <i className="fa fa-exclamation-triangle text-warning" />;
    case "Parked":
      return <i className="fa fa-pause-circle text-primary"></i>;
    default:
      return <i className="fa fa-question-circle text-muted"></i>;
  }
}

export default function DomainCard({ domain, onViewEdit, onDelete }) {
  const { user } = useAuth();

  if (!domain) return <div className="error-load">دامنه ای وجود ندارد</div>;

  const status = getDomainStatus(domain);

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
                  {String(domain.name || "").toLowerCase()}
                </p>
                <CardTitle tag="p">{getStatusLabel(domain ,status)}</CardTitle>
              </div>
            </Col>
          </Row>
        </CardBody>

        <CardFooter>
          <hr />
          <div className="stats">
            <DomainStatus
              title="ثبت‌کننده دامنه :"
              content={domain?.register || "-"}
            />
            <DomainStatus title="وضعیت :" content={getStatusLabel(domain.status)} />
            <DomainStatus
              title="تاریخ انقضا :"
              content={
                domain.expiration_date
                  ? toPersianDate(domain.expiration_date)
                  : "-"
              }
            />
          </div>
        </CardFooter>

        <div className="btn-wrapper card-actions">
          {(user.role === "admin" || user.role === "editor") && (
            <button
              className="item-btn remove-item"
              onClick={() => domain && onDelete(domain.id)}
            >
              حذف
            </button>
          )}
          <button
            className="item-btn open-item"
            onClick={() => onViewEdit(domain)}
          >
            مشاهده
          </button>
        </div>
      </Card>
    </Col>
  );
}
