/**
 * 墨韵诗画 - 古诗词AI教学系统
 * 前端交互脚本
 */

// ==================== 全局状态 ====================
const state = {
    currentPage: 'home',
    isLoggedIn: false,
    poems: [],
    currentPoem: null,
    categories: {
        dynasties: [],
        categories: [],
        grades: []
    },
    activeFilter: null,
    generatedImages: [],
    selectedStyle: '水墨风'
};

// ==================== API 接口 ====================
const API = {
    baseUrl: '/api',

    async fetchJson(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: '网络请求失败' };
        }
    },

    // 获取诗词列表
    async getPoems(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.fetchJson(`${this.baseUrl}/poems?${query}`);
    },

    // 获取单首诗词
    async getPoem(id) {
        return this.fetchJson(`${this.baseUrl}/poems/${id}`);
    },

    // 获取分类数据
    async getCategories() {
        return this.fetchJson(`${this.baseUrl}/categories`);
    },

    // AI生成图像
    async generateImage(poetry, style) {
        return this.fetchJson(`${this.baseUrl}/generate`, {
            method: 'POST',
            body: JSON.stringify({ poetry, style })
        });
    },

    // 获取作品列表
    async getWorks() {
        return this.fetchJson(`${this.baseUrl}/works`);
    },

    // 发布作品
    async publishWork(data) {
        return this.fetchJson(`${this.baseUrl}/works`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // 点赞作品
    async likeWork(id) {
        return this.fetchJson(`${this.baseUrl}/works/${id}/like`, {
            method: 'POST'
        });
    },

    // 获取用户信息
    async getProfile() {
        return this.fetchJson(`${this.baseUrl}/user/profile`);
    }
};

// ==================== 页面切换 ====================
function switchPage(pageName) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('page-hidden');
    });

    // 显示目标页面
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.remove('page-hidden');
    }

    // 更新导航栏状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        item.classList.add('text-ancient-brown');
    });
    const activeNav = document.querySelector(`.nav-item[data-page="${pageName}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
        activeNav.classList.remove('text-ancient-brown');
    }

    state.currentPage = pageName;

    // 页面加载时的操作
    if (pageName === 'gallery') {
        loadGallery();
    } else if (pageName === 'profile') {
        loadProfile();
    }
}

// ==================== 诗词列表 ====================
async function loadPoems(filters = {}) {
    const result = await API.getPoems(filters);
    if (result.success) {
        state.poems = result.data;
        renderPoemList(result.data);
        document.getElementById('poemCount').textContent = `共 ${result.total} 首`;
    }
}

function renderPoemList(poems) {
    const container = document.getElementById('poemList');
    container.innerHTML = poems.map(poem => `
        <div class="poem-card card-hover rounded-xl p-4 cursor-pointer" onclick="showPoemDetail(${poem.id})">
            <div class="flex items-start justify-between mb-2">
                <div>
                    <h4 class="text-lg font-semibold text-ancient-dark">${poem.title}</h4>
                    <p class="text-sm text-ancient-brown">${poem.author} · ${poem.dynasty}</p>
                </div>
                <span class="px-2 py-1 bg-ancient-gold/20 text-ancient-gold text-xs rounded-full">${poem.category}</span>
            </div>
            <p class="text-ancient-dark/80 text-sm line-clamp-2">${poem.content}</p>
            <div class="flex items-center justify-between mt-3">
                <span class="text-xs text-ancient-brown/70">${poem.grade}</span>
                <i class="fas fa-chevron-right text-ancient-gold/50"></i>
            </div>
        </div>
    `).join('');
}

// ==================== 诗词详情 ====================
async function showPoemDetail(poemId) {
    const result = await API.getPoem(poemId);
    if (result.success) {
        state.currentPoem = result.data;
        renderPoemDetail(result.data);
        switchPage('detail');
    }
}

function renderPoemDetail(poem) {
    const container = document.getElementById('poemDetail');

    // 生成带拼音的诗词内容
    const pinyinContent = poem.pinyin_chars.map(line => {
        const chars = line.map(([char, pinyin]) =>
            `<ruby>${char}<rt>${pinyin}</rt></ruby>`
        ).join('');
        return `<p class="text-xl leading-loose text-ancient-dark mb-2 font-serif-cn">${chars}</p>`;
    }).join('');

    container.innerHTML = `
        <div class="bg-gradient-to-r from-ancient-ink to-ancient-dark p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h2 class="text-2xl font-calligraphy mb-1">${poem.title}</h2>
                    <p class="text-ancient-gold">${poem.author} · ${poem.dynasty}代</p>
                </div>
                <div class="flex space-x-3">
                    <button onclick="playAudio('${poem.audio_url}')" class="w-12 h-12 bg-ancient-gold rounded-full flex items-center justify-center hover:bg-ancient-gold/80 transition-colors">
                        <i class="fas fa-volume-up text-white text-lg"></i>
                    </button>
                    <button onclick="collectPoem(${poem.id})" class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                        <i class="far fa-heart text-white text-lg"></i>
                    </button>
                </div>
            </div>
            <div class="flex space-x-2">
                <span class="px-3 py-1 bg-white/20 rounded-full text-sm">${poem.category}</span>
                <span class="px-3 py-1 bg-white/20 rounded-full text-sm">${poem.grade}</span>
            </div>
        </div>

        <div class="p-6">
            <div class="mb-6 p-4 bg-ancient-paper/50 rounded-xl">
                <h3 class="text-ancient-dark font-semibold mb-3">
                    <i class="fas fa-book-open text-ancient-gold mr-2"></i>原文
                </h3>
                <div class="text-center py-4">
                    ${pinyinContent}
                </div>
            </div>

            <div class="mb-6">
                <button onclick="toggleSection('translation')" class="w-full flex items-center justify-between p-4 bg-ancient-paper/30 rounded-xl hover:bg-ancient-paper/50 transition-colors">
                    <span class="flex items-center text-ancient-dark font-semibold">
                        <i class="fas fa-language text-ancient-gold mr-2"></i>译文与注释
                    </span>
                    <i class="fas fa-chevron-down text-ancient-brown transition-transform" id="translationIcon"></i>
                </button>
                <div id="translationSection" class="hidden p-4 bg-ancient-paper/30 rounded-xl mt-2">
                    <h4 class="text-ancient-dark font-semibold mb-2">译文</h4>
                    <p class="text-ancient-dark/80 leading-relaxed mb-4">${poem.translation}</p>
                    <h4 class="text-ancient-dark font-semibold mb-2">注释</h4>
                    <p class="text-ancient-dark/80 leading-relaxed">${poem.annotation}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <button onclick="createFromPoem(${poem.id})" class="btn-ancient py-3 rounded-xl font-semibold">
                    <i class="fas fa-paint-brush mr-2"></i>创作绘本
                </button>
                <button onclick="sharePoem(${poem.id})" class="bg-ancient-paper border-2 border-ancient-gold text-ancient-dark py-3 rounded-xl font-semibold hover:bg-ancient-gold/10 transition-all">
                    <i class="fas fa-share-alt mr-2"></i>分享
                </button>
            </div>
        </div>
    `;
}

function toggleSection(sectionId) {
    const section = document.getElementById(`${sectionId}Section`);
    const icon = document.getElementById(`${sectionId}Icon`);
    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
    } else {
        section.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
    }
}

// ==================== 音频播放 ====================
let currentAudio = null;

function playAudio(url) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    // 由于是演示，使用浏览器内置的语音合成
    if ('speechSynthesis' in window && state.currentPoem) {
        const utterance = new SpeechSynthesisUtterance(state.currentPoem.content);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
        showToast('正在朗读...', 'info');
    } else {
        showToast('音频播放功能准备中', 'info');
    }
}

// ==================== 分类筛选 ====================
async function loadCategories() {
    const result = await API.getCategories();
    if (result.success) {
        state.categories = result.data;
    }
}

function showCategoryModal(type) {
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');
    const options = document.getElementById('categoryOptions');

    let items = [];
    let filterKey = '';

    switch(type) {
        case 'dynasty':
            title.textContent = '选择朝代';
            items = state.categories.dynasties;
            filterKey = 'dynasty';
            break;
        case 'theme':
            title.textContent = '选择主题';
            items = state.categories.categories;
            filterKey = 'category';
            break;
        case 'grade':
            title.textContent = '选择年级';
            items = state.categories.grades;
            filterKey = 'grade';
            break;
    }

    state.activeFilter = filterKey;

    const icons = {
        dynasty: 'fa-landmark',
        category: 'fa-tag',
        grade: 'fa-graduation-cap'
    };

    options.innerHTML = items.map(item => `
        <button onclick="applyFilter('${filterKey}', '${item}')" class="p-4 bg-ancient-paper/50 rounded-xl border border-ancient-gold/20 hover:border-ancient-gold hover:bg-ancient-gold/10 transition-all text-center">
            <i class="fas ${icons[type.replace('dynasty', 'dynasty').replace('theme', 'category').replace('grade', 'grade')]} text-ancient-gold mb-2"></i>
            <p class="text-sm text-ancient-dark">${item}</p>
        </button>
    `).join('');

    modal.classList.remove('hidden');
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.add('hidden');
}

function applyFilter(key, value) {
    closeCategoryModal();
    loadPoems({ [key]: value });
    showFilterSection(key, value);
}

function showFilterSection(key, value) {
    const section = document.getElementById('filterSection');
    const title = document.getElementById('filterTitle');
    const options = document.getElementById('filterOptions');

    const keyNames = {
        dynasty: '朝代',
        category: '主题',
        grade: '年级'
    };

    title.textContent = `筛选: ${keyNames[key]}`;
    options.innerHTML = `
        <span class="px-3 py-1 bg-ancient-gold/20 text-ancient-dark rounded-full flex items-center">
            ${value}
            <button onclick="clearFilter()" class="ml-2 text-ancient-brown hover:text-ancient-vermilion">
                <i class="fas fa-times"></i>
            </button>
        </span>
    `;
    section.classList.remove('hidden');
}

function clearFilter() {
    document.getElementById('filterSection').classList.add('hidden');
    loadPoems();
}

// ==================== AI 创作 ====================
function selectStyle(style) {
    state.selectedStyle = style;
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.classList.remove('active', 'border-ancient-gold', 'bg-ancient-gold/10', 'text-ancient-dark');
        btn.classList.add('border-ancient-gold/30', 'text-ancient-brown');
    });
    const activeBtn = document.querySelector(`.style-btn[data-style="${style}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'border-ancient-gold', 'bg-ancient-gold/10', 'text-ancient-dark');
        activeBtn.classList.remove('border-ancient-gold/30', 'text-ancient-brown');
    }
}

