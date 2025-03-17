## 概述

本文档描述了302.ai平台提供的视频生成API接口。这些接口支持文本生成视频、图片生成视频等功能。

## 基础URL

根据服务器配置，API的基础URL为：

```
http://localhost:3000/api/302
```

在生产环境中，可能会使用不同的域名和端口。如果环境变量PORT设置了其他值，端口会相应变化。

## 认证

API请求需要使用API密钥进行认证，通过Authorization头部传递：

```
Authorization: Bearer YOUR_API_KEY
```

## API端点

### 1. 文本生成视频

将文本提示转换为视频。

**请求**

```
POST http://localhost:3000/api/302/text2video
```

**请求体参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| prompt | string | 是 | 描述要生成的视频内容的文本提示 |
| aspect_ratio | string | 否 | 视频的宽高比 |
| camera_type | string | 否 | 相机类型 |
| camera_value | string | 否 | 相机值 |
| cfg | string | 否 | 配置参数 |
| negative_prompt | string | 否 | 负面提示，指定不希望出现在视频中的内容 |
| additionalParams | object | 否 | 其他附加参数 |

**响应**

成功时返回包含任务ID的JSON对象。

### 2. 图片生成视频

将输入图片转换为视频。

**请求**

```
POST http://localhost:3000/api/302/image2video
```

**请求体参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| input_image | file | 是 | 输入图片文件 |
| tail_image | file | 否 | 尾部图片文件 |
| prompt | string | 否 | 描述要生成的视频内容的文本提示 |
| aspect_ratio | string | 否 | 视频的宽高比 |
| camera_type | string | 否 | 相机类型 |
| camera_value | string | 否 | 相机值 |
| cfg | string | 否 | 配置参数 |
| negative_prompt | string | 否 | 负面提示，指定不希望出现在视频中的内容 |
| additionalParams | object | 否 | 其他附加参数 |

**响应**

成功时返回包含任务ID的JSON对象。

### 3. 获取任务状态

获取指定任务的当前状态。

**请求**

```
GET http://localhost:3000/api/302/tasks/{taskId}
```

**路径参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| taskId | string | 任务ID |

**响应**

返回包含任务状态信息的JSON对象。

### 4. 获取任务结果

获取已完成任务的结果。

**请求**

```
GET http://localhost:3000/api/302/tasks/{taskId}/result
```

**路径参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| taskId | string | 任务ID |

**响应**

返回包含任务结果的JSON对象。

### 5. 高质量图像生成视频

将图片转换为高质量16:9或9:16比例的10秒视频。

**请求**

```
POST http://localhost:3000/api/302/m2v_16_img2video_hq_10s
```

**请求体参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| input_image | file | 是 | 输入图片文件（JPG或PNG格式，不超过10MB） |
| prompt | string | 否 | 描述要生成的视频内容的文本提示 |
| aspect_ratio | string | 否 | 视频的宽高比，默认为"16:9" |
| cfg | string | 否 | 配置参数，默认为"0.5" |
| negative_prompt | string | 否 | 负面提示，指定不希望出现在视频中的内容 |

**响应**

成功时返回包含任务信息的JSON对象。

### 6. Runway 图生视频提交

使用Runway模型将图片转换为视频。

**请求**

```
POST http://localhost:3000/api/302/runway/submit
```

**请求体参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| init_image | file | 是 | 初始图片文件（JPG或PNG格式，尺寸必须为1280px×768px） |
| text_prompt | string | 否 | 描述要生成的视频内容的文本提示 |
| seconds | number | 否 | 视频长度，必须为5或10，默认为10 |
| seed | string | 否 | 随机种子 |
| image_as_end_frame | boolean | 否 | 是否将输入图片作为视频的最后一帧 |

**响应**

成功时返回包含任务ID的JSON对象。

### 7. 获取Runway任务结果

获取Runway模型生成的视频任务结果。

**请求**

```
GET http://localhost:3000/api/302/runway/task/{id}/fetch
```

**路径参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 任务ID |

**响应**

返回包含任务结果的JSON对象。

### 8. Runway 图生视频提交（JSON格式）

使用JSON格式提交Runway模型图生视频请求。

**请求**

```
POST http://localhost:3000/api/302/runway/submit/json
```

**请求体参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| init_image | string | 是 | Base64编码的图片数据（解码后尺寸必须为1280px×768px） |
| text_prompt | string | 否 | 描述要生成的视频内容的文本提示 |
| seconds | number | 否 | 视频长度，必须为5或10，默认为10 |
| seed | string | 否 | 随机种子 |
| image_as_end_frame | boolean | 否 | 是否将输入图片作为视频的最后一帧 |

**响应**

成功时返回包含任务ID的JSON对象。

## 错误处理

所有API在发生错误时会返回适当的HTTP状态码和包含错误信息的JSON对象：

```json
{
  "error": "错误描述"
}
```

常见的错误状态码：
- 400: 请求参数错误
- 500: 服务器内部错误
