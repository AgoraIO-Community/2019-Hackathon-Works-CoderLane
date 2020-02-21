import React from 'react';
import cn from 'classnames';
import Node from '../Snippet/elements/Node';
import Ruby from '../Snippet/elements/Ruby';
import Go from '../Snippet/elements/Go';


function getIcon(lang) {
  const icons = {
    node: Node,
    ruby: Ruby,
    go: Go,
    ball: (
      <svg width="1em" height="1em" viewBox="0 0 300 300" fill="currentColor" focusable="false">
        <g data-name="Group 3"><path data-name="Path 8" d="M150 0A150 150 0 1 1 0 150 150 150 0 0 1 150 0z"></path></g>
      </svg>
    )
  }
  if (!icons[lang]) {
    return null;
  }
  return icons[lang];
}

class TopBar extends React.Component {
  render() {
    const { name, tip, socketConnect } = this.props;
    const ballClass = cn({
      ball: name === 'ball',
      disconnect: name === 'ball' && !socketConnect
    });
    const Icon = getIcon(name);

    return (
      <div className="workspace__topbar d-flex align-items-center">
        <i className={`icon ${ballClass}`}>
          {
            name === 'ball' ? Icon : <Icon width="1em" height="1em" />
          }
        </i>
        <span>{tip ? tip : name}</span>
      </div>
    )
  }
}

export default TopBar;