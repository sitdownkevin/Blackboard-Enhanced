import { App } from './App';
import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(
    (() => {
    const app = document.createElement('div');
    document.body.append(app);
    return app;
    })(),
).render(
    <React.StrictMode>
    <>
        <App />
    </>
    </React.StrictMode>,
);