import React, { useEffect } from 'react';

const Timer = ({ totalTime, turnTime, isMyTurn }) => {
    useEffect(() => {
        console.log('Timer обновился:', { totalTime, turnTime });
    }, [totalTime, turnTime]);

    return (
        <div className="timer">
            <p>Общее время: {totalTime} сек<br/>
            Время на ход: {turnTime} сек<br/>
            {isMyTurn && <p>Ваш ход!</p>}
            </p>
        </div>
    );
};

export default Timer;
