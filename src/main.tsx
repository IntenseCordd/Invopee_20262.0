import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ProblemProvider } from './state/ProblemContext';
import { QueuingProvider } from './state/QueuingContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProblemProvider>
      <QueuingProvider>
        <App />
      </QueuingProvider>
    </ProblemProvider>
  </React.StrictMode>
);
