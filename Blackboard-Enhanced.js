// ==UserScript==
// @name        Bb 增强 | Blackboard Enhanced
// @namespace   Violentmonkey Scripts
// @match       https://pibb.scu.edu.cn/webapps/portal/*
// @match       https://pibb.scu.edu.cn/webapps/assignment/gradeAssignmentRedirector*
// @grant       none
// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @grant       GM_unregisterMenuCommand
// @grant       GM_notification
// @version     1.9.3
// @author      sitdownkevin
// @description 2023/4/3 10:27:00
// @license     MIT
// ==/UserScript==


(function() {
    'use strict';

    async function main () {
        await console.log('hello');
        if (window.location.href.startsWith('https://pibb.scu.edu.cn/webapps/assignment/gradeAssignmentRedirector')) {
            assignmentEnhanced();
        }


        if (window.location.href.startsWith('https://pibb.scu.edu.cn/webapps/portal')) {
            await calendarInfoCatch();
            await courseInfoCatch();
            deadlineEnhanced();
        }
    };
    main();


    // INITIAL 1: Preparation for Spider
    const cookie = document.cookie;
    const headers = {
        "Cookie": cookie,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
        "Referer": "https://pibb.scu.edu.cn/webapps/calendar/viewMyBb?globalNavigation=false",
        "Accept": "*/*",
        "Sec-Fetch-Site": "same-origin"
    };


    // INITIAL 2: Catch Course ID and Add them into Database
    var courses_info_post;
    var course_database = {};

    async function courseInfoCatch() {
        try {
            courses_info_post = await get_course_id();
            store_course_id(courses_info_post);
            console.log("Success: Catch Course ID and Add them into Database");
        }
        catch {
            console.log("Error: Catch Course ID and Add them into Database");
        }
    };
        // 通过POST获取课程信息
    function get_course_id() {
        return new Promise((resolve, reject) => {
            const url = 'https://pibb.scu.edu.cn/webapps/portal/execute/tabs/tabAction?action=refreshAjaxModule&modId=_2_1&tabId=_1_1&tab_tab_group_id=_1_1';
            GM_xmlhttpRequest({
                method: 'POST',
                url: url,
                headers: headers,
                onload: (res) => {
                    const courses_info_post = res.responseText;
                    resolve(courses_info_post);
                },
                onerror: (err) => {
                    reject(err);
                }
            });
        });
    };
        // 把数据存储到course_database中
    function store_course_id(_courses_info_post) {
        const pattern = /<li>[\s\S]*?<\/li>/g;
        const regArr = _courses_info_post.match(pattern);
        for (let i=0; i<regArr.length; i++) {
            // debug: console.log(regArr[i]);
            const pattern = {
                'course_name': /<a.*?>(.*?)<\/a>/,     // 课程名字
                'course_id': /id=(_\d+_\d+)/i,         // 课程ID
                'course_href': /href=['"](.*?)['"]/    // 课程主页链接
            };
            const course_name = regArr[i].match(pattern['course_name'])[1];
            const course_id = regArr[i].match(pattern['course_id'])[1];
            const course_href = regArr[i].match(pattern['course_href'])[1];
            course_database[course_name] = {
                'id': course_id,
                'href': course_href
            }
            // debug: console.log(course_name, course_id, course_href);
        }
    };


    // INITIAL 3: Catch Calendar Info
    var oringinal_todo_items, todo_items;

    async function calendarInfoCatch() {
        try {
            oringinal_todo_items = await get_calendar();
            todo_items = extractItems(oringinal_todo_items);
            todo_items = setColor(todo_items);
            console.log("Success: Catch Calendar Info");
        }
        catch {
            console.log("Error: Catch Calendar Info");
        }
    };

    function get_calendar() {
        return new Promise((resolve, reject) => {
            const url = 'https://pibb.scu.edu.cn/webapps/calendar/calendarData/selectedCalendarEvents';
            var start_date = new Date();
            var end_date = new Date();
            end_date.setDate(end_date.getDate() + 28);
            const params = "?start=" + start_date.getTime() + "&end=" + end_date.getTime() + "&course_id=&mode=personal";

            GM_xmlhttpRequest({
                method: "GET",
                url: url + params,
                headers: headers,
                onload: (res) => {
                    resolve(JSON.parse(JSON.stringify(JSON.parse(res.responseText), null, 2)));
                    // debug:
                    // console.log(oringinal_todo_items);
                    // todo_items = extractItems(oringinal_todo_items);
                    // createContainer();
                },
                onerror: (err) => {
                    reject(err);
                }
            });
        });
    };

    // 处理json文件: origin_todo_items => todo_items
    function extractItems(_oringinal_todo_items) {
        var _todo_items = [];
        for (let i=0; i<_oringinal_todo_items.length; i++) {
          _todo_items.push({
            "course": _oringinal_todo_items[i]['calendarName'],
            "todoItem": _oringinal_todo_items[i]['title'],
            "deadline": _oringinal_todo_items[i]['end']
          });
        }
        // 按照时间顺序排序
        _todo_items.sort((a, b) => {
            return Date.parse(a.deadline) - Date.parse(b.deadline);
        });
        return _todo_items;
    };

    // 添加渐变颜色
    function setColor(_todo_items) {
        // 渐变准备 1
        const generateGradientColors = (color1, color2, steps) => {
            // Convert color1 to RGB values
            const rgb1 = hexToRgb(color1);

            // Convert color2 to RGB values
            const rgb2 = hexToRgb(color2);

            // Generate gradient colors
            const colors = [];
            for (let i = 0; i <= steps; i++) {
                const r = interpolate(rgb1.r, rgb2.r, i, steps);
                const g = interpolate(rgb1.g, rgb2.g, i, steps);
                const b = interpolate(rgb1.b, rgb2.b, i, steps);
                const hex = rgbToHex(r, g, b);
                colors.push(hex);
            }
            return colors;
        };
        // 渐变准备 2: Convert a hexadecimal color code to an RGB object
        const hexToRgb = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return { r, g, b };
        };
        // 渐变准备 3: Convert an RGB object to a hexadecimal color code
        const rgbToHex = (r, g, b) => {
            const hex = ((r << 16) | (g << 8) | b).toString(16);
            return "#" + hex.padStart(6, "0");
        }
        // 渐变准备 4: Interpolate a value between two numbers
        const interpolate = (start, end, step, totalSteps) => {
            return start + ((end - start) * step) / totalSteps;
        }
        const colorChoices = [
            ['#ff4e4f', '#ff9d81'],
            ['#032e71', '#b8e9fc'],
            ['#ff2121', '#d14631']
        ];
        const colorArr = generateGradientColors(colorChoices[1][0], colorChoices[1][1], _todo_items.length);
        for (let i=0; i<_todo_items.length; i++) {
            _todo_items[i]['color'] = colorArr[i];
        }
        return _todo_items;
    };


    // MAIN 1: 作业批改增强
    async function assignmentEnhanced() {
        console.log('进入作业批改模式');

        await setTimeout(() => {
            pageOptimal();
            scoreCount();
            addMemo();
        }, 3000);

        // 优化页面布局 => 自动打开评价标签 & 删除部分元素
        function pageOptimal() {
            console.log("Loading Page Optimization!");
            document.querySelector("#currentAttempt_gradeDataPanel").style.display = ''; // 展开评价框
            // 需要删除的元素
            const waitList = [
            document.querySelector("#currentAttempt_feedback_wrapper > h4"), // "给学习者的反馈"
            document.querySelector("#feedbacktext_tbl > tbody > tr > td > span"), // "对于工具栏，请按 ALT+F10 (PC) 或 ALT+FN+F10 (Mac)。"
            document.querySelector("#currentAttempt_gradeDataPanelLink") // 折叠按钮
            ];
            // 删除元素
            for (let i=0; i<waitList.length; i++) {
            waitList[i].remove();
            }
        };

        // 自动算分
        const extractNums = (feedback) => {
            const pattern = /-\d+(\.\d+)?/g;
            return feedback.match(pattern);
        };

        const computeGrade = (extractedArr, totalGrade) => {
            if (!extractedArr) {return totalGrade;}
            let grade = totalGrade;
            for (let i=0; i<extractedArr.length; i++) {
            grade += parseFloat(extractedArr[i]);
            }
            return grade.toFixed(1);
        };

        function scoreCount() {
            console.log("Starting Score Counting!");
            // 需要定位的元素
            var element_body = document.querySelector("#feedbacktext_ifr").contentDocument.documentElement.querySelector("body");
            var element_fillingLocation = document.querySelector("#currentAttempt_grade");

            // 需要暂时存储的数据
            var feedback;
            var curGrade;
            var extractedArr;
            const lastGrade = document.querySelector("#aggregateGrade").value;
            const totalGrade = parseFloat(document.querySelector("#currentAttempt_pointsPossible").innerHTML.split('/')[1]);


            if (lastGrade != '-') {
                // 如果不是第一次批改作业 => 填入之前的成绩
                element_fillingLocation.value = lastGrade;
            }
            else {
                // 如果是第一次批改作业 => 填入满分
                element_fillingLocation.value = totalGrade;
            }

            element_body.addEventListener('input', (e) => {
                feedback = e.target.innerHTML;
                extractedArr = extractNums(feedback);
                curGrade = computeGrade(extractedArr, totalGrade);
                element_fillingLocation.value = curGrade;
            });
        }

        // 添加备忘录
        function addMemo() {
            const element_target = document.querySelector("#currentAttempt_submission");
            const addedContainer = document.createElement("div");
            addedContainer.style.cssText = `
                width: 100%;
                height: auto;
                background-color: #dff0f4;
            `;
            element_target.parentNode.style.height = 'auto';
            element_target.parentNode.insertBefore(addedContainer, element_target);


            const memoContainer = document.createElement("div");
            memoContainer.style.cssText = `
                // background-color: #ccc;
                width: 100%;
                height: 288px;
                display: flex;
                flex-direction: column;
                align-items: center;
            `;
            addedContainer.append(memoContainer);

            const memoList = document.createElement("div");
            memoList.style.cssText = `
                border: 1px solid #ccc;
                margin-top: 20px;
                width: calc(100% - 32px);
                height: 100%;
                overflow-y: scroll;
                pointer-events: auto;
            `;
            memoContainer.append(memoList);

            const memoInput = document.createElement("div");
            memoInput.style.cssText = `
                height: 300%;
                width: calc(100% - 10px);
                background-color: #ffffff;
                padding: 5px;
                inline-height: 1.2;
                outline: none;
            `;
            memoList.append(memoInput);

            memoInput.contentEditable = true;
            memoInput.addEventListener('input', () => {
                GM_setValue('memo_content', memoInput.innerHTML);
            });
            memoInput.innerHTML = GM_getValue("memo_content", "Memo Here");



            const clearContainer = document.createElement("div");
            clearContainer.style.cssText = `
                margin-top: 10px;
                width: 100%;
                height: 47.6px;
                position: relative;
            `;


            const bakBtn = document.createElement("div");
            bakBtn.style.cssText = `
                background-color: #dadada;
                cursor: pointer;
                border: 0 solid;
                width: 46px;
                height: 27.6px;
                position: absolute;
                right: 70px;
                display: flex;
                justify-content: center;
                align-items: center;
            `;
            clearContainer.appendChild(bakBtn);
            const bakText = document.createElement("div");
            bakText.style.cssText = `color: #000000`;
            bakText.textContent = "恢复";
            bakBtn.appendChild(bakText);
            bakBtn.addEventListener("click", () => {
                if (!GM_getValue("memo_bak")) {
                    alert("No Memo Bak!");
                }
                else {
                    GM_setValue("memo_content", GM_getValue("memo_bak"));
                    memoInput.innerHTML = GM_getValue("memo_content");
                }
            });


            const clearBtn = document.createElement("div");
            clearBtn.style.cssText = `
                background-color: #333333;
                cursor: pointer;
                border: 0 solid;
                width: 46px;
                height: 27.6px;
                position: absolute;
                right: 16px;
                display: flex;
                justify-content: center;
                align-items: center;
            `;

            const clearText = document.createElement("div");
            clearText.style.cssText = `color: #ffffff`;
            clearText.textContent = "清空";
            clearBtn.appendChild(clearText);

            // 监听 “清空” 按钮
            clearBtn.addEventListener("click", () => {
                console.log("Clear Button Clicked");
                GM_setValue("memo_bak", memoInput.innerHTML);
                GM_setValue("memo_content", 'Memo Here');
                memoInput.innerHTML = GM_getValue("memo_content");
            });

            clearContainer.appendChild(clearBtn);
            addedContainer.appendChild(clearContainer);

        };
    };


    // MAIN 2: DDL催命鬼
    async function deadlineEnhanced() {
        await createContainer();

        // 创建容器
        function createContainer() {
            var container = document.createElement('div');

            const container_location = GM_getValue('container_location', {
                                        'container_top': '100px',
                                        'container_left': '100px'
                                    });

            // 菜单: 初始默认符号为 ☐
            let checked = GM_getValue('checked', true);
            let symbol = checked ? '☑' : '☐';
            GM_registerMenuCommand(`${symbol} DDL Poster`, toggleMenu);
            // 点击菜单的处理函数
            function toggleMenu() {
                GM_unregisterMenuCommand(`${symbol} DDL Poster`)
                checked = !checked; GM_setValue('checked', checked);
                symbol = checked ? '☑' : '☐';
                GM_registerMenuCommand(`${symbol} DDL Poster`, toggleMenu);
                container.style.display = checked ? '': 'none';
                GM_notification({
                    title: 'DDL Poster',
                    text: `${checked? 'Poster已打开': 'Poster已关闭'}`,
                    timeout: 2000,
                    onclick: () => {console.log('Notification Clicled!')}
                });
            };


            const container_style = `
                position: fixed;
                z-index: 10000;
                top: ${container_location['container_top']};
                left: ${container_location['container_left']};
                width: 290px;
                height: 300px;
                opacity: 0.8;
                pointer-events: auto;
                border-radius: 0;
                display: ${GM_getValue('checked', true) ? '': 'none'};
            `;
            container.style.cssText = container_style;
            document.body.appendChild(container);

            // 创建滚动列表
            const list = document.createElement('div');
            const list_style = `
                width: 100%;
                height: 80%;
                overflow-y: scroll;
                pointer-events: auto;
                border-radius: 15px;
                ::-webkit-scrollbar {
                    width: 0;
                    background: transparent;
                }
            `;
            list.style.cssText = list_style;
            container.appendChild(list);

            // 创建每个待办事项 (item)
            for (let i=0; i<todo_items.length; i++) {
                const name = todo_items[i]['course'];

                const item = document.createElement('div');
                const item_style = `
                    width: 95%;
                    height: auto;
                    margin-top: 8px;
                    border-radius: 15px;
                    margin-left: 5px;
                    pointer-events: auto;
                    background-color: ${todo_items[i]['color']};
                    display: flex;
                    flex-direction: column;
                    align-items: left;
                    cursor: move;
                `;
                item.style.cssText = item_style;

                var assignment = document.createElement('div');
                const assignment_style = `
                    margin-top: 10px;
                    margin-left: 12px;
                    font-size: 17px;
                    font-weight: bold;
                    color: #f5f5f6;
                `;
                assignment.innerText = `${todo_items[i]['todoItem']}`;
                assignment.style.cssText = assignment_style;
                item.appendChild(assignment);

                var course_name = document.createElement('a');
                const course_name_style = `
                    display: inline;
                    // text-decoration: underline;
                    margin-top: 10px;
                    margin-left: 12px;
                    font-weight: bold;
                    font-size: 10px;
                    color: #e0e0ef;
                    cursor: pointer;
                `;
                course_name.style.cssText = course_name_style;
                course_name.innerText = `${todo_items[i]['course']}`;
                course_name.href = course_database[name]['href'];
                item.appendChild(course_name);


                var countDown = document.createElement('div');
                const countDown_style = `
                    margin-left: 12px;
                    margin-bottom: 10px;
                    font-weight: bold;
                    font-size: 22px;
                    color: #e0e0ce;

                `;
                countDown.style.cssText = countDown_style;
                countDown.innerHTML = formatDuration(Date.parse(todo_items[i]['deadline']) - (new Date()).getTime());
                flashTime(countDown, i);

                moveContainer(item, container);
                item.appendChild(countDown);
                list.appendChild(item);
            }

        };


        // 移动容器
        function moveContainer(_element, _container) {
            _element.addEventListener('mousedown', (e) => {
                var xOffset = e.clientX - _container.offsetLeft;
                var yOffset = e.clientY - _container.offsetTop;
                // debug: console.log(xOffset, yOffset);

                var handleMouseMove = (e) => {
                    _container.style.left = (e.clientX - xOffset) + 'px';
                    _container.style.top = (e.clientY - yOffset) + 'px';
                }

                document.addEventListener('mousemove', handleMouseMove);

                document.addEventListener('mouseup', function() {
                    GM_setValue('container_location', {
                        'container_top': _container.style.top,
                        'container_left': _container.style.left
                    });
                    document.removeEventListener('mousemove', handleMouseMove);
                });
            });
        }

        // 倒计时
        function flashTime(_countDown, i) {
            setInterval(() => {
              var now = new Date();
              _countDown.innerHTML = formatDuration(Date.parse(todo_items[i]['deadline']) - now.getTime());
            }, 1000);
        }

        // 时间差转换: ms => x天x小时x分钟x秒
        function formatDuration(ms) {
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

    };


})();