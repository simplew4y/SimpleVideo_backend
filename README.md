# SimpleVedio
Integrated with multiple text-to-video APIs, effortlessly transforming text into captivating video content.


---
更新日志：
2025/3/18:

请求示例：
文生视频；
http://localhost:5001/api/302/unified/text2video

请求头：
Content-Type:application/json

请求体：
prompt:beautiful sunset over mountains
negative_prompt:blurry, low quality
model:kling
cfg:0.5
aspect_ratio:16:9
quality:normal
video_length:10s

结果示例：
```json
{
    "data": {
        "limitation": {
            "limit": 10000,
            "remaining": 10000,
            "type": "m2v_txt2video"
        },
        "message": "",
        "status": 5,
        "task": {
            "createTime": 1742234867407,
            "deleted": false,
            "favored": false,
            "id": "kling_1062989c76b1",
            "status": 5,
            "taskInfo": {
                "arguments": [
                    {
                        "name": "prompt",
                        "value": "beautiful sunset over mountains"
                    },
                    ...省略部分
                    {
                        "name": "__userType",
                        "value": "MEMBERSHIP"
                    }
                ],
                "callbackPayloads": [],
                "extraArgs": {},
                "inputs": [],
                "type": "m2v_txt2video"
            },
            "type": "m2v_txt2video",
            "updateTime": 1742234867407,
            "viewTime": 0,
            "viewed": false
        },
        "userTickets": {
            "ticket": []
        },
        "works": []
    },
    "message": "成功",
    "result": 1,
    "status": 200,
    "timestamp": [
        2025,
        3,
        18,
        2,
        7,
        47,
        486434000
    ]
}
```

查询kling 任务：

get :http://localhost:5001/api/302/tasks/{id}/result

图生视频：

post：http://localhost:5001/api/302/runway/submit

请求头：
Content-Type:multipart/form-data

请求体：
form data:

init_image file 
text_promp: a cat
second: 5
seed:2332
image_as_end_frame: false

返回示例：
```json
{
    "task": {
        "artifacts": [
            {
                "previewUrls": [],
                "url": ""
            }
        ],
        "id": "runway_7a2453f1fb22",
        "options": {
            "text_prompt": ""
        },
        "status": "PENDING"
    }
}
```

查询runway结果：
get http://localhost:5001/api/302/runway/task/runway_7a2453f1fb22/fetch

后续会加入：所有查询任务统一为一个url，因为taskid是唯一的。

更新：初始化数据库，建表