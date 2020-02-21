import React from 'react';
import cn from 'classnames';
import './style.scss';

const getWidth = block => {
  return block ? '100%' : 'inherit';
}

function Input({ value, style, step, type, className, block, onChange }) {
  return (
    <input
      className={cn('input', className)}
      type={type}
      value={value}
      step={step}
      style={{
        width: getWidth(block),
        ...style,
      }}
      onChange={onChange}
    />
  );
}

export default Input;
