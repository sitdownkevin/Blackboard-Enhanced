// ==UserScript==
// @name        Bb 作业批改增强 | Bb Assignment Marking Enhanced
// @namespace   Violentmonkey Scripts
// @match       https://pibb.scu.edu.cn/webapps/*
// @match       https://pibb.scu.edu.cn/webapps/assignment/gradeAssignmentRedirector*
// @exclude     https://pibb.scu.edu.cn/webapps/bb-social-learning-BBLEARN/*
// @grant       none
// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue
// @version     1.6
// @author      sitdownkevin
// @description 2023/3/26 15:17:00
// @license     MIT
// ==/UserScript==


(function() {
  'use strict';

  // 作业批改增强
  if (window.location.href.startsWith('https://pibb.scu.edu.cn/webapps/assignment/gradeAssignmentRedirector')) {
      setTimeout(() => {
          console.log('进入作业批改模式');
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
          var element_target = document.querySelector("#currentAttempt_submission");
          var memo_container = document.createElement("div");

          memo_container.style.width = "100%";
          memo_container.style.height = "400px";
          memo_container.style.backgroundColor = "#DFF0F4";
          element_target.parentNode.insertBefore(memo_container, element_target);


          var memo_content = document.createElement("div");
          var memo_content_input = document.createElement("div");
          memo_content.style.height = '320px';
          memo_content.style.display = 'flex';
          memo_content.style.justifyContent = 'center';
          memo_content.style.alignItems = 'center';


          memo_content_input.contentEditable = true;
          if (!GM_getValue("memo_content")) {
              GM_setValue("memo_content", '这是一个备忘录');
          }
          memo_content_input.innerHTML = GM_getValue("memo_content");

          memo_content_input.style.height = '90%';
          memo_content_input.style.width = '95%';
          memo_content_input.style.backgroundColor = "#FFFFFF";
          memo_content_input.style.border = '1px solid #ccc';
          memo_content_input.style.padding = '2px';

          // 监听 “备忘录” 输入
          memo_content_input.addEventListener('input', () => {
          // debug: console.log(memo_content_input.innerHTML);
          GM_setValue("memo_content", memo_content_input.innerHTML);
          });


          memo_content.append(memo_content_input);
          memo_container.append(memo_content);

          var memo_clear = document.createElement("div");
          var memo_clear_btn = document.createElement("button");
          memo_clear.style.height = '30px';
          memo_clear.style.position = "relative";
          memo_clear_btn.style.backgroundColor = '#DADADA';
          memo_clear_btn.style.border = '0 solid';
          memo_clear_btn.style.width = '70px';
          memo_clear_btn.style.height = '30px';
          memo_clear_btn.style.position = "absolute";
          memo_clear_btn.style.top = "50%";
          memo_clear_btn.style.left = "50%";
          memo_clear_btn.style.transform = "translate(-50%, -50%)";


          memo_clear_btn.textContent = "清除";

          // 监听 “清除” 按钮
          memo_clear_btn.addEventListener("click", () => {
              console.log("Clear Button Clicked");
              GM_setValue("memo_content", '这是一个备忘录');
              memo_content_input.innerHTML = GM_getValue("memo_content");
          });

          memo_clear.append(memo_clear_btn);
          memo_container.append(memo_clear);

      };
  };
  // DDL催命鬼
  if (window.location.href.startsWith('https://pibb.scu.edu.cn/webapps')) {
      var oringinal_todo_items, todo_items;

      setTimeout(() => {

          const cookie = document.cookie;

          var start_date = new Date();
          var end_date = new Date();
          end_date.setDate(end_date.getDate() + 28);
          const url = "https://pibb.scu.edu.cn/webapps/calendar/calendarData/selectedCalendarEvents";

          const params = "?start=" + start_date.getTime() + "&end=" + end_date.getTime() + "&course_id=&mode=personal";



          GM_xmlhttpRequest({
            method: "GET",
            url: url + params,
            headers: {
              "Cookie": cookie,
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
              "Referer": "https://pibb.scu.edu.cn/webapps/calendar/viewMyBb?globalNavigation=false",
              "Accept": "*/*",
              "Sec-Fetch-Site": "same-origin"
            },
            onload: (res) => {
              oringinal_todo_items = JSON.parse(JSON.stringify(JSON.parse(res.responseText), null, 2));
              console.log(oringinal_todo_items);
              todo_items = extractItems(oringinal_todo_items);
              createContainer();
            }

          });


        }, 300);


      // 处理json文件: origin_todo_items => todo_items
      function extractItems(oringinal_todo_items) {
          var todo_items = [];
          for (let i=0; i<oringinal_todo_items.length; i++) {
            todo_items.push({
              "course": oringinal_todo_items[i]['calendarName'],
              "todoItem": oringinal_todo_items[i]['title'],
              "deadline": oringinal_todo_items[i]['end']
            });
          }
          // 按照时间顺序排序
          todo_items.sort((a, b) => {
              return Date.parse(a.deadline) - Date.parse(b.deadline);
          });

          return todo_items;
      };




      // 创建容器
      function createContainer() {
          var container = document.createElement('div');

          if (!GM_getValue('container_style')){
              GM_setValue('container_style', {
                  'container_top': '100px',
                  'container_left': '100px'
              });
          }

          const container_style = `
              position: fixed;
              z-index: 10000;
              top: ${GM_getValue('container_style')['container_top']};
              left: ${GM_getValue('container_style')['container_left']};
              width: 290px;
              height: 300px;
              background-color11: #efefef;
              opacity: 0.85;
              pointer-events: auto;
              border-radius: 0;
          `;
          container.style.cssText = container_style;
          document.body.appendChild(container);


          // const titleOfDeadline = document.createElement('h1');
          // const titleOfDeadline_style = `
          //     margin: auto;
          //     color: #B5D4AC;
          // `;
          // titleOfDeadline.style.cssText = titleOfDeadline_style;
          // titleOfDeadline.textContent = "Deadline";
          // container.appendChild(titleOfDeadline);

          // 创建滚动列表
          const list = document.createElement('div');
          const list_style = `
              width: 100%;
              height: 100%;
              overflow-y: scroll;
              pointer-events: auto;
              border-radius: 15px;
              ::-webkit-scrollbar {
                  width: 0;
                  background: transparent;
              }
          `;
          // list.setAttribute('style', list_style);
          list.style.cssText = list_style;
          container.appendChild(list);

          // 创建行
          for (let i=0; i<todo_items.length; i++) {
              const item = document.createElement('div');
              const item_style = `
                  width: 95%;
                  height: auto;
                  margin-top: 8px;
                  border-radius: 15px;
                  margin-left: 5px;
                  pointer-events: auto;
                  background-color: #f2eada;
                  display: flex;
                  flex-direction: column;
                  align-items: left;
              `;
              item.style.cssText = item_style;


              var assignment = document.createElement('div');
              assignment.style.marginTop = "10px";
              assignment.innerText = `${todo_items[i]['todoItem']}`;
              assignment.style.marginLeft = "12px";
              assignment.style.fontSize = "17px";
              assignment.style.fontWeight = "bold";
              assignment.style.color = "#f15a22";
              item.appendChild(assignment);

              var course_name = document.createElement('div');
              course_name.style.marginTop = "10px";
              course_name.innerText = `${todo_items[i]['course']}`;
              course_name.style.marginLeft = "12px";
              course_name.style.fontWeight = "bold";
              course_name.style.fontSize = "10px";
              item.appendChild(course_name);


              var countDown = document.createElement('div');
              countDown.style.marginLeft = "12px";
              countDown.style.fontWeight = "bold";
              countDown.style.fontSize = "22px";
              countDown.style.marginBottom = "10px";
              countDown.innerHTML = formatDuration(Date.parse(todo_items[i]['deadline']) - (new Date()).getTime());
              flashTime(countDown, i);

              moveContainer(item, container);
              item.appendChild(countDown);
              list.appendChild(item);

          }

      };




      // 移动容器
      function moveContainer(element, container) {
          console.log('Add S');

          element.addEventListener('mousedown', (e) => {
              var xOffset = e.clientX - container.offsetLeft;
              var yOffset = e.clientY - container.offsetTop;
              console.log(xOffset, yOffset);

              var handleMouseMove = (e) => {
                  container.style.left = (e.clientX - xOffset) + 'px';
                  container.style.top = (e.clientY - yOffset) + 'px';

              }

              document.addEventListener('mousemove', handleMouseMove);

              document.addEventListener('mouseup', function() {
                  GM_setValue('container_style', {
                      'container_top': container.style.top,
                      'container_left': container.style.left
                  });
                  document.removeEventListener('mousemove', handleMouseMove);
              });
          });
      }

      // 倒计时
      function flashTime(countDown, i){
          setInterval(() => {
            var now = new Date();
            countDown.innerHTML = formatDuration(Date.parse(todo_items[i]['deadline']) - now.getTime());
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
      }

  }


})();