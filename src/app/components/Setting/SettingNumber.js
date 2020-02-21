import React from 'react';
import Input from '../Input';

function SettingNumber({ setValue, value, style }) {

  const handleChange = (e) => {
    const value = e.target.value;

    if (!Number.isNaN(+value)) {
      setValue && setValue(+value);
    }
  }

  return (
    <div className="setting__number">
      <Input
        type="number"
        value={value}
        style={{
          width: '3rem',
          ...style
        }}
        onChange={handleChange}
      />
    </div>
  )
}

export default SettingNumber;
