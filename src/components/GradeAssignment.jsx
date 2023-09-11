

import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client';
import './GradeAssignment.css'

function Memo({ props }) {

    const handleSave = () => {
        props.setEnv({
            ...props.env,
            assignment: {
                ...props.env.assignment,
                memo: document.querySelector('.memo-input').innerText
            }
        })
    }

    const handleClear = () => {
        props.setEnv({
            ...props.env,
            assignment: {
                ...props.env.assignment,
                memo: ''
            }
        })

        document.querySelector('.memo-input').innerText = '';
    }


    return <>
        <div className='memo-container'>
            <div className='memo-box'>
                <div className='memo-list'>
                    <div className='memo-input' contentEditable>
                        { props.env.assignment.memo }
                    </div>
                </div>
                <div className='btn-box'>
                    <button className='btn-save' onClick={handleSave}>Save</button>
                    <button className='btn-clear' onClick={handleClear}>Clear</button>
                </div>
            </div>
        </div>
    </>
}


class PrettierPage {
    constructor() {
        this.expand;
        this.fb;

        this.checkDOMReady();
    }

    checkDOMReady() {
        try {
            const checkInterval = setInterval(() => {
                this.expand = document.querySelector("#currentAttempt_gradeDataPanel");
                this.fb = document.querySelector('#feedbacktext_tbl > tbody > tr > td > span')

                if (this.expand && this.fb) {
                    this.expand.style.display = '';
                    this.fb.remove();
                    clearInterval(checkInterval);
                }
            }, 500);

        } catch (err) { console.log }
    }
}


class AutoCalculator {
    constructor() {
        this.textArea;
        this.fillSpace;

        this.totolGrade;
        this.lastGrade;

        this.checkDOMReady();
    }

    checkDOMReady() {
        const checkInterval = setInterval(() => {
            try {
                this.textArea = this.return_textArea();
                this.fillSpace = this.return_fillSpace();
                this.totolGrade = this.return_totalGrade();
                this.lastGrade = this.return_lastGrade();

                if (this.textArea && this.fillSpace && this.totolGrade && this.lastGrade) {
                    clearInterval(checkInterval);
                    this.setupEventListeners();
                }
            } catch (err) { console.log }
        }, 500);
    }

    setupEventListeners() {
        this.textArea.addEventListener('input', this.handleInput.bind(this));

        if (this.lastGrade != '-') {
            this.fillSpace.value = this.lastGrade;
        } else {
            this.fillSpace.value = this.totolGrade;
        }
    }

    return_textArea() {
        return document.querySelector("#feedbacktext_ifr").contentDocument.documentElement.querySelector("body");
    }

    return_fillSpace() {
        return document.querySelector("#currentAttempt_grade");
    }

    return_totalGrade() {
        return parseFloat(document.querySelector("#currentAttempt_pointsPossible").innerHTML.split('/')[1]);
    }

    return_lastGrade() {
        return document.querySelector("#aggregateGrade").value;
    }


    handleInput(e) {
        const numsArr = e.target.innerHTML.match(/-\d+(\.\d+)?/g);

        if (!numsArr) {
            this.fillSpace.value = this.totolGrade;
        } else {
            let grade = this.totolGrade;
            numsArr.forEach(num => {
                grade += parseFloat(num);
            })
            this.fillSpace.value = grade;
        }
    }

    remove() {
        if (this.textArea) {
            this.textArea.removeEventListener('input', this.handleInput)
        }
    }

}



export function GradeAssignment(props) {
    // addMemo()
    useEffect(() => {
        const PP = new PrettierPage();
        const AC = new AutoCalculator();


        const bro = document.querySelector('#currentAttempt_submission');
        const app = document.createElement('div');
        bro.parentNode.style.height = 'auto';
        bro.parentNode.insertBefore(app, bro);
        const root = ReactDOM.createRoot(app);
        root.render(<Memo props={props} />);

        return () => {
            if (root) {
                root.unmount();
            }
            AC.remove();
        }
    }, []);


    return <>
    </>
}