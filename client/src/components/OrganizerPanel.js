// OrganizerPanel.js
import React, { useState, useEffect } from "react";
import AuctionTable from "./AuctionTable";
import Timer from "./Timer";
import "./OrganizerPanelStyles.css";

const OrganizerPanel = () => {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [ws, setWs] = useState(null);
  const [auctionData, setAuctionData] = useState(null);
  const [error, setError] = useState("");
  const [isWsConnected, setIsWsConnected] = useState(false);

  const handleLogin = async () => {
    if (!password) {
      setError("Пожалуйста, введите пароль.");
      return;
    }

    try {
      const response = await fetch("/organizer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setIsAuthorized(true);
      } else {
        setError("Неверный пароль.");
      }
    } catch (error) {
      console.error("Ошибка при авторизации организатора:", error);
      setError("Произошла ошибка. Пожалуйста, попробуйте еще раз.");
    }
  };

  useEffect(() => {
    if (isAuthorized && token) {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const socket = new WebSocket(
        `${protocol}://${window.location.host}/ws?token=${token}`
      );

      socket.onopen = () => {
        setIsWsConnected(true);
        console.log("WebSocket соединение установлено");
      };

      socket.onmessage = event => {
        const message = JSON.parse(event.data);
        console.log('Получено сообщение от сервера:', message);
        if (message.type === 'init' || message.type === 'update') {
            setAuctionData(prevData => ({ ...message.data }));
        }
    };
    
    

      socket.onerror = (error) => {
        console.error("WebSocket ошибка:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket соединение закрыто");
        setIsWsConnected(false);
      };

      setWs(socket);

      return () => {
        socket.close();
      };
    }
  }, [isAuthorized, token]);

  const startAuction = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "startAuction" }));
    } else {
      console.error("WebSocket не готов. Невозможно отправить сообщение.");
    }
  };

  const endAuction = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "endAuction" }));
    } else {
      console.error("WebSocket не готов. Невозможно отправить сообщение.");
    }
  };

  return (
    <div className="organizer-panel">
      {isAuthorized ? (
        <>
          <h2>Панель организатора</h2>
          <button onClick={startAuction} disabled={!isWsConnected}>
            Начать торги
          </button>
          <button onClick={endAuction} disabled={!isWsConnected}>
            Завершить торги
          </button>

          {auctionData && (
            <div className="auction-status">
              <h3>Состояние торгов</h3>
              <p>Торги активны: {auctionData.isAuctionActive ? "Да" : "Нет"}</p>
              <p>Оставшееся время: {auctionData.timeRemaining} сек</p>
              <Timer
                totalTime={auctionData.timeRemaining}
                turnTime={auctionData.turnTimeRemaining}
                isMyTurn={false} // У организатора нет хода
              />
              <AuctionTable participants={auctionData.participants} />
            </div>
          )}
        </>
      ) : (
        // ... форма авторизации ...
        <div className="auth-container">
          <h2>Вход для организатора</h2>
          {error && <div className="error-message">{error}</div>}
          <input
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Войти</button>
        </div>
      )}
    </div>
  );
};

export default OrganizerPanel;
