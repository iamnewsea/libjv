
import jv from "libjv"

jv.defEnum("ComponentPropertyTypeEnum",
    [
        {"name": "Text", "remark": "文本"},
        {"name": "Number", "remark": "数字"},
        {"name": "Array", "remark": "数组"},
        {
            "name": "Object",
            "remark": "对象"
        },
        {"name": "Int", "remark": "整数"},
        {
            "name": "Float",
            "remark": "小数"
        },
        {
            "name": "TextArea",
            "remark": "多行文本"
        },
        {"name": "Radio", "remark": "单选"},
        {"name": "Check", "remark": "多选"},
        {"name": "Boolean", "remark": "布尔"},
        {
            "name": "File",
            "remark": "文件"
        },
        {"name": "DateTime", "remark": "日期时间"},
        {"name": "Date", "remark": "日期"},
        {"name": "Time", "remark": "时间"},
        {"name": "Color", "remark": "颜色"}
    ]
);
jv.defEnum("ComponentPropertyFormatTypeEnum",
    [
        {"name": "Email", "remark": "邮件格式"},
        {
            "name": "Mobile",
            "remark": "手机号格式"
        },
        {"name": "Name", "remark": "名称格式"},
        {"name": "Password", "remark": "密码格式"},
        {"name": "Url", "remark": "网址格式"}
    ]);


export default  jv;