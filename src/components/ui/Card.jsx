import styles from './Card.module.css';

export default function Card({ children, className = '', elevated = false, accent = false, onClick }) {
  return (
    <div
      className={[
        styles.card,
        elevated ? styles.elevated : '',
        accent ? styles.accent : '',
        onClick ? styles.clickable : '',
        className,
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '' }) {
  return <div className={[styles.header, className].join(' ')}>{children}</div>;
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={[styles.body, className].join(' ')}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return <div className={[styles.footer, className].join(' ')}>{children}</div>;
};
