import "./firebase-db.js";

let users = [];
let allReviews = [];
let chartInstances = {};
let allSuggestions = [];
let currentView = 'users';

async function initAdmin() {
    let retryCount = 0;
    while (!window.firebaseDB && retryCount < 20) {
        await new Promise(resolve => setTimeout(resolve, 50));
        retryCount++;
    }

    if (!window.firebaseDB) {
        document.getElementById('users-loading').textContent = '載入資料庫失敗';
        return;
    }

    // 載入所有資料
    document.getElementById('users-loading').style.display = 'block';
    
    try {
        const [usersData, reviewsData, suggestionsData] = await Promise.all([
            window.firebaseDB.getAllUsers(),
            window.firebaseDB.getAllReviews(),
            window.firebaseDB.getAllSuggestions ? window.firebaseDB.getAllSuggestions() : Promise.resolve([])
        ]);
        
        users = usersData;
        allReviews = reviewsData;
        allSuggestions = suggestionsData;
        
        document.getElementById('user-count').textContent = users.length;
        document.getElementById('users-loading').style.display = 'none';
        
        renderUserList();
        renderSuggestionList();
        
        // 綁定視圖切換事件
        const viewSelector = document.getElementById('view-selector');
        if (viewSelector) {
            viewSelector.addEventListener('change', (e) => {
                currentView = e.target.value;
                document.getElementById('empty-state').style.display = 'flex';
                document.getElementById('user-details-view').style.display = 'none';
                document.getElementById('suggestion-details-view').style.display = 'none';
                
                if (currentView === 'users') {
                    document.getElementById('user-list').style.display = 'block';
                    document.getElementById('suggestion-list').style.display = 'none';
                    document.getElementById('sidebar-title').textContent = '會員列表';
                    document.getElementById('user-count').textContent = users.length;
                } else {
                    document.getElementById('user-list').style.display = 'none';
                    document.getElementById('suggestion-list').style.display = 'block';
                    document.getElementById('sidebar-title').textContent = '回報與建議';
                    document.getElementById('user-count').textContent = allSuggestions.length;
                }
            });
        }
    } catch(e) {
        console.error(e);
        document.getElementById('users-loading').textContent = '資料載入發生錯誤';
    }
}

