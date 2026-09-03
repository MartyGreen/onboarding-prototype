import React from 'react';

const base = import.meta.env.BASE_URL;

export default function WelcomeModal({ onStart }) {
  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        {/* Illustration area — purple background with hand + clouds */}
        <div className="welcome-illustration">
          <img
            className="welcome-cloud welcome-cloud-1"
            src={`${base}assets/cloud-1.svg`}
            alt=""
            draggable={false}
          />
          <img
            className="welcome-cloud welcome-cloud-2"
            src={`${base}assets/cloud-2.svg`}
            alt=""
            draggable={false}
          />
          <img
            className="welcome-cloud welcome-cloud-3"
            src={`${base}assets/cloud-3.svg`}
            alt=""
            draggable={false}
          />
          <img
            className="welcome-hand"
            src={`${base}assets/welcome-hand.png`}
            alt=""
            draggable={false}
          />
        </div>

        {/* Content */}
        <div className="welcome-content">
          <h1 className="welcome-title">
            Добро пожаловать <br />в орден свидетелей Датагейта!
          </h1>

          <div className="welcome-text">
            <p>
              Тут ты можешь взять задание на прохождение интерфесной задачи,
              а мы зафиксируем, то как ты проделал этот путь, в итоге,{' '}
              ты станешь человеком благодаря которому DataGate начнет расти,
              меняться и обретать форму.
            </p>
            <p>
              Но прежде чем кликнуть на кнопку, знай, что это не безумный забег
              к сияющему экрану успеха, а работа исследователя, которая может
              потребовать от тебя частичку усидчивости.
            </p>
          </div>
        </div>

        {/* Footer with button */}
        <div className="welcome-footer">
          <button className="welcome-start-btn" onClick={onStart}>
            Пройти задание
          </button>
        </div>
      </div>
    </div>
  );
}
