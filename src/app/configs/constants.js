import React from 'react';

export const Context = React.createContext({});

export const langs = {
  'node': 'js',
  'ruby': 'rb',
  'python': 'py',
  'bash': 'sh',
  'php': 'php',

  'cpp': 'cpp',
  'java': 'java',
  'go': 'go'
};

export const defaultLang = 'node';

export const paths = {
  HOME: '/',
  SANDBOX: '/sandbox/:id?'
}

