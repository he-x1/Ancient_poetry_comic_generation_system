#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
墨韵诗画 - 古诗词AI教学系统
主应用入口
"""

from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import json
import random

app = Flask(__name__,
            static_folder='frontend/static',
            template_folder='frontend/templates')
CORS(app)

# 模拟数据库 - 古诗词数据
POEMS_DATA = [
    {
        "id": 1,
        "title": "静夜思",
        "author": "李白",
        "dynasty": "唐",
        "category": "思乡",
        "grade": "一年级",
        "content": "床前明月光，疑是地上霜。举头望明月，低头思故乡。",
        "pinyin": "chuáng qián míng yuè guāng，yí shì dì shàng shuāng。jǔ tóu wàng míng yuè，dī tóu sī gù xiāng。",
        "pinyin_chars": [
            [("床", "chuáng"), ("前", "qián"), ("明", "míng"), ("月", "yuè"), ("光", "guāng")],
            [("疑", "yí"), ("是", "shì"), ("地", "dì"), ("上", "shàng"), ("霜", "shuāng")],
            [("举", "jǔ"), ("头", "tóu"), ("望", "wàng"), ("明", "míng"), ("月", "yuè")],
            [("低", "dī"), ("头", "tóu"), ("思", "sī"), ("故", "gù"), ("乡", "xiāng")]
        ],
        "translation": "明亮的月光洒在床前的窗户纸上，好像地上泛起了一层霜。我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。",
        "annotation": "这是一首描写游子思乡的千古名作。诗人通过描写月夜景色，表达了对故乡的深深思念。",
        "audio_url": "/static/audio/jingyesi.mp3",
        "cover_image": "/static/images/poems/jingyesi.jpg"
    },
    {
        "id": 2,
        "title": "春晓",
        "author": "孟浩然",
        "dynasty": "唐",
        "category": "写景",
        "grade": "一年级",
        "content": "春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。",
        "pinyin": "chūn mián bù jué xiǎo，chù chù wén tí niǎo。yè lái fēng yǔ shēng，huā luò zhī duō shǎo。",
        "pinyin_chars": [
            [("春", "chūn"), ("眠", "mián"), ("不", "bù"), ("觉", "jué"), ("晓", "xiǎo")],
            [("处", "chù"), ("处", "chù"), ("闻", "wén"), ("啼", "tí"), ("鸟", "niǎo")],
            [("夜", "yè"), ("来", "lái"), ("风", "fēng"), ("雨", "yǔ"), ("声", "shēng")],
            [("花", "huā"), ("落", "luò"), ("知", "zhī"), ("多", "duō"), ("少", "shǎo")]
        ],
        "translation": "春天睡醒不觉天已破晓，到处都是鸟儿的啼叫声。回想昨夜的风雨声，不知花儿落了多少。",
        "annotation": "这首诗是诗人隐居在鹿门山时所作，描绘了春天早晨的美丽景色，表达了诗人对春天的喜爱。",
        "audio_url": "/static/audio/chunxiao.mp3",
        "cover_image": "/static/images/poems/chunxiao.jpg"
    },
    {
        "id": 3,
        "title": "登鹳雀楼",
        "author": "王之涣",
        "dynasty": "唐",
        "category": "励志",
        "grade": "二年级",
        "content": "白日依山尽，黄河入海流。欲穷千里目，更上一层楼。",
        "pinyin": "bái rì yī shān jìn，huáng hé rù hǎi liú。yù qióng qiān lǐ mù，gèng shàng yī céng lóu。",
        "pinyin_chars": [
            [("白", "bái"), ("日", "rì"), ("依", "yī"), ("山", "shān"), ("尽", "jìn")],
            [("黄", "huáng"), ("河", "hé"), ("入", "rù"), ("海", "hǎi"), ("流", "liú")],
            [("欲", "yù"), ("穷", "qióng"), ("千", "qiān"), ("里", "lǐ"), ("目", "mù")],
            [("更", "gèng"), ("上", "shàng"), ("一", "yī"), ("层", "céng"), ("楼", "lóu")]
        ],
        "translation": "太阳依傍山峦渐渐下沉，黄河向着大海滔滔东流。如果要想遍览千里风光，那就请再登上一层高楼。",
        "annotation": "这首诗写诗人在登高望远中表现出来的不凡的胸襟抱负，反映了盛唐时期人们积极向上的进取精神。",
        "audio_url": "/static/audio/dengguanquelou.mp3",
        "cover_image": "/static/images/poems/dengguanquelou.jpg"
    },
    {
        "id": 4,
        "title": "望庐山瀑布",
        "author": "李白",
        "dynasty": "唐",
        "category": "写景",
        "grade": "二年级",
        "content": "日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。",
        "pinyin": "rì zhào xiāng lú shēng zǐ yān，yáo kàn pù bù guà qián chuān。fēi liú zhí xià sān qiān chǐ，yí shì yín hé luò jiǔ tiān。",
        "pinyin_chars": [
            [("日", "rì"), ("照", "zhào"), ("香", "xiāng"), ("炉", "lú"), ("生", "shēng"), ("紫", "zǐ"), ("烟", "yān")],
            [("遥", "yáo"), ("看", "kàn"), ("瀑", "pù"), ("布", "bù"), ("挂", "guà"), ("前", "qián"), ("川", "chuān")],
            [("飞", "fēi"), ("流", "liú"), ("直", "zhí"), ("下", "xià"), ("三", "sān"), ("千", "qiān"), ("尺", "chǐ")],
            [("疑", "yí"), ("是", "shì"), ("银", "yín"), ("河", "hé"), ("落", "luò"), ("九", "jiǔ"), ("天", "tiān")]
        ],
        "translation": "太阳照射香炉峰生出袅袅紫烟，远远望去瀑布像长河悬挂山前。仿佛三千尺水流飞奔直冲而下，莫非是银河从九天之外落下来。",
        "annotation": "这首诗形象地描绘了庐山瀑布雄奇壮丽的景色，反映了诗人对祖国大好河山的无限热爱。",
        "audio_url": "/static/audio/wanglushanpubu.mp3",
        "cover_image": "/static/images/poems/wanglushanpubu.jpg"
    },
    {
        "id": 5,
        "title": "早发白帝城",
        "author": "李白",
        "dynasty": "唐",
        "category": "写景",
        "grade": "三年级",
        "content": "朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。",
        "pinyin": "zhāo cí bái dì cǎi yún jiān，qiān lǐ jiāng líng yī rì huán。liǎng àn yuán shēng tí bù zhù，qīng zhōu yǐ guò wàn chóng shān。",
        "pinyin_chars": [
            [("朝", "zhāo"), ("辞", "cí"), ("白", "bái"), ("帝", "dì"), ("彩", "cǎi"), ("云", "yún"), ("间", "jiān")],
            [("千", "qiān"), ("里", "lǐ"), ("江", "jiāng"), ("陵", "líng"), ("一", "yī"), ("日", "rì"), ("还", "huán")],
            [("两", "liǎng"), ("岸", "àn"), ("猿", "yuán"), ("声", "shēng"), ("啼", "tí"), ("不", "bù"), ("住", "zhù")],
            [("轻", "qīng"), ("舟", "zhōu"), ("已", "yǐ"), ("过", "guò"), ("万", "wàn"), ("重", "chóng"), ("山", "shān")]
        ],
        "translation": "清晨，我告别高入云霄的白帝城，江陵远在千里之外，船行只需一日时间。两岸猿声还在耳边不停地啼叫，不知不觉轻舟已穿过万重青山。",
        "annotation": "这首诗通过描写从白帝城到江陵的行程，展现了长江三峡的壮丽景色，表达了诗人愉快的心情。",
        "audio_url": "/static/audio/zaofabaidicheng.mp3",
        "cover_image": "/static/images/poems/zaofabaidicheng.jpg"
    },
    {
        "id": 6,
        "title": "咏鹅",
        "author": "骆宾王",
        "dynasty": "唐",
        "category": "咏物",
        "grade": "一年级",
        "content": "鹅鹅鹅，曲项向天歌。白毛浮绿水，红掌拨清波。",
        "pinyin": "é é é，qū xiàng xiàng tiān gē。bái máo fú lǜ shuǐ，hóng zhǎng bō qīng bō。",
        "pinyin_chars": [
            [("鹅", "é"), ("鹅", "é"), ("鹅", "é")],
            [("曲", "qū"), ("项", "xiàng"), ("向", "xiàng"), ("天", "tiān"), ("歌", "gē")],
            [("白", "bái"), ("毛", "máo"), ("浮", "fú"), ("绿", "lǜ"), ("水", "shuǐ")],
            [("红", "hóng"), ("掌", "zhǎng"), ("拨", "bō"), ("清", "qīng"), ("波", "bō")]
        ],
        "translation": "鹅呀鹅呀鹅，弯着脖子向天歌唱。洁白的羽毛漂浮在碧绿的水面上，红红的脚掌拨动着清清的水波。",
        "annotation": "这是诗人七岁时写的一首咏物诗，描写了白鹅在水中嬉戏的情景，表达了诗人对白鹅的喜爱之情。",
        "audio_url": "/static/audio/yonge.mp3",
        "cover_image": "/static/images/poems/yonge.jpg"
    }
]

# 模拟用户生成作品数据
USER_WORKS = [
    {
        "id": 1,
        "user_id": 1,
        "username": "诗画小达人",
        "avatar": "/static/images/avatars/user1.jpg",
        "poem_id": 1,
        "poem_title": "静夜思",
        "image_url": "/static/images/works/work1.jpg",
        "style": "水墨风",
        "likes": 128,
        "created_at": "2024-01-15"
    },
    {
        "id": 2,
        "user_id": 2,
        "username": "古风爱好者",
        "avatar": "/static/images/avatars/user2.jpg",
        "poem_id": 4,
        "poem_title": "望庐山瀑布",
        "image_url": "/static/images/works/work2.jpg",
        "style": "水彩风",
        "likes": 256,
        "created_at": "2024-01-14"
    },
    {
        "id": 3,
        "user_id": 3,
        "username": "小学生小明",
        "avatar": "/static/images/avatars/user3.jpg",
        "poem_id": 2,
        "poem_title": "春晓",
        "image_url": "/static/images/works/work3.jpg",
        "style": "卡通风",
        "likes": 89,
        "created_at": "2024-01-13"
    }
]

# 朝代分类
DYNASTIES = ["唐", "宋", "元", "明", "清", "先秦", "汉", "魏晋"]

# 主题分类
CATEGORIES = ["思乡", "写景", "咏物", "送别", "边塞", "田园", "励志", "爱情"]

# 年级分类
GRADES = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"]


# ==================== 页面路由 ====================

@app.route('/')
def index():
    """主页"""
    return render_template('index.html')


# ==================== API 路由 ====================

@app.route('/api/poems', methods=['GET'])
def get_poems():
    """获取诗词列表"""
    dynasty = request.args.get('dynasty')
    category = request.args.get('category')
    grade = request.args.get('grade')
    keyword = request.args.get('keyword', '').strip()

    filtered = POEMS_DATA.copy()

    if dynasty:
        filtered = [p for p in filtered if p['dynasty'] == dynasty]
    if category:
        filtered = [p for p in filtered if p['category'] == category]
    if grade:
        filtered = [p for p in filtered if p['grade'] == grade]
    if keyword:
        filtered = [p for p in filtered if keyword in p['title'] or keyword in p['author'] or keyword in p['content']]

    return jsonify({
        "success": True,
        "data": filtered,
        "total": len(filtered)
    })


@app.route('/api/poems/<int:poem_id>', methods=['GET'])
def get_poem(poem_id):
    """获取单首诗词详情"""
    poem = next((p for p in POEMS_DATA if p['id'] == poem_id), None)
    if poem:
        return jsonify({
            "success": True,
            "data": poem
        })
    return jsonify({
        "success": False,
        "message": "诗词不存在"
    }), 404


@app.route('/api/categories', methods=['GET'])
def get_categories():
    """获取分类数据"""
    return jsonify({
        "success": True,
        "data": {
            "dynasties": DYNASTIES,
            "categories": CATEGORIES,
            "grades": GRADES
        }
    })


@app.route('/api/generate', methods=['POST'])
def generate_image():
    """AI生成绘本图像"""
    data = request.get_json()
    poetry = data.get('poetry', '')
    style = data.get('style', '水墨风')

    if not poetry:
        return jsonify({
            "success": False,
            "message": "请输入诗词内容"
        }), 400

    # 模拟 AI 生成 - 实际项目中这里会调用 DeepSeek 和 ComfyUI
    # 返回一个模拟的生成结果
    import time
    time.sleep(0.5)  # 模拟处理时间

    # 生成模拟图片URL
    mock_images = [
        "/static/images/generated/gen1.jpg",
        "/static/images/generated/gen2.jpg",
        "/static/images/generated/gen3.jpg"
    ]

    return jsonify({
        "success": True,
        "data": {
            "images": random.sample(mock_images, min(3, len(mock_images))),
            "style": style,
            "prompt": f"为《{poetry[:10]}...》生成的{style}绘本",
            "processing_time": "15.3s"
        }
    })


@app.route('/api/works', methods=['GET'])
def get_works():
    """获取用户作品列表"""
    return jsonify({
        "success": True,
        "data": USER_WORKS,
        "total": len(USER_WORKS)
    })


@app.route('/api/works', methods=['POST'])
def create_work():
    """发布作品到画廊"""
    data = request.get_json()
    # 模拟保存作品
    new_work = {
        "id": len(USER_WORKS) + 1,
        "user_id": data.get('user_id', 1),
        "username": "当前用户",
        "avatar": "/static/images/avatars/default.jpg",
        "poem_id": data.get('poem_id'),
        "poem_title": data.get('poem_title', ''),
        "image_url": data.get('image_url'),
        "style": data.get('style', '水墨风'),
        "likes": 0,
        "created_at": "2024-01-16"
    }
    USER_WORKS.insert(0, new_work)
    return jsonify({
        "success": True,
        "message": "作品发布成功",
        "data": new_work
    })


@app.route('/api/works/<int:work_id>/like', methods=['POST'])
def like_work(work_id):
    """点赞作品"""
    work = next((w for w in USER_WORKS if w['id'] == work_id), None)
    if work:
        work['likes'] += 1
        return jsonify({
            "success": True,
            "likes": work['likes']
        })
    return jsonify({
        "success": False,
        "message": "作品不存在"
    }), 404


@app.route('/api/user/profile', methods=['GET'])
def get_profile():
    """获取用户信息"""
    # 模拟用户信息
    return jsonify({
        "success": True,
        "data": {
            "id": 1,
            "username": "诗词爱好者",
            "avatar": "/static/images/avatars/default.jpg",
            "level": 5,
            "exp": 1250,
            "total_works": 12,
            "total_likes": 368,
            "achievements": [
                {"name": "初入诗坛", "icon": "scroll", "unlocked": True},
                {"name": "唐诗达人", "icon": "book", "unlocked": True},
                {"name": "水墨大师", "icon": "brush", "unlocked": False}
            ],
            "collected_poems": [1, 2, 4],
            "my_works": [1]
        }
    })


if __name__ == '__main__':
    # 创建必要的静态资源目录
    os.makedirs('frontend/static/audio', exist_ok=True)
    os.makedirs('frontend/static/images/poems', exist_ok=True)
    os.makedirs('frontend/static/images/works', exist_ok=True)
    os.makedirs('frontend/static/images/avatars', exist_ok=True)
    os.makedirs('frontend/static/images/generated', exist_ok=True)

    app.run(host='0.0.0.0', port=5000, debug=True)
