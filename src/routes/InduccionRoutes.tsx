import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicInduccion } from '../pages/PublicInduccion';

export const InduccionRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<PublicInduccion />} />
        </Routes>
    );
};

export default InduccionRoutes;
