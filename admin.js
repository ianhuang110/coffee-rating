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

const coffeeData = [
  {
    cafe: "Simple Kaffa 興波咖啡",
    coffees: [
      { id: "t1", name: "巴拿馬 翡翠莊園 藝伎 (水洗)" },
      { id: "t2", name: "衣索比亞 谷吉 罕貝拉 (日曬)" }
    ]
  },
  {
    cafe: "Fika Fika Cafe",
    coffees: [
      { id: "t3", name: "肯亞 冽里 AA (水洗)" },
      { id: "t4", name: "哥斯大黎加 塔拉珠 (蜜處理)" }
    ]
  },
  {
    cafe: "豆舖咖啡館",
    coffees: [
      { id: "p1", name: "衣索比亞 耶加雪菲 (日曬)" },
      { id: "p2", name: "衣索比亞 谷吉 罕貝拉" },
      { id: "p3", name: "印尼 蘇門答臘 曼特寧" },
      { id: "p4", name: "巴拿馬 藝伎 (水洗)" },
      { id: "p5", name: "哥倫比亞 粉紅波旁" },
      { id: "p6", name: "瓜地馬拉 花神" },
      { id: "p7", name: "肯亞 AA" },
      { id: "p8", name: "牙買加 藍山" }
    ]
  },
  {
    cafe: "SIDRA 栖爪咖啡",
    coffees: [
      { id: "s1", name: "哥倫比亞 玫瑰谷 (雙重厭氧)" },
      { id: "s2", name: "哥斯大黎加 音樂家系列 (莫札特)" },
      { id: "s3", name: "衣索比亞 西達摩" },
      { id: "s4", name: "蒲隆地 單一莊園" },
      { id: "s5", name: "薩爾瓦多 帕卡瑪拉" }
    ]
  },
  {
    cafe: "ML coffee 慕光咖啡工作室",
    coffees: [
      { id: "ml1", name: "台灣 阿里山特等獎得獎豆" },
      { id: "ml2", name: "衣索比亞 耶加雪菲 (G1)" },
      { id: "ml3", name: "宏都拉斯 單一莊園微批次" }
    ]
  },
  {
    cafe: "Jo's Corner Café",
    coffees: [
      { id: "jc1", name: "哥斯大黎加 塔拉珠" },
      { id: "jc2", name: "巴西 喜拉朵 (Cerrado)" },
      { id: "jc3", name: "肯亞 AB" },
      { id: "jc4", name: "衣索比亞 水洗" }
    ]
  },
  {
    cafe: "著手咖啡 Coffee Intro (中壢內壢店)",
    coffees: [
      { id: "in1", name: "衣索比亞 罕貝拉 (淺焙)" },
      { id: "in2", name: "哥倫比亞 薇拉 (中深焙)" },
      { id: "in3", name: "印尼 蘇門答臘 塔瓦湖" }
    ]
  },
  {
    cafe: "拾事咖啡 SEIZE THE DAY",
    coffees: [
      { id: "st1", name: "瓜地馬拉 薇薇特南果" },
      { id: "st2", name: "哥斯大黎加 黑蜜處理" },
      { id: "st3", name: "衣索比亞 日曬原生種" }
    ]
  },
  {
    cafe: "暖空咖啡 Warm air Kafe",
    coffees: [
      { id: "wa1", name: "哥倫比亞 厭氧發酵處理" },
      { id: "wa2", name: "肯亞 涅里" }
    ]
  },
  {
    cafe: "墨咖啡 Ink Coffee",
    coffees: [
      { id: "h1", name: "薩爾瓦多 庇護所莊園 (半洗)" },
      { id: "h2", name: "哥斯大黎加 鑽石山 (黑蜜)" }
    ]
  },
  {
    cafe: "The Factory Mojocoffee",
    coffees: [
      { id: "m1", name: "瓜地馬拉 安提瓜 (水洗)" },
      { id: "m2", name: "薩爾瓦多 帕卡瑪拉 (蜜處理)" }
    ]
  },
  {
    cafe: "著手咖啡 Coffee Intro",
    coffees: [
      { id: "i1", name: "宏都拉斯 單一莊園 (水洗)" },
      { id: "i2", name: "台灣 阿里山 卓武山 (蜜處理)" }
    ]
  },
  {
    cafe: "存憶 Cafe Bar",
    coffees: [
      { id: "c1", name: "葉門 摩卡 馬塔利" },
      { id: "c2", name: "巴西 喜拉朵 (日曬)" }
    ]
  },
  {
    cafe: "馤咖啡。食作",
    coffees: [
      { id: "k1", name: "盧安達 穆莎莎 (水洗)" },
      { id: "k2", name: "祕魯 查卡馬 (水洗)" }
    ]
  }
];

function getCoffeeNameById(coffeeId) {
    for (const store of coffeeData) {
        for (const coffee of store.coffees) {
            if (coffee.id === coffeeId) {
                return coffee.name;
            }
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
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    pointLabels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: { size: 12 }
                    },
                    ticks: {
                        display: false,
                        min: 0,
                        max: 5,
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
