import React from "react";
import { Card, CardBody, CardFooter, CardTitle, Row, Col } from "reactstrap";
import { useAuth } from "../contexts/AuthContext";

export default function PasswordCard({ item, onDelete, onViewEdit }) {
   const { user } = useAuth();

  if (!item) return null;

  return (
    <Col lg="4" md="6" sm="6">
      <Card className="card-stats">
        <CardBody>
          <Row>
            <Col md="2" xs="1">
              <div className="icon-big text-center icon-warning">
                <i className="fa fa-lock text-info" />
              </div>
            </Col>
            <Col md="8" xs="7">
              <div className="numbers">
                <p className="card-category">{item.label}</p>
                <CardTitle tag="p">{item.username}</CardTitle>
              </div>
            </Col>
          </Row>
        </CardBody>

        <CardFooter>
          <hr />
          <div className="stats">
            <div className="server-status">
              <span className="server-status__title"> آدرس: </span>
              <span className="server-status__content">
                {<a href={item.url}>{item.url}</a> || "-"}
              </span>
            </div>
          </div>
        </CardFooter>

        <div className="btn-wrapper">
          {(user.role === "admin" || user.role === "editor") &&
          <button
            className="item-btn remove-item"
            onClick={() => onDelete(item.id)}
          >
            حذف
          </button>
          }
          <button
            className="item-btn open-item"
            onClick={() => onViewEdit(item)}
          >
            مشاهده
          </button>
        </div>
      </Card>
    </Col>
  );
}
