import React from "react";
import { Card, CardBody, CardFooter, CardTitle, Row, Col } from "reactstrap";
import { toPersianDate } from "../utils/dateUtils.js";
import { useAuth } from "../contexts/AuthContext.js";

const FinancialStatus = ({ title, content }) => (
  <div className="finacial-status">
    <span className="finacial-status__title">{title}</span>
    <span className="finacial-status__content">{content}</span>
  </div>
);

export default function FinancialCard({ finacial, onViewEdit, onDelete }) {
  const { user } = useAuth();

  if (!finacial)
    return <div className="error-load">مورد مالی ای وجود ندارد</div>;

  return (
    <Col lg="4" md="6" sm="6">
      <Card className="card-stats">
        <CardBody>
          <Row>
            <Col md="2" xs="1">
              <div className="icon-big text-center icon-warning">
                <i className="fa fa-credit-card text-primary credit-icon" />
              </div>
            </Col>
            <Col md="8" xs="7">
              <div className="numbers">
                <p
                  className="card-category"
                  style={{
                    marginTop: "1.3rem",
                    marginRight: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  {finacial.subject}
                </p>
              </div>
            </Col>
          </Row>
        </CardBody>

        <CardFooter>
          <hr />
          <div className="stats">
            <FinancialStatus
              title=" تاریخ ثبت : "
              content={finacial.record_date}
            />
            <FinancialStatus
              title="تعداد فایل ها : "
              content={
                finacial.attachment?.length ? finacial.attachment.length : "0"
              }
            />
          </div>
        </CardFooter>

        <div className="btn-wrapper">
          {(user.role === "admin" || user.role === "editor") && (
            <button
              className="item-btn remove-item"
              onClick={() => onDelete(finacial.id)}
            >
              حذف
            </button>
          )}
          <button
            className="item-btn open-item"
            onClick={() => onViewEdit(finacial)}
          >
            مشاهده
          </button>
        </div>
      </Card>
    </Col>
  );
}
