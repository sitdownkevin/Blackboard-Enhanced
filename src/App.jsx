import { calendarInfoCatch } from "./components/fetchCalendar";
import React, { useEffect, useState } from 'react';

import { Calendar } from "./components/Calendar";
import { GradeAssignment } from "./components/GradeAssignment";
import { PrettierPage } from "./components/PrettierPage";

import {
  GM_setValue,
  GM_getValue,
  GM_registerMenuCommand,
  GM_unregisterMenuCommand
} from '$'


function menuControl(env, setEnv) {

}


function App() {
  const [env, setEnv] = useState(
    GM_getValue('env', {
      calendar: {
        display: true
      },
      assignment: {
        display: true,
        memo: ''
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
    {window.location.href.startsWith('https://pibb.scu.edu.cn/webapps/portal') && todoItems && env.calendar.display ? <Calendar todo_items={todoItems} /> : null}
    {window.location.href.startsWith('https://pibb.scu.edu.cn/webapps/assignment') && env.assignment.display ? <GradeAssignment env={env} setEnv={setEnv} /> : null}
    <PrettierPage /> 
  </>
}

export { App }