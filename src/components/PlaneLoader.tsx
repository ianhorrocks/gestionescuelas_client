// src/components/PlaneLoader.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlane } from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/GeneralComponents/_PlaneLoader.module.scss";

const PlaneLoader: React.FC = () => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.orbit}>
        <FontAwesomeIcon icon={faPlane} className={styles.planeIcon} />
        <div className={styles.dottedCircle}></div>
      </div>
    </div>
  );
};

export default PlaneLoader;
