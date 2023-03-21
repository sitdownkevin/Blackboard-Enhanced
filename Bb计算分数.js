// ==UserScript==
// @name        Bb计算分数
// @namespace   Violentmonkey Scripts
// @match       *://pibb.scu.edu.cn/webapps/assignment/gradeAssignmentRedirector*
// @grant       none
// @version     1.3
// @author      呲呲呲
// @description 2023/3/21 21:02:10
// @license     MIT
// ==/UserScript==

(function() {
    'use strict';
  
    var bodyElement; // DOM: <body> => 获取iframe下的<body>标签
    var fillLocation; // DOM: <input> => 最后填分的<input>标签
    var feedback; // str => iframe内输入的内容
    var results; // array => 正则表达式提取 e.g.: ['-2', '-4']
    // var finalGrade = 100.0;
    var finalGrade = parseFloat(document.querySelector("#currentAttempt_pointsPossible").innerHTML.split('/')[1]);
  
    // Bb必须加载很慢，必须延迟3000ms再开始程序
    setTimeout(() => {
      // 获取<body>: input所在位置
      bodyElement = document.querySelector("#feedbacktext_ifr").contentDocument.documentElement.querySelector("body");
      // 获取<input>: 填分的地方
      fillLocation = document.querySelector("#currentAttempt_grade");
      fillLocation.value = finalGrade;
      // 欢迎、检查
      console.log(fillLocation);
      console.log("Successfully Initialization!");
      // 监听用户input
      bodyElement.addEventListener('input', (event) => {
        feedback = event.target.innerHTML;
        extractNums(feedback); // 更新results
        finalGrade = computeGrade(); // 计算results
        console.log('Final Grade:', results);
        fillLocation.value = finalGrade; // 填写分数
      });
    }, 3000);
  
  
    function extractNums(htmlStr) {
      const pattern = /-\d+(\.\d+)?/g;
      results = htmlStr.match(pattern);
    };
  
  
    function computeGrade() {
      if (!results) {return parseFloat(document.querySelector("#currentAttempt_pointsPossible").innerHTML.split('/')[1]);}
      let grade = parseFloat(document.querySelector("#currentAttempt_pointsPossible").innerHTML.split('/')[1]);
      for (let i=0; i<results.length; i++) {
          grade += parseFloat(results[i]);
      }
      return grade.toFixed(1);
    };
  
  })();