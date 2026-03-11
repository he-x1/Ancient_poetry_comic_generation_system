# 墨韵诗画 - 古诗词AI教学系统

针对古文教学抽象与AI生图不连贯的痛点，本项目研发古诗文多模态AI教学平台。系统融合大模型分镜与特征锁定，攻克多角色一致性难题，实现文本到连续绘本与视频的自动化生成，内置自研精品库，沉浸式赋能课堂。

## 技术栈

- 后端：Python + Flask
- 前端：HTML5 + CSS3 + JavaScript (原生)
- 样式：Tailwind CSS (CDN)
- AI：DeepSeek + ComfyUI

## 快速开始

```bash
# 安装依赖
pip install -r requirements.txt

# 启动服务
python app.py
```

## 项目结构

```
├── app.py              # Flask 主应用
├── requirements.txt    # Python 依赖
├── frontend/
│   ├── static/         # 静态资源
│   │   ├── css/        # 样式文件
│   │   ├── js/         # JavaScript 文件
│   │   └── images/     # 图片资源
│   └── templates/      # HTML 模板
└── backend/            # 后端模块
```

## 四大模块

1. **藏书阁** - 古诗词浏览与学习
2. **点墨轩** - AI创作工坊
3. **群英会** - 作品画廊社区
4. **我的** - 个人中心
