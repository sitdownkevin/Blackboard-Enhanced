


// fetch Calendar Info
export async function calendarInfoCatch() {
    try {
        var orig_todo_items = await get_calendar();
        var todo_items = await extractItems(orig_todo_items);
        todo_items = await setColor(todo_items);
        console.log("fetchCalendar.js Success");
        // console.log(todo_items)
        return todo_items;
    }
    catch(err) {
        console.log("fetchCalendar.js Error: ", err);
    }
};


async function get_calendar() {
    const url = '/webapps/calendar/calendarData/selectedCalendarEvents';
    const start_date = new Date();
    const end_date = new Date();
    start_date.setDate(start_date.getDate() - 400);
    end_date.setDate(end_date.getDate() + 28);
    const params = "?start=" + start_date.getTime() + "&end=" + end_date.getTime() + "&course_id=&mode=personal";

    return fetch(url + params, {
        method: 'GET'
    }).then(res => res.json())
        .then(data => {
            // console.log(data)
            return data;
        })
        .catch(console.log)
}


// 处理json文件: origin_todo_items => todo_items
async function extractItems(_orig_todo_items) {
    var _todo_items = [];
    for (let i = 0; i < _orig_todo_items.length; i++) {
        // const _tmp_ddl = new Date('2023-09-12')
        _todo_items.push({
            "course": _orig_todo_items[i]['calendarName'],
            "todoItem": _orig_todo_items[i]['title'],
            "deadline": _orig_todo_items[i]['end']
            // "deadline": _tmp_ddl
        });
    }



    // 按照时间顺序排序
    _todo_items.sort((a, b) => {
        return Date.parse(a.deadline) - Date.parse(b.deadline);
    });
    return _todo_items;
};


// 添加渐变颜色
async function setColor(_todo_items) {
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
    for (let i = 0; i < _todo_items.length; i++) {
        _todo_items[i]['color'] = colorArr[i];
    }
    return _todo_items;
};
