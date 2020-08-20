import React from 'react';
import { AppBar, Toolbar, Typography } from '@material-ui/core'

export const Header = () => {
    return <AppBar>
        <Toolbar>
            <Typography variant="h6">
                Heriot Watt calendar exporter
            </Typography>
        </Toolbar>
    </AppBar>
}