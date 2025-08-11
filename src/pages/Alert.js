import React from 'react';
import '../css/Alert.css';

export const Alert = () => {
    return (
        <div className="alert-container">
            <div className="alert-box">
                <p className="alert-text">잘못된 접근입니다.</p>
            </div>
        </div>
    );
};