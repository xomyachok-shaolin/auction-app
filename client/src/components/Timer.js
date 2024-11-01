import React, { useEffect } from 'react';

const Timer = ({ totalTime, turnTime, isMyTurn }) => {
    useEffect(() => {
        console.log('Timer обновился:', { totalTime, turnTime });
    }, [totalTime, turnTime]);

    return (
        <div className="timer">
            <p>Общее время: {totalTime} сек</p>
            <p>Время на ход: {turnTime} сек</p>
            {isMyTurn && <p>Ваш ход!</p>}
        </div>
    );
};

export default Timer;