function renderUserList() {
    const listEl = document.getElementById('user-list');
    listEl.innerHTML = '';
    
    if (users.length === 0) {
        listEl.innerHTML = '<li style="padding: 20px; color: #888; text-align: center;">無會員資料</li>';
        return;
    }
    
    users.forEach(user => {
        const li = document.createElement('li');
        li.className = 'user-item';
        
        // 計算該會員的評論數
        const userReviewCount = allReviews.filter(r => r.user === user.name).length;
        
        li.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="overflow:hidden;">
                    <div class="user-name" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${user.name}</div>
                    <div class="user-email" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${user.email}</div>
                </div>
                ${userReviewCount > 0 
                    ? `<div style="background:var(--accent-gold); color:#000; padding:3px 8px; border-radius:12px; font-size:0.8rem; font-weight:bold; white-space:nowrap; margin-left:10px;">${userReviewCount} 留言</div>` 
                    : `<div style="background:#333; color:#888; padding:3px 8px; border-radius:12px; font-size:0.8rem; white-space:nowrap; margin-left:10px;">無留言</div>`}
            </div>
        `;
        li.addEventListener('click', () => {
            document.querySelectorAll('.user-item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            showUserDetails(user);
        });
        listEl.appendChild(li);
    });
}

function showUserDetails(user) {
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('suggestion-details-view').style.display = 'none';
    const detailView = document.getElementById('user-details-view');
    detailView.style.display = 'block';
    
    document.getElementById('detail-name').textContent = user.name;
    document.getElementById('detail-email').textContent = user.email;
    document.getElementById('detail-phone').textContent = `Phone: ${user.phone}`;
    document.getElementById('detail-avatar').textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    
    // 過濾此使用者的評論 (基於 userName 比對)
    const userReviews = allReviews.filter(r => r.user === user.name);
    
    document.getElementById('review-count').textContent = userReviews.length;
    renderUserReviews(userReviews);
}

function renderUserReviews(userReviews) {
    const container = document.getElementById('reviews-container');
    container.innerHTML = '';
    
    // 清除舊圖表實例
    Object.keys(chartInstances).forEach(id => {
        if(chartInstances[id]) chartInstances[id].destroy();
    });
    chartInstances = {};
    
    if (userReviews.length === 0) {
        container.innerHTML = '<div style="color: #888; text-align: center; padding: 40px; background: #1a1a1a; border-radius: 8px;">此會員目前沒有留下任何評論。</div>';
        return;
    }
    
    userReviews.forEach((review, index) => {
        const canvasId = `radar-${review.id || index}`;
        
        const card = document.createElement('div');
        card.className = 'review-card';
        
        const coffeeName = getCoffeeNameById(review.coffeeId) || '未知單品咖啡';
        
        card.innerHTML = `
            <div class="review-details">
                <div class="review-header">
                    <div class="review-coffee-name">${coffeeName}</div>
                    <div class="review-date">${review.date}</div>
                </div>
                <div class="review-text" id="text-${review.id}">${review.text}</div>
                <div class="review-reply" id="reply-${review.id}" style="background:#222; padding:8px; margin-top:8px; border-radius:4px; font-size:0.9rem; color:#aaa; display: ${review.reply ? 'block' : 'none'};">
                    <strong style="color:var(--accent-gold);">管理員回覆：</strong> <span>${review.reply || ''}</span>
                </div>
                <div class="review-score-badge">總評: ${review.userAvg || review.avg || '?'} / 10</div>
                <div class="review-actions" style="margin-top: 15px; display: flex; gap: 8px;">
                    <button class="btn-edit" style="background:#444; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">編輯評論</button>
                    <button class="btn-reply" style="background:#1a4a1a; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">回覆留言</button>
                    <button class="btn-delete" style="background:#5a1a1a; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">刪除</button>
                </div>
            </div>
            <div class="review-chart">
                <canvas id="${canvasId}"></canvas>
            </div>
        `;
        
        // 綁定按鈕事件
        const btnEdit = card.querySelector('.btn-edit');
        const btnReply = card.querySelector('.btn-reply');
        const btnDelete = card.querySelector('.btn-delete');
        
        btnEdit.addEventListener('click', async () => {
            const newText = prompt('編輯評論內容:', review.text);
            if (newText !== null && newText.trim() !== '') {
                const success = await window.firebaseDB.updateReview(review.id, newText.trim());
                if (success) {
                    review.text = newText.trim();
                    card.querySelector(`#text-${review.id}`).textContent = review.text;
                    alert('編輯成功！');
                } else {
                    alert('編輯失敗。');
                }
            }
        });
        
        btnReply.addEventListener('click', async () => {
            const newReply = prompt('請輸入您的回覆 (留空將清除回覆):', review.reply || '');
            if (newReply !== null) {
                const success = await window.firebaseDB.replyToReview(review.id, newReply.trim());
                if (success) {
                    review.reply = newReply.trim();
                    const replyDiv = card.querySelector(`#reply-${review.id}`);
                    if (review.reply) {
                        replyDiv.style.display = 'block';
                        replyDiv.querySelector('span').textContent = review.reply;
                    } else {
                        replyDiv.style.display = 'none';
                    }
                    alert('回覆已更新！');
                } else {
                    alert('回覆更新失敗。');
                }
            }
        });
        
        btnDelete.addEventListener('click', async () => {
            if (confirm('確定要刪除這則評論嗎？這將無法復原。')) {
                const success = await window.firebaseDB.deleteReview(review.id);
                if (success) {
                    alert('評論已刪除。');
                    // 從 allReviews 中移除並重新渲染
                    allReviews = allReviews.filter(r => r.id !== review.id);
                    card.remove();
                    document.getElementById('review-count').textContent = allReviews.filter(r => r.user === review.user).length;
                } else {
                    alert('刪除失敗。');
                }
            }
        });

        container.appendChild(card);
        
        // 繪製雷達圖
        if (review.stats) {
            drawRadarChart(canvasId, coffeeName, review.stats);
        }
    });
}

