// ==UserScript==
// @name        Bb计算分数
// @namespace   Violentmonkey Scripts
// @match       *://pibb.scu.edu.cn/webapps/assignment/gradeAssignmentRedirector*
// @grant       none
// @version     1.4
// @author      sitdownkevin
// @description 2023/3/23 17:14:10
// @license     MIT
// ==/UserScript==


(function() {
  'use strict';

  var element_body;
  var element_fillingLocation;
  var element_feedback;


  var feedback;
  var curGrade;
  var extractedArr;
  const lastGrade = document.querySelector("#aggregateGrade").value;
  const totalGrade = parseFloat(document.querySelector("#currentAttempt_pointsPossible").innerHTML.split('/')[1]);


  function extractNums(feedback) {
    const pattern = /-\d+(\.\d+)?/g;
    return feedback.match(pattern);
  };


  function computeGrade(extractedArr, totalGrade) {
    if (!extractedArr) {return totalGrade;}
    let grade = totalGrade;
    for (let i=0; i<extractedArr.length; i++) {
        grade += parseFloat(extractedArr[i]);
    }
    return grade.toFixed(1);
  };


  setTimeout(() => {
    console.log('Start to work!');
    element_body = document.querySelector("#feedbacktext_ifr").contentDocument.documentElement.querySelector("body");
    element_fillingLocation = document.querySelector("#currentAttempt_grade");

    if (lastGrade != '-') {
      element_fillingLocation.value = lastGrade;
    }
    else {
      element_fillingLocation.value = totalGrade;
    }

    element_body.addEventListener('input', (e) => {
      feedback = e.target.innerHTML;
      extractedArr = extractNums(feedback);
      // console.log(extractedArr);
      curGrade = computeGrade(extractedArr, totalGrade);
      element_fillingLocation.value = curGrade;
    });


  }, 3000);



})();