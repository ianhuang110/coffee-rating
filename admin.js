import "./firebase-db.js";

let users = [];
let allReviews = [];
let chartInstances = {};

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
        const [usersData, reviewsData] = await Promise.all([
            window.firebaseDB.getAllUsers(),
            window.firebaseDB.getAllReviews()
        ]);
        
        users = usersData;
        allReviews = reviewsData;
        
        document.getElementById('user-count').textContent = users.length;
        document.getElementById('users-loading').style.display = 'none';
        
        renderUserList();
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
        li.innerHTML = `
            <div class="user-name">${user.name}</div>
            <div class="user-email">${user.email}</div>
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
                <div class="review-text">${review.text}</div>
                <div class="review-score-badge">總評: ${review.userAvg || review.avg || '?'} / 10</div>
            </div>
            <div class="review-chart">
                <canvas id="${canvasId}"></canvas>
            </div>
        `;
        container.appendChild(card);
        
        // 繪製雷達圖
        if (review.stats) {
            drawRadarChart(canvasId, coffeeName, review.stats);
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
