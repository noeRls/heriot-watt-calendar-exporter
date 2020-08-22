import React from 'react';
import { Header } from './Header';
import style from './layout.module.css';

export const Layout: React.FC = ({ children }) => (
    <div className={style.container}>
        <Header />
        <div className={style.contentContainer}>
            <div className={style.contentBorder}/>
            <div className={style.contentBody}>
                {children}
            </div>
            <div className={style.contentBorder}/>
        </div>
    </div>
);