async function generateImage() {
    const poetry = document.getElementById('poetryInput').value.trim();

    if (!poetry) {
        showToast('请输入诗词内容', 'error');
        return;
    }

    // 显示结果区域和加载状态
    document.getElementById('generateResult').classList.remove('hidden');
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('resultImages').classList.add('hidden');

    // 模拟加载提示
    const tips = [
        '正在解析诗词意境...',
        'AI正在构思画面...',
        '渲染水墨效果中...',
        '生成最终图像...'
    ];
    let tipIndex = 0;
    const tipInterval = setInterval(() => {
        tipIndex = (tipIndex + 1) % tips.length;
        document.getElementById('loadingTip').textContent = tips[tipIndex];
    }, 2000);

    const result = await API.generateImage(poetry, state.selectedStyle);
    clearInterval(tipInterval);

    if (result.success) {
        state.generatedImages = result.data.images;
        showGeneratedImages(result.data.images);
    } else {
        showToast(result.message || '生成失败，请重试', 'error');
        document.getElementById('generateResult').classList.add('hidden');
    }
}

function showGeneratedImages(images) {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('resultImages').classList.remove('hidden');

    const grid = document.getElementById('imageGrid');
    grid.innerHTML = images.map((img, index) => `
        <div class="relative rounded-xl overflow-hidden bg-gradient-to-br from-ancient-ink to-ancient-dark aspect-[4/3] flex items-center justify-center">
            <div class="text-center text-white">
                <i class="fas fa-image text-4xl mb-2 text-ancient-gold/50"></i>
                <p class="text-sm text-white/70">绘本 ${index + 1}</p>
                <p class="text-xs text-white/50 mt-1">AI生成效果预览</p>
            </div>
        </div>
    `).join('');
}

