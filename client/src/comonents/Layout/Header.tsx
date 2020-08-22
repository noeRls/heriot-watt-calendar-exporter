import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@material-ui/core'
import { useSelector } from 'react-redux';
import { selectUser } from 'store/selector/app';
import { DisplayIf } from 'comonents/DisplayIf';
import style from './Header.module.css'

export const Header = () => {
    const user = useSelector(selectUser);
    return <AppBar position="static" >
        <Toolbar>
            <Typography variant="h6">
                Heriot Watt calendar exporter
            </Typography>
            <div className={style.divider}/>
            <DisplayIf expr={Boolean(user)}>
                <Button color="inherit" >Logout</Button>
            </DisplayIf>
        </Toolbar>
    </AppBar>
}