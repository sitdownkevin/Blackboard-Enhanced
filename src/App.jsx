import { calendarInfoCatch } from "./components/fetchCalendar";
import React, { useEffect, useState } from 'react';

import { Calendar } from "./components/Calendar";
import { GradeAssignment } from "./components/GradeAssignment";

import {
  GM_setValue,
  GM_getValue,
  GM_registerMenuCommand,
  GM_unregisterMenuCommand
} from '$'


function menuControl(env, setEnv) {
  GM_unregisterMenuCommand(env.calendar.display ? '打开DDL' : '关闭DDL')
  GM_registerMenuCommand(env.calendar.display ? '关闭DDL' : '打开DDL', () => {
    setEnv({
      ...env,
      calendar: {
        ...env.calendar,
        display: !env.calendar.display
      }
    })
  })
  console.log(env.calendar.display ? 'DDL打开' : 'DDL关闭')
}


function App() {
  const [env, setEnv] = useState(
    GM_getValue('env', {
      calendar: {
        display: true
      },
      assignment: {
        display: true
      }
    })
  );

  menuControl(env, setEnv)
  const [todoItems, setTodoItems] = useState(null);

  useEffect(() => {
    const fetchTodoItems = async () => {
      const items = await calendarInfoCatch();
      setTodoItems(items);
    }
    fetchTodoItems();

  }, [])


  useEffect(() => {
    GM_setValue('env', env)
    console.log('Setting Saved')
  }, [env]);


  return <>
    { window.location.href.startsWith('https://pibb.scu.edu.cn/webapps/portal') && todoItems && env.calendar.display ? <Calendar todo_items={todoItems} /> : null}
    { window.location.href.startsWith('https://pibb.scu.edu.cn/webapps/assignment') && env.assignment.display ? <GradeAssignment env={env} setEnv={setEnv} />: null } 
  </>
}

export { App }