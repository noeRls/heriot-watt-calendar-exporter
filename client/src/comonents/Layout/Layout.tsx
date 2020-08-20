import React from 'react';
import { Header } from './Header';
import style from './layout.module.css';

export const Layout: React.FC = ({ children }) => (
    <div className={style.container}>
        <div className={style.header}>
            <Header />
        </div>
        <div className={style.content}>
            {children}
        </div>
    </div>
);
