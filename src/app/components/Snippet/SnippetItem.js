import React from 'react';
import cn from 'classnames';
import Node from './elements/Node';
import Ruby from './elements/Ruby';
import Go from './elements/Go';

const iconsMap = {
  node: Node,
  ruby: Ruby,
  go: Go,
};

function getIcon(lang) {
  const icon = iconsMap[lang];
  return icon || null;
}

function SnippetItem({ style, title, onClick }) {
  const Icon = getIcon(title);

  function handleClick() {
    onClick(title);
  }
  return (
    <div onClick={handleClick} className={cn('snippet__item d-flex align-items-center', title)} style={style}>
      <div><Icon /></div>
      <div>{title}</div>
    </div>
  )
}

export default SnippetItem;
