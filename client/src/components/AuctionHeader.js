// AuctionHeader.js
import React from "react";
import "./AuctionStyles.css";

const AuctionHeader = ({ lotNumber, date }) => {
  return (
    <div className="auction-header">
      <p>
        Ход торгов
        <br />
        Тестовые торги на аппарат ЛОТОС №29033564
      </p>

      <p className="auction-date">{date}</p>
    </div>
  );
};

export default AuctionHeader;