function createFromPoem(poemId) {
    const poem = state.poems.find(p => p.id === poemId) || state.currentPoem;
    if (poem) {
        document.getElementById('poetryInput').value = poem.content;
        switchPage('create');
    }
}

// ==================== 画廊 ====================
async function loadGallery() {
    const result = await API.getWorks();
    if (result.success) {
        renderGallery(result.data);
    }
}

function renderGallery(works) {
    const container = document.getElementById('galleryList');
    container.innerHTML = works.map(work => `
        <div class="bg-white rounded-xl overflow-hidden shadow-md card-hover">
            <div class="aspect-square bg-gradient-to-br from-ancient-ink to-ancient-dark flex items-center justify-center">
                <div class="text-center text-white">
                    <i class="fas fa-image text-3xl mb-2 text-ancient-gold/50"></i>
                    <p class="text-xs text-white/70">${work.style}</p>
                </div>
            </div>
            <div class="p-3">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-semibold text-ancient-dark">${work.poem_title}</span>
                    <span class="text-xs px-2 py-1 bg-ancient-gold/20 text-ancient-gold rounded-full">${work.style}</span>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="w-6 h-6 bg-ancient-gold rounded-full flex items-center justify-center mr-2">
                            <i class="fas fa-user text-white text-xs"></i>
                        </div>
                        <span class="text-xs text-ancient-brown">${work.username}</span>
                    </div>
                    <button onclick="likeWork(${work.id})" class="flex items-center text-ancient-vermilion hover:text-ancient-vermilion/70">
                        <i class="far fa-heart mr-1"></i>
                        <span class="text-xs">${work.likes}</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function likeWork(workId) {
    if (!state.isLoggedIn) {
        showLoginModal();
        return;
    }
    const result = await API.likeWork(workId);
    if (result.success) {
        loadGallery();
        showToast('点赞成功', 'success');
    }
}

// ==================== 个人中心 ====================
async function loadProfile() {
    const result = await API.getProfile();
    if (result.success) {
        renderProfile(result.data);
    }
}

function renderProfile(profile) {
    document.getElementById('username').textContent = profile.username;
    document.getElementById('statWorks').textContent = profile.total_works;
    document.getElementById('statLikes').textContent = profile.total_likes;
    document.getElementById('statCollected').textContent = profile.collected_poems.length;
}

// ==================== 登录相关 ====================
function showLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
}

function handleLogin() {
    // 模拟登录
    state.isLoggedIn = true;
    closeLoginModal();
    showToast('登录成功', 'success');
}

function collectPoem(poemId) {
    if (!state.isLoggedIn) {
        showLoginModal();
        return;
    }
    showToast('收藏成功', 'success');
}

function sharePoem(poemId) {
    showToast('分享功能开发中', 'info');
}

// ==================== 发布作品 ====================
async function publishWork() {
    if (!state.isLoggedIn) {
        showLoginModal();
        return;
    }

    if (state.generatedImages.length === 0) {
        showToast('请先生成绘本', 'error');
        return;
    }

    const result = await API.publishWork({
        user_id: 1,
        poem_id: state.currentPoem?.id,
        poem_title: state.currentPoem?.title || '自由创作',
        image_url: state.generatedImages[0],
        style: state.selectedStyle
    });

    if (result.success) {
        showToast('作品已发布到画廊', 'success');
    }
}

// ==================== 搜索 ====================
function handleSearch() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (keyword) {
        loadPoems({ keyword });
    } else {
        loadPoems();
    }
}

// ==================== Toast 提示 ====================
function showToast(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    const toast = document.createElement('div');
    toast.className = `fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 ${colors[type]} text-white rounded-full shadow-lg z-[200] animate-bounce`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// ==================== 事件绑定 ====================
document.addEventListener('DOMContentLoaded', async () => {
    // 加载初始数据
    await loadCategories();
    await loadPoems();

    // 导航栏点击事件
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            // 检查是否需要登录
            if ((page === 'profile') && !state.isLoggedIn) {
                showLoginModal();
                return;
            }
            switchPage(page);
        });
    });

    // 分类按钮
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            if (category === 'random') {
                // 随机推荐
                const randomPoem = state.poems[Math.floor(Math.random() * state.poems.length)];
                if (randomPoem) {
                    showPoemDetail(randomPoem.id);
                }
            } else {
                showCategoryModal(category);
            }
        });
    });

    // 返回按钮
    document.getElementById('backToList').addEventListener('click', () => {
        switchPage('home');
    });

    // 搜索
    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // 风格选择
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectStyle(btn.dataset.style);
        });
    });

    // 生成按钮
    document.getElementById('generateBtn').addEventListener('click', generateImage);

    // 发布作品
    document.getElementById('publishWork').addEventListener('click', publishWork);

    // 重新生成
    document.getElementById('regenerate').addEventListener('click', generateImage);

    // 用户按钮
    document.getElementById('userBtn').addEventListener('click', () => {
        if (state.isLoggedIn) {
            switchPage('profile');
        } else {
            showLoginModal();
        }
    });
});
