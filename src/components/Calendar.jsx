import './Calendar.css'


import { useEffect, useState, useMemo, useRef } from 'react';
import { GM_setValue, GM_getValue } from '$'

// ms => x天x小时x分钟x秒
const formatDuration = (ms) => {
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const days = Math.floor(ms / day);
    const hours = Math.floor((ms % day) / hour);
    const minutes = Math.floor((ms % hour) / minute);
    const seconds = Math.floor((ms % minute) / second);

    let result = '';
    if (days > 0) {
        result += days + '天';
    }
    if (hours > 0) {
        result += hours + '小时';
    }
    if (minutes > 0) {
        result += minutes + '分钟';
    }
    if (seconds > 0) {
        result += seconds + '秒';
    }
    return result;
};


export function Calendar(props) {
    const [dragging, setDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState([0, 0]);
    const [loc, setLoc] = useState(GM_getValue('loc', [150, 150]));

    const handleMouseDown = (e) => {
        setDragging(true)
        setDragOffset([e.clientX - loc[0], e.clientY - loc[1]])
    };


    const handleMouseMove = (e) => {
        if (dragging) {
            setLoc([e.clientX - dragOffset[0], e.clientY - dragOffset[1]])
            GM_setValue('loc', [e.clientX - dragOffset[0], e.clientY - dragOffset[1]])
        }
    };

    const handleMouseUp = () => {
        setDragging(false);
    }


    const TodoItems = props.todo_items.map((todo) => {
        const [cnt, setCnt] = useState(formatDuration(Date.parse(todo['deadline']) - Date.now()));

        useEffect(() => {
            const it = setInterval(() => {
                setCnt(formatDuration(Date.parse(todo['deadline']) - Date.now()));
            }, 1000)

            return () => { clearInterval(it) }
        })

        return (
            <div
                key={todo.course}
                className='calendar-item'
                style={{ backgroundColor: todo['color'] }}
                onMouseDown={handleMouseDown}
            >
                <div className='assignment'>{todo['todoItem']}</div>
                <a className='course-name' href='#'>
                    {todo['course']}
                </a>
                <div className='count-down'>{cnt}</div>
            </div>
        );
    })


    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return (() => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        })
    }, [dragging]);


    return (<div>
        <div className="calendar-container"
            style={{ top: loc[1], left: loc[0] }}
        >
            <div className='calendar-list'>
                {TodoItems}
            </div>
        </div>
    </div>)
}