import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';

const Footer = () => {
  return (
    <footer className="main-footer-wrapper">
      {/*=======links section===== */}
      <div className="links-section row g-4 justify-content-between pb-5">
        {/*====first column=====*/}
          <div className="footer-brand-side">
            <h3>SERVER <span>GO</span></h3>
            <p>our loading platform for providing purchase and rental services for ultra-fast and stable server packages within Syria.</p>
            <div className="social-icons-row">
              <a href="#facebook"><i className="fa-brands fa-facebook"></i></a>
              <a href="#linkedin"><i className="fa-brands fa-linkedin"></i></a>
              <a href="#github"><i className="fa-brands fa-github"></i></a>
            </div>
          </div>

        {/*====second column=====*/}
          <div className="footer-links-group">
            <h4>servers</h4>
            <ul>
              <li><Link to="/servers?tab=vps"><i className="fa-solid fa-chevron-right me-1"></i> Linux VPS</Link></li>
              <li><Link to="/servers?tab=vps-nvme"><i className="fa-solid fa-chevron-right me-1"></i> VPS NVMe</Link></li>
              <li><Link to="/servers?tab=cloud"><i className="fa-solid fa-chevron-right me-1"></i> Cloud Elastic</Link></li>
              <li><Link to="/servers?tab=windows"><i className="fa-solid fa-chevron-right me-1"></i> Windows RDP</Link></li>
            </ul>
          </div>
        

        {/*====third column=====*/}    
          <div className="footer-links-group">
            <h4> support and help</h4>
            <ul>
              <li><Link to="/contact"><i className="fa-solid fa-chevron-right me-1"></i> open a support ticket</Link></li>
              <li><Link to="/payment"><i className="fa-solid fa-chevron-right me-1"></i>available payment methods</Link></li>
              <li><Link to="/cart"><i className="fa-solid fa-chevron-right me-1"></i>your cart</Link></li>
            </ul>
          </div>

        {/*====fourth column=====*/}
          <div className="footer-contact-info">
            <h4>contact us</h4>
            <p ><i className="fa-solid fa-location-dot"></i>Syria - Aleppo,authoried reservation centers</p>
            <p><i className="fa-solid fa-envelope"></i> support@servergo.com</p>
            <p><i className="fa-solid fa-phone"></i> +963 981 217 020</p>
          </div>
        
      </div>

      {/*=======rights section===== */}
      <div className="footer-bottom-copyright text-center pt-4">
        <p className="m-0">© all rights are saved for  <b>SERVER GO</b> {new Date().getFullYear()}</p>
      </div>


    </footer>
  );
};

export default Footer;
