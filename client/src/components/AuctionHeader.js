// AuctionHeader.js
import React from 'react';
import './AuctionStyles.css';

const AuctionHeader = ({ lotNumber, date }) => {
    return (
        <div className="auction-header">
            <h1>Ход торгов <span>Тестовые торги на аппарат ЛОТОС №{lotNumber}</span></h1>
            <p className="auction-date">{date}</p>
        </div>
    );
};

export default AuctionHeader;
