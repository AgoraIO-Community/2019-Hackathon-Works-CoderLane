import React from 'react';
import cn from 'classnames';
import './style.scss';

const containerBackgroundColro = ({right, offMode}) => {
  if (right) return '#47b881';
  if (offMode) return 'rgba(0, 0, 0, 0.3)';
  return '#47b881';
}
const dotTransForm = ({ right, small }) => {
  const size = small ? 'translateX(calc(1.5rem + 2px)' : 'calc(2rem + 2px))';
  return right ? size : 'translateX(0)';
}

function Switch({ onClick, right, offMode, small, className, style }) {
  return (
    <div
      className={cn('switch', {'small': small, [className]: className})}
      style={{
        backgroundColor: containerBackgroundColro({right, offMode})
      }}
      onClick={onClick}
    >
      <div className="switch__dot" style={{
        transform: dotTransForm({ right, small })
      }} />
    </div>
  )
}
export default Switch;
