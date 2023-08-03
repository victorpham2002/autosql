import { faExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [accordionOpen, setAccordionOpen] = useState(false);

  const toggleAccordion = () => {
    setAccordionOpen((prevOpen) => !prevOpen);
  };

  return (
    <div className="cursor-pointer w-1/3 mb-2 flex flex-col bg-background rounded-xl border border-gray-400">
      <div onClick={toggleAccordion} className='flex justify-center p-1'>
        {title}
      </div>
      {accordionOpen && (
        <div className="px-4 py-2 dark:border-gray-700 rounded-xl">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
