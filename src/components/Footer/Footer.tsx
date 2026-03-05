import React from "react";
import styles from "./Footer.module.css";

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        
        <div className={styles.column}>
          <h3 className={styles.logo}>FastRuns</h3>
          <p className={styles.description}>
            FastRuns — платформа для каталога игр, рекордов и игрового комьюнити.
            Открывай, сравнивай и делись достижениями.
          </p>
        </div>


        <div className={styles.column}>
          <h4>Navigation</h4>
          <ul>
            <li><a href="/">Games</a></li>
            <li><a href="/news">News</a></li>
            <li><a href="/lastloaded">Last Loaded</a></li>
          </ul>
        </div>


        <div className={styles.column}>
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Support</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>


        <div className={styles.column}>
          <h4>Contact</h4>
          <ul>
            <li>Email: supportFastRuns@gmail.com</li>
            <li>Location: Ukraine</li>
            <li className={styles.socials}>
              <a href="https://github.com/Vitaliy121367/my-app">GitHub</a>
              <a href="#">Twitter</a>
              <a href="#">Discord</a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        © {new Date().getFullYear()} FastRuns. All rights reserved.
      </div>
    </footer>
  );
};
