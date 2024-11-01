// AuctionRoom.js
import React, { useState, useEffect } from 'react';
import AuctionHeader from './AuctionHeader';
import AuctionTable from './AuctionTable';
import Timer from './Timer';
import './AuctionStyles.css';
import { useParams } from 'react-router-dom';

const AuctionRoom = () => {
    const { token } = useParams();
    const [auctionData, setAuctionData] = useState(null);
    const [ws, setWs] = useState(null);
    const [participant, setParticipant] = useState(null);
    const [newBid, setNewBid] = useState('');

    const [isWsConnected, setIsWsConnected] = useState(false);

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const socket = new WebSocket(`${protocol}://${window.location.host}/ws?token=${token}`);
    
        socket.onopen = () => {
            setIsWsConnected(true);
            console.log('WebSocket соединение установлено');
        };
    
        socket.onmessage = event => {
            const message = JSON.parse(event.data);
            console.log('Получено сообщение от сервера:', message);
            if (message.type === 'init' || message.type === 'update') {
                setAuctionData(prevData => ({ ...message.data }));
                const participantInfo = message.data.participants.find(p => p.token === token);
                setParticipant(participantInfo);
            }
        };               
    
        socket.onerror = (error) => {
            console.error('WebSocket ошибка:', error);
        };
    
        socket.onclose = () => {
            console.log('WebSocket соединение закрыто');
            setIsWsConnected(false);
        };
    
        setWs(socket);
    
        return () => {
            socket.close();
        };
    }, [token]);
    

    if (!auctionData || !participant) {
        return <div>Загрузка...</div>;
    }

    const isMyTurn = auctionData.currentTurn === participant.id - 1 && auctionData.isAuctionActive;

    const handlePlaceBid = () => {
        const bidValue = parseFloat(newBid);
        if (isNaN(bidValue)) {
            alert('Введите корректную сумму');
            return;
        }
        ws.send(JSON.stringify({ type: 'placeBid', bid: bidValue }));
        setNewBid('');
    };

    const handlePassTurn = () => {
        ws.send(JSON.stringify({ type: 'passTurn' }));
    };

    return (
        <div className="auction-room">
            <AuctionHeader lotNumber="29033564" date="09.11.2020 07:00" />
            <Timer
                totalTime={auctionData.timeRemaining}
                turnTime={auctionData.turnTimeRemaining}
                isMyTurn={isMyTurn}
            />
            <AuctionTable participants={auctionData.participants} />
            {isMyTurn ? (
                <div className="bid-controls">
                    <input
                        type="number"
                        placeholder="Введите новую цену"
                        value={newBid}
                        onChange={e => setNewBid(e.target.value)}
                    />
                    <button onClick={handlePlaceBid}>Сделать ставку</button>
                    <button onClick={handlePassTurn}>Передать ход</button>
                </div>
            ) : (
                <p>Сейчас ходит: Участник №{auctionData.currentTurn + 1}</p>
            )}
            <p className="note">Уважаемые участники, во время вашего хода вы можете изменить параметры торгов, указанных в таблице.</p>
        </div>
    );
};

export default AuctionRoom;
