import React, { useCallback, useState, useEffect } from 'react';
import GoogleButton from 'react-google-button';
import { useSelector, useDispatch } from 'react-redux';
import { selectAppIsLoaded, selectUser } from '../store/selector/app';
import { fetchUser } from 'store/reducer';

export const LoginWithGoogle = () => {
    const isLoaded = useSelector(selectAppIsLoaded);
    const user = useSelector(selectUser);

    const onClick = useCallback(() => {
        window.open(`${process.env.REACT_APP_API_URL}/auth/google`, '_self');
    }, []);

    return <GoogleButton
        disabled={!isLoaded || Boolean(user)}
        onClick={onClick}
    />
}