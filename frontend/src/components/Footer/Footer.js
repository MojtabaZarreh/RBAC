
import React from "react";
import { Container, Row } from "reactstrap";
import PropTypes from "prop-types";

function Footer(props) {
  return (
    <footer className={"footer" + (props.default ? " footer-default" : "")}>
      <Container fluid={props.fluid ? true : false}>
        <Row>
          <nav className="footer-nav">
            <ul>
              <li>
              </li>
            </ul>
          </nav>
          <div className="credits">
            <div className="copyright">
              &copy; {1900 + new Date().getYear()}, made with{" "}
              <i className="fa fa-heart heart" /> by the Leca Programming Team
            </div>
          </div>
        </Row>
      </Container>
    </footer>
  );
}

Footer.propTypes = {
  default: PropTypes.bool,
  fluid: PropTypes.bool,
};

export default Footer;
