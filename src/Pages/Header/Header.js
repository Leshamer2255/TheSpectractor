import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.headerContainer}>
      <h1>Уorld Information</h1>
      <p>Piv piv paf paf</p>
      <nav className={styles.navContainer}>
        <ul>
          <li><Link to="/">Main page bro</Link></li>
          <li><Link to="/contacts">Contacts</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          <li><Link to="/registration">Registration</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
