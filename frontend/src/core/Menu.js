import React, { Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { isAuthenticated, signout } from '../auth/helper';

const currentTab = (history,path) =>{
    if (history.location.pathname === path){
        return {color : '#2ecc72'}
    }else{
        return {color : '#FFFFFF'}
    }
};


const Menu = ({history,path}) => {
    return (
        <div>
            <nav class="navbar navbar-inverse bg-dark">
            <ul className = 'nav nav-tabs bg-dark'>
                <li className = 'nav-item'>
                    <Link style ={ currentTab(history, '/') } className = 'nav-link' to = '/'>Home</Link>
                </li>
                {isAuthenticated() && (
                <Fragment>
                <li className = 'nav-item'>
                <Link style ={ currentTab(history, '/cart') } className = 'nav-link' to = '/cart'>Cart</Link>
                </li>
                <li className = 'nav-item'>
                <Link style ={ currentTab(history, '/user/dashboard') } className = 'nav-link' to = '/user/dashboard'>Dashboard</Link>
                </li>
                </Fragment>
                )}
            </ul>
            <ul className = 'nav nav-tabs bg-dark ml-auto'>
                {!isAuthenticated() && (
                <Fragment>
                <li className = 'nav-item'>
                <Link style ={ currentTab(history, '/signup') } className = 'nav-link' to = '/signup'>Sign-up</Link>
                </li>
                <li className = 'nav-item'>
                <Link style ={ currentTab(history, '/signin') } className = 'nav-link' to = '/signin'>Sign-in</Link>
                </li>
                </Fragment>
                )}
            </ul>
            <ul className = 'nav nav-tabs bg-dark'>
                {isAuthenticated() && (
                <li className = 'nav-item'>
                <span onClick={() =>{
                    signout(() => {
                        history.push('/')
                    })
                }} 
                className = 'nav-link text-warning'>Sign-out</span>
                </li>
                )}
            </ul>
            </nav>
        </div>
    )
}

export default withRouter(Menu)




        