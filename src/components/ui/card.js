import React from 'react';

function Card({ children, className }) {
    return <div className={`p-4 shadow-md rounded-md ${className}`}>{children}</div>;
}

export default Card;
export const CardHeader = ({ children }) => {
    return <div className="card-header">{children}</div>;
};

export const CardContent = ({ children }) => {
    return <div className="card-content">{children}</div>;
};
