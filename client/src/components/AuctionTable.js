// AuctionTable.js
import React from 'react';
import './AuctionStyles.css';

const AuctionTable = ({ participants }) => {
    return (
        <div className="auction-table">
            <table>
                <thead>
                    <tr>
                        <th>Параметры и требования</th>
                        {participants.map((participant, index) => (
                            <th key={index}>УЧАСТНИК №{participant.id}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr className="bid-row">
                        <td>Стоимость изготовления лота, руб. (без НДС)</td>
                        {participants.map((participant, index) => (
                            <td key={index} className="bid">
                                {participant.bid.toLocaleString('ru-RU')} руб.
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default AuctionTable;
