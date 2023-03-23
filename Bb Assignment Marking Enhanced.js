// ==UserScript==
// @name        Bb 作业批改增强 | Bb Assignment Marking Enhanced
// @namespace   Violentmonkey Scripts
// @match       *://pibb.scu.edu.cn/webapps/assignment/gradeAssignmentRedirector*
// @grant       none
// @grant       GM_setValue
// @grant       GM_getValue
// @version     1.5
// @author      sitdownkevin
// @description 2023/3/24 3:31:10
// @license     MIT
// ==/UserScript==


(function() {
  'use strict';


  setTimeout(() => {
    console.log('Start to Work');
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



})();