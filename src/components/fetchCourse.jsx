export async function courseInfoCatch() {
    try {
        var orig_course_info = await get_course_id();
        // debug: console.log(orig_course_info)
        var course_db = store_course_id(orig_course_info);
        // debug: console.log(course_db)
        console.log("fetchCourse.js Success");

        return course_db;
    }
    catch (err) {
        console.log("fetchCourse.js Error: ", err);
    }
};

// 获取包含课程信息的网页
async function get_course_id() {
    const url = '/webapps/portal/execute/tabs/tabAction?action=refreshAjaxModule&modId=_2_1&tabId=_1_1&tab_tab_group_id=_1_1';

    return await fetch(url, {
        method: 'POST'
    }).then(res => res.text())
        .then(data => {
            return data
        })
        .catch(console.log)
};


// 正则表达式从网页中提取课程信息
function store_course_id(_orig_course_info) {
    var _course_db = {};
    const pattern = /<li>[\s\S]*?<\/li>/g;
    const regArr = _orig_course_info.match(pattern);
    for (let i = 0; i < regArr.length; i++) {
        // debug: console.log(regArr[i]);
        const pattern = {
            'course_name': /<a.*?>(.*?)<\/a>/,     // 课程名称
            'course_id': /id=(_\d+_\d+)/i,         // 课程ID
            'course_href': /href=['"](.*?)['"]/    // 课程主页链接
        };
        const course_name = regArr[i].match(pattern['course_name'])[1];
        const course_id = regArr[i].match(pattern['course_id'])[1];
        const course_href = regArr[i].match(pattern['course_href'])[1];
        _course_db[course_name] = {
            'id': course_id,
            'href': course_href
        }
        // debug: console.log(course_name, course_id, course_href);
    }

    return _course_db;
};