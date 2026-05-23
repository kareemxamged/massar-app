import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Portal({ children }: { children: React.ReactNode }) {
  const el = useRef(document.createElement('div'));

  useEffect(() => {
    const node = el.current;
    document.body.appendChild(node);
    return () => { document.body.removeChild(node); };
  }, []);

  return createPortal(children, el.current);
}
