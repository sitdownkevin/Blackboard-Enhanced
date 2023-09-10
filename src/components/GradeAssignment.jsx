

import React from 'react'
import ReactDOM from 'react-dom/client';
import './GradeAssignment.css'

function Memo() {
    return <>
        <div className='memo-container'>
            <div className='memo-box'>
                <div className='memo-list'>
                    <div className='memo-input'>

                    </div>

                </div>
                <div className='btn-box'>
                    <button className='btn-bak'>Bak</button>
                    <button className='btn-clear'>Clear</button>
                </div>
            </div>
        </div>
    </>
}







export function GradeAssignment(props) {
    console.log('hello')
    // addMemo()

    ReactDOM.createRoot(
        (() => {
            const bro = document.querySelector('#currentAttempt_submission')
            const app = document.createElement('div');
            bro.parentNode.style.height = 'auto';
            bro.parentNode.insertBefore(app, bro);
            return app;
        })(),
    ).render(
        <React.StrictMode>
            <>
                <Memo />
            </>
        </React.StrictMode>,
    );


    return <>
    </>
}