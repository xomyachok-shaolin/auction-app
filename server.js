// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());

// Генерация уникальных токенов для участников и организатора
const organizerToken = 'organizer-secret-token';
const participants = [
    { id: 1, name: 'Участник №1', bid: 3700000, token: crypto.randomBytes(16).toString('hex') },
    { id: 2, name: 'Участник №2', bid: 3200000, token: crypto.randomBytes(16).toString('hex') },
    { id: 3, name: 'Участник №3', bid: 2800000, token: crypto.randomBytes(16).toString('hex') },
    { id: 4, name: 'Участник №4', bid: 2500000, token: crypto.randomBytes(16).toString('hex') },
];

let auctionData = {
    participants,
    currentTurn: 0,
    isAuctionActive: false,
    timeRemaining: 900,  // 15 минут в секундах
    turnTimeRemaining: 30, // 30 секунд на ход
    lastBidTime: Date.now(),
};

// Хранилище подключений WebSocket
const clients = new Map();

// Маршрут для получения токенов участников (в реальности отправляйте токены по email или другому защищенному каналу)
app.get('/getParticipantToken/:id', (req, res) => {
    const participant = participants.find(p => p.id === parseInt(req.params.id));
    if (participant) {
        res.json({ token: participant.token });
    } else {
        res.status(404).send('Участник не найден');
    }
});

// Маршрут для организатора
app.post('/organizer/login', (req, res) => {
    const { password } = req.body;
    if (password === 'organizer') {
        res.json({ token: organizerToken });
    } else {
        res.status(401).send('Неверный пароль');
    }
});

// Функция для широковещательной рассылки данных всем клиентам
function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach((clientInfo, clientSocket) => {
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(message);
      }
    });
    console.log(`Broadcasted message to ${clients.size} clients.`);
  }  

// Функция перехода хода к следующему участнику
function nextTurn() {
    auctionData.currentTurn = (auctionData.currentTurn + 1) % auctionData.participants.length;
    auctionData.turnTimeRemaining = 30;
    auctionData.lastBidTime = Date.now();
    console.log(`Передача хода к участнику #${auctionData.currentTurn + 1}`);
    broadcast({ type: 'update', data: auctionData });
}

// Таймер для общего времени торгов
let auctionTimer = null;

// Таймер для хода участника
let turnTimer = null;

function startAuction() {
    if (auctionTimer) clearInterval(auctionTimer);
    if (turnTimer) clearInterval(turnTimer);

    auctionData.isAuctionActive = true;
    auctionData.timeRemaining = 900;
    auctionData.currentTurn = 0;
    auctionData.turnTimeRemaining = 30;
    auctionData.lastBidTime = Date.now();

    auctionTimer = setInterval(() => {
        if (auctionData.timeRemaining > 0) {
            auctionData.timeRemaining -= 1;
            if (auctionData.timeRemaining === 0) {
                endAuction();
            }
        }
        console.log("Отправка обновления аукциона:", auctionData.timeRemaining);
        broadcast({ type: 'update', data: auctionData });
    }, 1000);
    
    turnTimer = setInterval(() => {
        if (auctionData.turnTimeRemaining > 0) {
            auctionData.turnTimeRemaining -= 1;
            if (auctionData.turnTimeRemaining === 0) {
                nextTurn();
            }
        }
        console.log("Отправка обновления хода:", auctionData.turnTimeRemaining);
        broadcast({ type: 'update', data: auctionData });
    }, 1000);    
}

function endAuction() {
    clearInterval(auctionTimer);
    clearInterval(turnTimer);
    auctionData.isAuctionActive = false;
    auctionData.timeRemaining = 0;
    auctionData.turnTimeRemaining = 0;
    console.log("Торги завершены");
    broadcast({ type: 'update', data: auctionData });
}

const url = require('url');

const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
    const parameters = url.parse(req.url, true);
    const token = parameters.query.token;

    // Определяем тип клиента (участник или организатор)
    let clientType = null;
    let participantId = null;

    if (token === organizerToken) {
        clientType = 'organizer';
        console.log('Организатор подключился');
    } else {
        const participant = participants.find(p => p.token === token);
        if (participant) {
            clientType = 'participant';
            participantId = participant.id;
            console.log(`Участник #${participantId} подключился`);
        } else {
            ws.close();
            return;
        }
    }

    clients.set(ws, { clientType, participantId });

    // Отправляем текущие данные клиенту
    ws.send(JSON.stringify({ type: 'init', data: auctionData }));

    ws.on('message', message => {
        const data = JSON.parse(message);
        console.log("Получено сообщение от клиента:", data);

        // Обработка сообщений от организатора
        if (clientType === 'organizer') {
            if (data.type === 'startAuction') {
                if (!auctionData.isAuctionActive) {
                    startAuction();
                    console.log("Торги начаты организатором");
                }
            } else if (data.type === 'endAuction') {
                endAuction();
                console.log("Торги завершены организатором");
            }
        }

        // Обработка сообщений от участника
        if (clientType === 'participant') {
            if (auctionData.isAuctionActive && auctionData.currentTurn === participantId - 1) {
                if (data.type === 'placeBid') {
                    const { bid } = data;
                    const participant = auctionData.participants.find(p => p.id === participantId);
                    if (participant) {
                        participant.bid = bid;
                        console.log(`Участник #${participantId} сделал ставку: ${bid}`);
                        nextTurn();
                    }
                } else if (data.type === 'passTurn') {
                    console.log(`Участник #${participantId} передал ход`);
                    nextTurn();
                }
            } else {
                console.log(`Участник #${participantId} попытался сделать действие не в свой ход`);
            }
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log(`Клиент отключился`);
    });
});

const path = require('path');

// Раздача статических файлов из клиентского приложения
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Обработка остальных маршрутов, чтобы вернуть index.html для любых нераспознанных маршрутов
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
