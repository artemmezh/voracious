import React from 'react';

const shell = window.electron.shell;

export default function SystemBrowserLink(props) {
  return (
    <a href="#external" onClick={e => {
      e.preventDefault();
      shell.openExternal(props.href);
    }}>{props.children}
    </a>
  );
}
