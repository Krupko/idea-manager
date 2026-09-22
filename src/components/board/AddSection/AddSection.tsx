import { useState } from 'react';
import './AddSection.scss';
import { LayoutList } from 'lucide-react';

export const AddSection = () => {
  const [background, setBackground] = useState(false);

  return (
    <button
      onClick={() => setBackground(!background)}
      className={`add-button ${background ? 'blue' : ''}`}
      type='button'
    >
      <LayoutList size={18} />
      <span>Add Section</span>
    </button>
  );
};
