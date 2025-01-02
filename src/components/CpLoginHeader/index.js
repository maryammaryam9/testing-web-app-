import React from "react";
import '../CpLoginHeader/CpLoginHeader.scss';
import logoImg from "../../assets/images/OAB-logo.svg";

function CpLoginHeader() {
  return (
    <header className="cp-login-header">
      <div className="logo-wrap">
          <img src={logoImg} alt="logo"/>
      </div>
    </header>
  );
}

export default CpLoginHeader;
