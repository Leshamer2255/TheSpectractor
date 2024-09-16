import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer  className={styles.footer}>
      <div className={styles.footerContainer}>
        <div><h2>MAPS</h2>
          <p>INFA</p></div>
      <hr></hr>
      <p>@2024 <a href="#">Lala</a> | <a href="#">News</a> | <a href="#">Blog</a> | <a href="#">Help center</a> | <a href="#">Sitemap</a></p>
      </div>
    </footer>
  );
};

export default Footer;
