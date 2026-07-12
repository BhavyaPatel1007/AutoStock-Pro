export default function Card({ children, className = '', hover = false, glass = false, ...props }) {
  const cls = [
    glass ? 'glass' : 'card',
    hover ? 'card-hover' : '',
    'p-6',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} {...props}>
      {children}
    </div>
  );
}
