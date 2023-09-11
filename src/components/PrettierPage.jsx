import _favicon from '../assets/favicon.svg'

import './PrettierPage.css'

export function PrettierPage() {
    const checkDOMInterval = setInterval(() => {
        const favicon = document.querySelector('head > link:nth-child(11)')
        if (favicon) {
            favicon.href = _favicon
            clearInterval(checkDOMInterval);
        }
    }, 100);

    return <>
    </>
}