function renderSuggestionList() {
    const listEl = document.getElementById('suggestion-list');
    listEl.innerHTML = '';
    
    if (allSuggestions.length === 0) {
        listEl.innerHTML = '<li style="padding: 20px; color: #888; text-align: center;">目前沒有任何回報</li>';
        return;
    }
    
    allSuggestions.forEach(sug => {
        const li = document.createElement('li');
        li.className = 'user-item';
        
        let statusText = '待處理';
        let statusColor = '#dc3545';
        if (sug.status === 'approved') {
            statusText = '已處理';
            statusColor = '#28a745';
        } else if (sug.status === 'rejected') {
            statusText = '已駁回';
            statusColor = '#6c757d';
        }
        
        const dateObj = new Date(sug.timestamp);
        const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;
        
        li.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="overflow:hidden;">
                    <div class="user-name" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${sug.coffeeName || '未知單品'}</div>
                    <div class="user-email" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">回報人：${sug.user || '未知'}</div>
                </div>
                <div style="background:${statusColor}; color:#fff; padding:3px 8px; border-radius:12px; font-size:0.8rem; font-weight:bold; white-space:nowrap; margin-left:10px;">${statusText}</div>
            </div>
        `;
        li.addEventListener('click', () => {
            document.querySelectorAll('#suggestion-list .user-item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            showSuggestionDetails(sug);
        });
        listEl.appendChild(li);
    });
}

function showSuggestionDetails(sug) {
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('user-details-view').style.display = 'none';
    const detailView = document.getElementById('suggestion-details-view');
    detailView.style.display = 'block';
    
    document.getElementById('sug-coffee-name').textContent = sug.coffeeName || '未知單品';
    document.getElementById('sug-user').textContent = sug.user || '未知';
    
    const dateObj = new Date(sug.timestamp);
    document.getElementById('sug-date').textContent = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')} ${String(dateObj.getHours()).padStart(2,'0')}:${String(dateObj.getMinutes()).padStart(2,'0')}`;
    
    document.getElementById('sug-text').textContent = sug.text;
    
    const badge = document.getElementById('sug-status-badge');
    const btnApprove = document.getElementById('btn-sug-approve');
    const btnReject = document.getElementById('btn-sug-reject');
    
    let currentSugStatus = sug.status || 'pending';
    
    function updateUI() {
        if (currentSugStatus === 'approved') {
            badge.textContent = '已處理';
            badge.style.background = '#28a745';
            btnApprove.style.display = 'none';
            btnReject.style.display = 'none';
        } else if (currentSugStatus === 'rejected') {
            badge.textContent = '已駁回';
            badge.style.background = '#6c757d';
            btnApprove.style.display = 'none';
            btnReject.style.display = 'none';
        } else {
            badge.textContent = '待處理';
            badge.style.background = '#dc3545';
            btnApprove.style.display = 'block';
            btnReject.style.display = 'block';
        }
    }
    
    updateUI();
    
    // 移除舊的 event listener
    const newBtnApprove = btnApprove.cloneNode(true);
    btnApprove.parentNode.replaceChild(newBtnApprove, btnApprove);
    const newBtnReject = btnReject.cloneNode(true);
    btnReject.parentNode.replaceChild(newBtnReject, btnReject);
    
    newBtnApprove.addEventListener('click', async () => {
        if (confirm('確定標示為「已處理」？\n（系統目前僅為紀錄狀態，需自行手動修改咖啡廳資料庫）')) {
            const success = await window.firebaseDB.updateSuggestionStatus(sug.id, 'approved');
            if (success) {
                currentSugStatus = 'approved';
                sug.status = 'approved';
                updateUI();
                renderSuggestionList();
            }
        }
    });
    
    newBtnReject.addEventListener('click', async () => {
        if (confirm('確定標示為「駁回」？')) {
            const success = await window.firebaseDB.updateSuggestionStatus(sug.id, 'rejected');
            if (success) {
                currentSugStatus = 'rejected';
                sug.status = 'rejected';
                updateUI();
                renderSuggestionList();
            }
        }
    });
}

const cafesInfo = {
    "Simple Kaffa 興波咖啡": {
        "location": "台北市"
    },
    "Fika Fika Cafe": {
        "location": "台北市"
    },
    "豆舖咖啡館": {
        "location": "桃園市"
    },
    "SIDRA 栖爪咖啡": {
        "location": "桃園市"
    },
    "ML coffee 慕光咖啡工作室": {
        "location": "桃園市"
    },
    "Jo's Corner Café": {
        "location": "桃園市"
    },
    "著手咖啡 Coffee Intro (中壢內壢店)": {
        "location": "桃園市"
    },
    "拾事咖啡 SEIZE THE DAY": {
        "location": "桃園市"
    },
    "暖空咖啡 Warm air Kafe": {
        "location": "桃園市"
    },
    "墨咖啡 Ink Coffee": {
        "location": "新竹市"
    },
    "The Factory Mojocoffee": {
        "location": "台中市"
    },
    "著手咖啡 Coffee Intro": {
        "location": "台中市"
    },
    "存憶 Cafe Bar": {
        "location": "台南市"
    },
    "馤咖啡。食作": {
        "location": "高雄市"
    }
};

const masterCoffees = [
    {
        "id": "t1",
        "name": "巴拿馬 翡翠莊園 藝伎 (水洗)",
        "desc": "世界冠軍級別的優雅茉莉花香、佛手柑與極致乾淨的口感。",
        "stats": [
            5,
            4,
            4.5,
            3,
            4.5
        ],
        "cafes": [
            "Simple Kaffa 興波咖啡",
            "豆舖咖啡館"
        ]
    },
    {
        "id": "t2",
        "name": "衣索比亞 谷吉 罕貝拉 (日曬)",
        "desc": "濃郁的草莓果醬、水蜜桃甜感與熱情奔放的熱帶水果香。",
        "stats": [
            4.5,
            3.5,
            4.5,
            3.5,
            4
        ],
        "cafes": [
            "Simple Kaffa 興波咖啡",
            "豆舖咖啡館",
            "著手咖啡 Coffee Intro (中壢內壢店)"
        ]
    },
    {
        "id": "t3",
        "name": "肯亞 冽里 AA (水洗)",
        "desc": "明亮的黑醋栗、小番茄風味，口感厚實醇淨。",
        "stats": [
            4,
            4.5,
            3.5,
            4,
            3.5
        ],
        "cafes": [
            "Fika Fika Cafe",
            "暖空咖啡 Warm air Kafe"
        ]
    },
    {
        "id": "t4",
        "name": "哥斯大黎加 塔拉珠 (蜜處理)",
        "desc": "柔和的榛果、烤蘋果與蜂蜜甜潤，相當平衡。",
        "stats": [
            3.5,
            2.5,
            4,
            3.5,
            3.5
        ],
        "cafes": [
            "Fika Fika Cafe",
            "Jo's Corner Café"
        ]
    },
    {
        "id": "p1",
        "name": "衣索比亞 耶加雪菲 (日曬)",
        "desc": "奔放的莓果香氣與柑橘酸質，口感乾淨清新。",
        "stats": [
            4.5,
            4,
            3.5,
            2.5,
            3.5
        ],
        "cafes": [
            "豆舖咖啡館",
            "ML coffee 慕光咖啡工作室"
        ]
    },
    {
        "id": "p3",
        "name": "印尼 蘇門答臘 曼特寧",
        "desc": "濃烈厚實的黑巧克力、草藥與木質調，幾乎無酸。",
        "stats": [
            3,
            1,
            2.5,
            5,
            4
        ],
        "cafes": [
            "豆舖咖啡館",
            "著手咖啡 Coffee Intro (中壢內壢店)"
        ]
    },
    {
        "id": "p5",
        "name": "哥倫比亞 粉紅波旁",
        "desc": "甜美櫻桃、覆盆子明亮酸值，乾淨多汁。",
        "stats": [
            4,
            4,
            4.5,
            3,
            4
        ],
        "cafes": [
            "豆舖咖啡館"
        ]
    },
    {
        "id": "p6",
        "name": "瓜地馬拉 花神",
        "desc": "經典細緻花香、烤核桃焦糖甜感。",
        "stats": [
            4,
            3,
            4,
            4,
            3.5
        ],
        "cafes": [
            "豆舖咖啡館",
            "The Factory Mojocoffee"
        ]
    },
    {
        "id": "p7",
        "name": "肯亞 AA",
        "desc": "渾厚的烏梅、小番茄風味，明亮酸質。",
        "stats": [
            4,
            4.5,
            3.5,
            4,
            3.5
        ],
        "cafes": [
            "豆舖咖啡館",
            "Jo's Corner Café"
        ]
    },
    {
        "id": "p8",
        "name": "牙買加 藍山",
        "desc": "極致平衡，溫和的堅果、可可甜與無負擔的滑順口感。",
        "stats": [
            4,
            2,
            4.5,
            3.5,
            4.5
        ],
        "cafes": [
            "豆舖咖啡館"
        ]
    },
    {
        "id": "s1",
        "name": "哥倫比亞 玫瑰谷 (雙重厭氧)",
        "desc": "極度張揚的水蜜桃、草莓乳酸與馥郁的玫瑰花香。",
        "stats": [
            5,
            3.5,
            4.5,
            3,
            4
        ],
        "cafes": [
            "SIDRA 栖爪咖啡"
        ]
    },
    {
        "id": "s2",
        "name": "哥斯大黎加 音樂家系列 (莫札特)",
        "desc": "玫瑰花、草莓果醬、甚至有些微酒香發酵味。",
        "stats": [
            4.5,
            3,
            4.5,
            3.5,
            4
        ],
        "cafes": [
            "SIDRA 栖爪咖啡"
        ]
    },
    {
        "id": "s3",
        "name": "衣索比亞 西達摩",
        "desc": "優雅的白花香，柳橙與檸檬酸值。",
        "stats": [
            4,
            4,
            3.5,
            2.5,
            3.5
        ],
        "cafes": [
            "SIDRA 栖爪咖啡"
        ]
    },
    {
        "id": "s4",
        "name": "蒲隆地 單一莊園",
        "desc": "乾淨醇厚，帶有梅子、深色莓果的調性。",
        "stats": [
            3.5,
            3.5,
            4,
            4,
            3.5
        ],
        "cafes": [
            "SIDRA 栖爪咖啡"
        ]
    },
    {
        "id": "s5",
        "name": "薩爾瓦多 帕卡瑪拉",
        "desc": "奶油、太妃糖柔滑口感與無花果甜香。",
        "stats": [
            4,
            2.5,
            4.5,
            4,
            4
        ],
        "cafes": [
            "SIDRA 栖爪咖啡",
            "The Factory Mojocoffee"
        ]
    },
    {
        "id": "ml1",
        "name": "台灣 阿里山特等獎得獎豆",
        "desc": "獨特高山茶韻，帶有蜜香與細緻李子酸甜。",
        "stats": [
            4,
            3,
            4.5,
            3.5,
            4.5
        ],
        "cafes": [
            "ML coffee 慕光咖啡工作室",
            "著手咖啡 Coffee Intro"
        ]
    },
    {
        "id": "ml3",
        "name": "宏都拉斯 單一莊園微批次",
        "desc": "柳橙、堅果、鮮明的焦糖尾韻。",
        "stats": [
            3.5,
            3.5,
            4,
            3.5,
            3.5
        ],
        "cafes": [
            "ML coffee 慕光咖啡工作室",
            "著手咖啡 Coffee Intro"
        ]
    },
    {
        "id": "jc2",
        "name": "巴西 喜拉朵 (Cerrado)",
        "desc": "溫和低酸，充滿花生、核桃與淡淡的黑糖甜。",
        "stats": [
            3,
            1.5,
            4,
            4,
            3
        ],
        "cafes": [
            "Jo's Corner Café",
            "存憶 Cafe Bar"
        ]
    },
    {
        "id": "jc4",
        "name": "衣索比亞 水洗",
        "desc": "乾淨明亮的檸檬酸值與白花香氣。",
        "stats": [
            4,
            4,
            3.5,
            2.5,
            3.5
        ],
        "cafes": [
            "Jo's Corner Café"
        ]
    },
    {
        "id": "in2",
        "name": "哥倫比亞 薇拉 (中深焙)",
        "desc": "濃郁的黑巧克力、焦糖與厚實黏稠的口感。",
        "stats": [
            3,
            2,
            4,
            4.5,
            4
        ],
        "cafes": [
            "著手咖啡 Coffee Intro (中壢內壢店)"
        ]
    },
    {
        "id": "st1",
        "name": "瓜地馬拉 薇薇特南果",
        "desc": "柑橘酸值明亮，尾韻帶有深焙太妃糖甜感。",
        "stats": [
            3.5,
            3.5,
            4,
            3.5,
            3.5
        ],
        "cafes": [
            "拾事咖啡 SEIZE THE DAY"
        ]
    },
    {
        "id": "st2",
        "name": "哥斯大黎加 黑蜜處理",
        "desc": "深色莓果與葡萄乾氣息，糖漿般的濃郁。",
        "stats": [
            4,
            3,
            4.5,
            4.5,
            3.5
        ],
        "cafes": [
            "拾事咖啡 SEIZE THE DAY",
            "墨咖啡 Ink Coffee"
        ]
    },
    {
        "id": "st3",
        "name": "衣索比亞 日曬原生種",
        "desc": "豐富的熱帶水果與奔放的酒香感。",
        "stats": [
            4.5,
            4,
            4,
            3.5,
            4
        ],
        "cafes": [
            "拾事咖啡 SEIZE THE DAY"
        ]
    },
    {
        "id": "wa1",
        "name": "哥倫比亞 厭氧發酵處理",
        "desc": "帶著鮮明白酒香氣、肉桂與蘋果派的獨特風味。",
        "stats": [
            4.5,
            3.5,
            4,
            3.5,
            4
        ],
        "cafes": [
            "暖空咖啡 Warm air Kafe"
        ]
    },
    {
        "id": "h1",
        "name": "薩爾瓦多 庇護所莊園 (半洗)",
        "desc": "溫和流淌的杏仁、奶油口感，甜度極佳。",
        "stats": [
            3.5,
            2.5,
            4.5,
            4,
            4
        ],
        "cafes": [
            "墨咖啡 Ink Coffee"
        ]
    },
    {
        "id": "c1",
        "name": "葉門 摩卡 馬塔利",
        "desc": "傳統日曬的狂野香料、菸草、紅酒發酵氣息。",
        "stats": [
            4.5,
            3,
            3.5,
            4.5,
            4
        ],
        "cafes": [
            "存憶 Cafe Bar"
        ]
    },
    {
        "id": "k1",
        "name": "盧安達 穆莎莎 (水洗)",
        "desc": "花香、柑橘、紅茶感，整體輕盈乾淨。",
        "stats": [
            4,
            4,
            3.5,
            2.5,
            4
        ],
        "cafes": [
            "馤咖啡。食作"
        ]
    },
    {
        "id": "k2",
        "name": "祕魯 查卡馬 (水洗)",
        "desc": "紅蘋果明亮酸質，焦糖回甘與細緻柔和的口感。",
        "stats": [
            3.5,
            4,
            4,
            3,
            3.5
        ],
        "cafes": [
            "馤咖啡。食作"
        ]
    }
];



function getCoffeeNameById(coffeeId) {
    for (const coffee of masterCoffees) {
        if (coffee.id === coffeeId) {
            return coffee.name;
        }
    }
    return `Coffee ID: ${coffeeId}`;
}

function drawRadarChart(canvasId, label, stats) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['香氣', '酸度', '甜度', '厚實度', '餘韻'],
            datasets: [{
                label: label,
                data: stats,
                backgroundColor: 'rgba(207, 169, 104, 0.2)',
                borderColor: 'rgba(207, 169, 104, 1)',
                pointBackgroundColor: 'rgba(207, 169, 104, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(207, 169, 104, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 5,
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.2)' },
                    pointLabels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: { size: 12 }
                    },
                    ticks: {
                        display: false,
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // 在各別評論的圖表中，不需要顯示圖例，因上方已有標題
                }
            }
        }
    });
}

// 頁面載入後初始化
document.addEventListener('DOMContentLoaded', initAdmin);
