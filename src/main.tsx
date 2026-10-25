import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ProblemProvider } from './state/ProblemContext';
import { QueuingProvider } from './state/QueuingContext';
import { MultiChannelProvider } from './state/MultiChannelContext';
import { PertProvider } from './state/PertContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProblemProvider>
      <QueuingProvider>
        <MultiChannelProvider>
          <PertProvider>
            <App />
          </PertProvider>
        </MultiChannelProvider>
      </QueuingProvider>
    </ProblemProvider>
  </React.StrictMode>
);
