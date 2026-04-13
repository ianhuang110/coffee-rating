// 會員系統模擬
let currentUser = localStorage.getItem('coffee_user') || null;
let currentEmail = localStorage.getItem('coffee_email') || null;
let usersDB = JSON.parse(localStorage.getItem('coffee_users_db') || '{}');

function renderAuth() {
  const disp = document.getElementById('user-display');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const btnChangePwd = document.getElementById('btn-change-password');
  const reviewForm = document.getElementById('review-form');
  const loginPrompt = document.getElementById('login-prompt');
  
  if (currentUser) {
    disp.textContent = `歡迎，${currentUser}`;
    btnLogin.classList.add('hidden');
    btnLogout.classList.remove('hidden');
    if (btnChangePwd) btnChangePwd.classList.remove('hidden');
    if (reviewForm) reviewForm.style.display = 'flex';
    if (loginPrompt) loginPrompt.style.display = 'none';
  } else {
    disp.textContent = '';
    btnLogin.classList.remove('hidden');
    btnLogout.classList.add('hidden');
    if (btnChangePwd) btnChangePwd.classList.add('hidden');
    if (reviewForm) reviewForm.style.display = 'none';
    if (loginPrompt) loginPrompt.style.display = 'block';
  }
}

// 咖啡資料庫
const coffeeData = [
  // 台北市
  {
    cafe: "Simple Kaffa 興波咖啡",
    location: "台北市",
    coffees: [
      { id: "t1", name: "巴拿馬 翡翠莊園 藝伎 (水洗)", desc: "世界冠軍級別的優雅茉莉花香、佛手柑與極致乾淨的口感。", stats: [5, 4, 4.5, 3, 4.5] },
      { id: "t2", name: "衣索比亞 谷吉 罕貝拉 (日曬)", desc: "濃郁的草莓果醬、水蜜桃甜感與熱情奔放的熱帶水果香。", stats: [4.5, 3.5, 4.5, 3.5, 4] }
    ]
  },
  {
    cafe: "Fika Fika Cafe",
    location: "台北市",
    coffees: [
      { id: "t3", name: "肯亞 冽里 AA (水洗)", desc: "明亮的黑醋栗、小番茄風味，口感厚實醇淨。", stats: [4, 4.5, 3.5, 4, 3.5] },
      { id: "t4", name: "哥斯大黎加 塔拉珠 (蜜處理)", desc: "柔和的榛果、烤蘋果與蜂蜜甜潤，相當平衡。", stats: [3.5, 2.5, 4, 3.5, 3.5] }
    ]
  },
  // 桃園市
  {
    cafe: "豆舖咖啡館",
    location: "桃園市",
    coffees: [
      { id: "p1", name: "衣索比亞 耶加雪菲 (日曬)", desc: "奔放的莓果香氣與柑橘酸質，口感乾淨清新。", stats: [4.5, 4, 3.5, 2.5, 3.5] },
      { id: "p2", name: "衣索比亞 谷吉 罕貝拉", desc: "草莓果醬、水蜜桃甜感與熱帶水果香。", stats: [4.5, 3.5, 4.5, 3.5, 4] },
      { id: "p3", name: "印尼 蘇門答臘 曼特寧", desc: "濃烈厚實的黑巧克力、草藥與木質調，幾乎無酸。", stats: [3, 1, 2.5, 5, 4] },
      { id: "p4", name: "巴拿馬 藝伎 (水洗)", desc: "優雅茉莉花香、佛手柑與極致乾淨的口感。", stats: [5, 4, 4.5, 3, 4.5] },
      { id: "p5", name: "哥倫比亞 粉紅波旁", desc: "甜美櫻桃、覆盆子明亮酸值，乾淨多汁。", stats: [4, 4, 4.5, 3, 4] },
      { id: "p6", name: "瓜地馬拉 花神", desc: "經典細緻花香、烤核桃焦糖甜感。", stats: [4, 3, 4, 4, 3.5] },
      { id: "p7", name: "肯亞 AA", desc: "渾厚的烏梅、小番茄風味，明亮酸質。", stats: [4, 4.5, 3.5, 4, 3.5] },
      { id: "p8", name: "牙買加 藍山", desc: "極致平衡，溫和的堅果、可可甜與無負擔的滑順口感。", stats: [4, 2, 4.5, 3.5, 4.5] }
    ]
  },
  {
    cafe: "SIDRA 栖爪咖啡",
    location: "桃園市",
    coffees: [
      { id: "s1", name: "哥倫比亞 玫瑰谷 (雙重厭氧)", desc: "極度張揚的水蜜桃、草莓乳酸與馥郁的玫瑰花香。", stats: [5, 3.5, 4.5, 3, 4] },
      { id: "s2", name: "哥斯大黎加 音樂家系列 (莫札特)", desc: "玫瑰花、草莓果醬、甚至有些微酒香發酵味。", stats: [4.5, 3, 4.5, 3.5, 4] },
      { id: "s3", name: "衣索比亞 西達摩", desc: "優雅的白花香，柳橙與檸檬酸值。", stats: [4, 4, 3.5, 2.5, 3.5] },
      { id: "s4", name: "蒲隆地 單一莊園", desc: "乾淨醇厚，帶有梅子、深色莓果的調性。", stats: [3.5, 3.5, 4, 4, 3.5] },
      { id: "s5", name: "薩爾瓦多 帕卡瑪拉", desc: "奶油、太妃糖柔滑口感與無花果甜香。", stats: [4, 2.5, 4.5, 4, 4] }
    ]
  },
  {
    cafe: "ML coffee 慕光咖啡工作室",
    location: "桃園市",
    coffees: [
      { id: "ml1", name: "台灣 阿里山特等獎得獎豆", desc: "獨特高山茶韻，帶有蜜香與細緻李子酸甜。", stats: [4, 3, 4.5, 3.5, 4.5] },
      { id: "ml2", name: "衣索比亞 耶加雪菲 (G1)", desc: "撲鼻的檸檬皮、茉莉花與淡雅蜂蜜甜感。", stats: [4.5, 4, 4, 2.5, 4] },
      { id: "ml3", name: "宏都拉斯 單一莊園微批次", desc: "柳橙、堅果、鮮明的焦糖尾韻。", stats: [3.5, 3.5, 4, 3.5, 3.5] }
    ]
  },
  {
    cafe: "Jo's Corner Café",
    location: "桃園市",
    coffees: [
      { id: "jc1", name: "哥斯大黎加 塔拉珠", desc: "柔和的榛果、烤蘋果與蜂蜜甜潤，相當平衡。", stats: [3.5, 2.5, 4, 3.5, 3.5] },
      { id: "jc2", name: "巴西 喜拉朵 (Cerrado)", desc: "溫和低酸，充滿花生、核桃與淡淡的黑糖甜。", stats: [3, 1.5, 4, 4, 3] },
      { id: "jc3", name: "肯亞 AB", desc: "明亮的黑醋栗、小番茄風味，口感厚實醇淨。", stats: [4, 4.5, 3.5, 4, 3.5] },
      { id: "jc4", name: "衣索比亞 水洗", desc: "乾淨明亮的檸檬酸值與白花香氣。", stats: [4, 4, 3.5, 2.5, 3.5] }
    ]
  },
  {
    cafe: "著手咖啡 Coffee Intro (中壢內壢店)",
    location: "桃園市",
    coffees: [
      { id: "in1", name: "衣索比亞 罕貝拉 (淺焙)", desc: "奔放的水蜜桃、草莓風味與伯爵茶香。", stats: [4.5, 3.5, 4, 3, 4] },
      { id: "in2", name: "哥倫比亞 薇拉 (中深焙)", desc: "濃郁的黑巧克力、焦糖與厚實黏稠的口感。", stats: [3, 2, 4, 4.5, 4] },
      { id: "in3", name: "印尼 蘇門答臘 塔瓦湖", desc: "經典曼特寧草本香料、黑巧克力微苦回甘。", stats: [3, 1, 3, 5, 4.5] }
    ]
  },
  {
    cafe: "拾事咖啡 SEIZE THE DAY",
    location: "桃園市",
    coffees: [
      { id: "st1", name: "瓜地馬拉 薇薇特南果", desc: "柑橘酸值明亮，尾韻帶有深焙太妃糖甜感。", stats: [3.5, 3.5, 4, 3.5, 3.5] },
      { id: "st2", name: "哥斯大黎加 黑蜜處理", desc: "深色莓果與葡萄乾氣息，糖漿般的濃郁。", stats: [4, 3, 4.5, 4.5, 3.5] },
      { id: "st3", name: "衣索比亞 日曬原生種", desc: "豐富的熱帶水果與奔放的酒香感。", stats: [4.5, 4, 4, 3.5, 4] }
    ]
  },
  {
    cafe: "暖空咖啡 Warm air Kafe",
    location: "桃園市",
    coffees: [
      { id: "wa1", name: "哥倫比亞 厭氧發酵處理", desc: "帶著鮮明白酒香氣、肉桂與蘋果派的獨特風味。", stats: [4.5, 3.5, 4, 3.5, 4] },
      { id: "wa2", name: "肯亞 涅里", desc: "經典黑醋栗、小番茄強烈酸值，洛神花尾韻。", stats: [4, 4.5, 3.5, 3.5, 4] }
    ]
  },
  // 新竹市
  {
    cafe: "墨咖啡 Ink Coffee",
    location: "新竹市",
    coffees: [
      { id: "h1", name: "薩爾瓦多 庇護所莊園 (半洗)", desc: "溫和流淌的杏仁、奶油口感，甜度極佳。", stats: [3.5, 2.5, 4.5, 4, 4] },
      { id: "h2", name: "哥斯大黎加 鑽石山 (黑蜜)", desc: "深色莓果與葡萄乾氣息，糖漿般的濃郁。", stats: [4, 3, 4.5, 4.5, 3.5] }
    ]
  },
  // 台中市
  {
    cafe: "The Factory Mojocoffee",
    location: "台中市",
    coffees: [
      { id: "m1", name: "瓜地馬拉 安提瓜 (水洗)", desc: "經典的烤核桃、巧克力與非常優雅平衡的酸甜。", stats: [3.5, 3, 4, 4, 3.5] },
      { id: "m2", name: "薩爾瓦多 帕卡瑪拉 (蜜處理)", desc: "太妃糖、無花果與綿密順滑的奶油油脂感。", stats: [4, 2.5, 4.5, 4, 4] }
    ]
  },
  {
    cafe: "著手咖啡 Coffee Intro",
    location: "台中市",
    coffees: [
      { id: "i1", name: "宏都拉斯 單一莊園 (水洗)", desc: "柳橙、堅果、鮮明的焦糖尾韻。", stats: [3.5, 3.5, 4, 3, 3.5] },
      { id: "i2", name: "台灣 阿里山 卓武山 (蜜處理)", desc: "獨特的高山烏龍茶香氣與李子酸甜。", stats: [4, 3, 4, 3.5, 4.5] }
    ]
  },
  // 台南市
  {
    cafe: "存憶 Cafe Bar",
    location: "台南市",
    coffees: [
      { id: "c1", name: "葉門 摩卡 馬塔利", desc: "傳統日曬的狂野香料、菸草、紅酒發酵氣息。", stats: [4.5, 3, 3.5, 4.5, 4] },
      { id: "c2", name: "巴西 喜拉朵 (日曬)", desc: "溫和低酸，充滿花生、核桃與淡淡的黑糖甜。", stats: [3, 1.5, 4, 3.5, 3] }
    ]
  },
  // 高雄市
  {
    cafe: "馤咖啡。食作",
    location: "高雄市",
    coffees: [
      { id: "k1", name: "盧安達 穆莎莎 (水洗)", desc: "花香、柑橘、紅茶感，整體輕盈乾淨。", stats: [4, 4, 3.5, 2.5, 4] },
      { id: "k2", name: "祕魯 查卡馬 (水洗)", desc: "紅蘋果明亮酸質，焦糖回甘與細緻柔和的口感。", stats: [3.5, 4, 4, 3, 3.5] }
    ]
  }
];

let currentChart = null;
let activeCoffeeId = null; 
let activeCoffeeObj = null;
let currentCoffeeStores = [];

// 原本地圖的地標變數可保留，若不需要也可刪除。這裡我們暫停使用。

// 客座評論的本地儲存機制 (使用 LocalStorage 模擬)
function getReviews(coffeeId) {
  const reviewsJson = localStorage.getItem(`coffee_reviews_${coffeeId}`);
  if (reviewsJson) {
    return JSON.parse(reviewsJson);
  } else {
    // 預設假資料
    return [
      { text: "這支豆子真的很有層次，推！", date: "2023-10-01", stats: [5, 4, 4, 3, 5], userAvg: "8" }
    ];
  }
}

function saveReview(coffeeId, text, stats, overallScore) {
  const reviews = getReviews(coffeeId);
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  
  const userName = currentUser ? currentUser : '訪客';
  reviews.push({ user: userName, text: text, date: dateStr, stats: stats, userAvg: overallScore });
  localStorage.setItem(`coffee_reviews_${coffeeId}`, JSON.stringify(reviews));
  renderReviews(coffeeId);
}

function renderReviews(coffeeId) {
  const reviewsContainer = document.getElementById('reviews-list');
  reviewsContainer.innerHTML = '';
  
  const reviews = getReviews(coffeeId);
  let dynamicStats = activeCoffeeObj ? activeCoffeeObj.stats.map(s => Math.round(s)) : [5,5,5,5,5];
  
  // 計算這支咖啡的平均總分與五感動態變化
  let topAvgScore = 0;
  if (reviews.length > 0 && activeCoffeeObj) {
    const sum = reviews.reduce((acc, r) => acc + parseFloat(r.userAvg || r.avg || 8), 0);
    topAvgScore = (sum / reviews.length).toFixed(1);
    document.getElementById('coffee-score').textContent = topAvgScore;
    
    // 計算動態五感分數 (基礎分數 + 所有評論星數加總) / (1 + reviews.length)
    for(let i=0; i<5; i++) {
        let axisTotal = activeCoffeeObj.stats[i] || 5;
        let validReviews = 0;
        for(let r of reviews) {
            if (r.stats && typeof r.stats[i] === 'number') {
                axisTotal += r.stats[i];
                validReviews++;
            }
        }
        dynamicStats[i] = Math.round(axisTotal / (1 + validReviews));
    }
    
  } else if (activeCoffeeObj) {
    // 沒評論時使用預設五感加總乘以2來當預設 10 分制評分
    topAvgScore = (activeCoffeeObj.stats.reduce((a,b)=>a+b,0) / 5 * 2).toFixed(1);
    document.getElementById('coffee-score').textContent = topAvgScore;
  }
  
  // 以動態五感驅動雷達圖
  if (activeCoffeeObj) {
     renderRadarChart(activeCoffeeObj.name, dynamicStats);
  }
  
  if (reviews.length === 0) {
    reviewsContainer.innerHTML = '<div class="review-item" style="color: #666; font-style: italic;">目前還沒有評論，成為第一個留下心得的人吧！</div>';
  } else {
    // 最新評論顯示在上方
    const reversed = [...reviews].reverse();
    reversed.forEach(r => {
      const item = document.createElement('div');
      item.className = 'review-item';
      
      let scoreHtml = '';
      if (r.stats) {
        const labels = ['香氣', '酸度', '甜度', '厚實度', '餘韻'];
        let gridHtml = '';
        labels.forEach((L, idx) => {
            let sVal = Math.round(r.stats[idx] || 0);
            sVal = Math.max(0, Math.min(5, sVal)); // 限制在 0-5
            let stars = '*'.repeat(sVal) + '<span style="color:#aaa;">' + '*'.repeat(5 - sVal) + '</span>';
            gridHtml += `<div class="rs-item"><span class="rs-label">${L}</span><div class="rs-val-text" style="font-size: 1.2rem; line-height: 1; margin-top: 2px;">${stars}</div></div>`;
        });
        
        let scoreToDisplay = r.userAvg || r.avg || '-';
        scoreHtml = `
          <div style="margin-bottom: 5px; display:flex; align-items:center;">
            <strong style="color:var(--accent-gold); font-size: 1.2rem; border: 1px solid var(--accent-gold); padding: 4px 10px; border-radius:4px; margin-right: 15px;">${scoreToDisplay} / 10</strong> 
          </div>
          <div class="review-stats-grid">
             ${gridHtml}
          </div>
        `;
      }
      
      const author = r.user ? r.user : '訪客';
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
          <strong style="color:#333; font-size:1.1rem; border-left: 3px solid var(--accent-gold); padding-left:8px;">${author}</strong>
          <span style="color:#888; font-size:0.85rem;">[${r.date}]</span>
        </div>
        <div style="font-size:1.05rem; color:#555; line-height: 1.6; margin-bottom: 15px;">${r.text}</div>
        <div style="border-top: 1px dashed #eee; padding-top: 12px;">
          <div style="font-size: 0.9rem; color: #888; margin-bottom: 8px;">您的評分紀錄:</div>
          ${scoreHtml}
        </div>
      `;
      reviewsContainer.appendChild(item);
    });
  }
}

// 初始化 DOM
document.addEventListener('DOMContentLoaded', () => {
    
  // 初始化 Auth UI
  renderAuth();
  
  document.getElementById('btn-login').addEventListener('click', () => {
    document.getElementById('login-modal').classList.remove('hidden');
  });
  
  const linkLogin = document.getElementById('link-login');
  if (linkLogin) {
    linkLogin.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-modal').classList.remove('hidden');
    });
  }
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('login-modal').classList.add('hidden');
  });
  document.getElementById('btn-submit-login').addEventListener('click', () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if(email && password) {
      const userRecord = usersDB[email];
      const validPwd = (typeof userRecord === 'string') ? userRecord : (userRecord ? userRecord.password : null);
      
      if (validPwd && validPwd === password) {
        currentUser = (typeof userRecord === 'object' && userRecord.name) ? userRecord.name : email.split('@')[0];
        currentEmail = email;
        localStorage.setItem('coffee_user', currentUser);
        localStorage.setItem('coffee_email', currentEmail);
        renderAuth();
        document.getElementById('login-modal').classList.add('hidden');
      } else {
        alert('Email 或密碼錯誤！（若還不是會員，請點選註冊）');
      }
    } else {
      alert('請輸入 Email 及密碼');
    }
  });
  const linkForgotPwd = document.getElementById('link-forgot-password');
  if (linkForgotPwd) {
    linkForgotPwd.addEventListener('click', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      if (!email) {
        alert('請先在上方輸入您的 Email，然後再點擊忘記密碼！');
        return;
      }
      if (!usersDB[email]) {
        alert('找不到此 Email 的註冊紀錄，請先註冊會員！');
        return;
      }

      const randomPwd = Math.random().toString(36).substring(2, 8);
      const userRecord = usersDB[email];
      if (typeof userRecord === 'object') {
        userRecord.password = randomPwd;
      } else {
        usersDB[email] = randomPwd; 
      }
      localStorage.setItem('coffee_users_db', JSON.stringify(usersDB));
      
      alert(`【系統模擬】密碼重置成功，新密碼已發送至 ${email}！\n\n您的新密碼為：${randomPwd}\n\n請使用此密碼登入，登入後請務必自行修改密碼。`);
      document.getElementById('login-password').value = randomPwd;
    });
  }


  const linkOpenRegister = document.getElementById('link-open-register');
  if (linkOpenRegister) {
    linkOpenRegister.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-modal').classList.add('hidden');
      document.getElementById('register-modal').classList.remove('hidden');
    });
  }

  const btnCloseRegModal = document.getElementById('btn-close-reg-modal');
  if (btnCloseRegModal) {
    btnCloseRegModal.addEventListener('click', () => {
      document.getElementById('register-modal').classList.add('hidden');
    });
  }

  const btnSubmitReg = document.getElementById('btn-submit-reg');
  if (btnSubmitReg) {
    btnSubmitReg.addEventListener('click', () => {
      const name = document.getElementById('reg-name').value.trim();
      const phone = document.getElementById('reg-phone').value.trim();
      const email = document.getElementById('reg-email').value.trim();

      if (!name || !phone || !email) {
        alert('請填寫完整姓名、電話與 Email！');
        return;
      }
      if (usersDB[email]) {
        alert('此 Email 已經註冊過囉，請直接使用密碼登入！');
        document.getElementById('register-modal').classList.add('hidden');
        document.getElementById('login-modal').classList.remove('hidden');
        document.getElementById('login-email').value = email;
        return;
      }

      const randomPwd = Math.random().toString(36).substring(2, 8);
      usersDB[email] = { name, phone, password: randomPwd };
      localStorage.setItem('coffee_users_db', JSON.stringify(usersDB));
      alert(`【系統模擬】註冊成功，密碼已發送至 ${email}！\n\n您的初始密碼為：${randomPwd}\n\n請使用此密碼登入，登入後請自行修改密碼。`);
      
      // 自動切換到登入 modal 並帶入參數
      document.getElementById('register-modal').classList.add('hidden');
      document.getElementById('login-modal').classList.remove('hidden');
      document.getElementById('login-email').value = email;
      document.getElementById('login-password').value = randomPwd;
    });
  }

  const btnChangePwdModal = document.getElementById('btn-change-password');
  if (btnChangePwdModal) {
    btnChangePwdModal.addEventListener('click', () => {
      document.getElementById('password-modal').classList.remove('hidden');
    });
  }
  
  const btnClosePwdModal = document.getElementById('btn-close-pwd-modal');
  if (btnClosePwdModal) {
    btnClosePwdModal.addEventListener('click', () => {
      document.getElementById('password-modal').classList.add('hidden');
    });
  }

  const btnSubmitPwd = document.getElementById('btn-submit-pwd');
  if (btnSubmitPwd) {
    btnSubmitPwd.addEventListener('click', () => {
      const newPwd = document.getElementById('new-password').value;
      if (newPwd && currentEmail) {
        usersDB[currentEmail] = newPwd;
        localStorage.setItem('coffee_users_db', JSON.stringify(usersDB));
        alert('密碼修改成功！下次請使用新密碼登入。');
        document.getElementById('password-modal').classList.add('hidden');
        document.getElementById('new-password').value = '';
      } else {
        alert('請輸入新密碼');
      }
    });
  }

  document.getElementById('btn-logout').addEventListener('click', () => {
    currentUser = null;
    currentEmail = null;
    localStorage.removeItem('coffee_user');
    localStorage.removeItem('coffee_email');
    renderAuth();
  });

  // Logo 回首頁功能
  const logoBtn = document.querySelector('.logo');
  if (logoBtn) {
    logoBtn.addEventListener('click', () => {
      // 隱藏詳細資訊
      const detailsCard = document.getElementById('coffee-details');
      if (detailsCard) detailsCard.classList.add('hidden');
      
      // 不再操作改名已移除的 placeholder
      
      // 回復地圖全螢幕視角與所有標記
      
      // 回復為空白狀態
      const placeholder = document.getElementById('welcome-placeholder');
      if (placeholder) placeholder.classList.remove('hidden');
      document.querySelectorAll('.coffee-item').forEach(el => el.classList.remove('active'));
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.value = '';
        renderCafeList(''); // 重新渲染回不展開的清單
      }
      
      activeCoffeeId = null;
      activeCoffeeObj = null;
      
      // 滾動回最上方（如果頁面有往下滾）
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const cafeListContainer = document.getElementById('cafe-list');
  const searchInput = document.getElementById('search-input');
  
  // Drawer sidebar logic
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  const btnCloseSidebar = document.getElementById('btn-close-sidebar');
  const sidebar = document.querySelector('.sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  function closeSidebar() {
      if(sidebar) sidebar.classList.remove('active');
      if(sidebarOverlay) sidebarOverlay.classList.remove('active');
  }
  window.closeSidebar = closeSidebar;

  if(btnToggleSidebar && sidebar && sidebarOverlay) {
      btnToggleSidebar.addEventListener('click', (e) => {
          e.stopPropagation();
          sidebar.classList.add('active');
          sidebarOverlay.classList.add('active');
      });
      sidebarOverlay.addEventListener('click', closeSidebar);
      if(btnCloseSidebar) {
          btnCloseSidebar.addEventListener('click', closeSidebar);
      }
  }

  // Topbar 搜尋按鈕開啟與關閉邏輯
  const btnTopSearch = document.getElementById('btn-topbar-search-icon');
  const topSearchPopup = document.getElementById('topbar-search-popup');
  if (btnTopSearch && topSearchPopup) {
    btnTopSearch.addEventListener('click', (e) => {
      e.stopPropagation();
      topSearchPopup.classList.toggle('hidden');
      if (!topSearchPopup.classList.contains('hidden')) {
        searchInput.focus();
      }
    });
    
    // 點擊空白處關閉搜尋方塊
    document.addEventListener('click', (e) => {
      if (!topSearchPopup.classList.contains('hidden') && !topSearchPopup.contains(e.target) && !btnTopSearch.contains(e.target)) {
        topSearchPopup.classList.add('hidden');
      }
    });
    // 點擊搜尋輸入框不會關閉
    topSearchPopup.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
  
  // 評論 Modal 開關
  const btnOpenReviews = document.getElementById('btn-open-reviews');
  if (btnOpenReviews) {
    btnOpenReviews.addEventListener('click', () => {
      document.getElementById('reviews-modal').classList.remove('hidden');
    });
  }
  const btnCloseReviews = document.getElementById('btn-close-reviews');
  if (btnCloseReviews) {
    btnCloseReviews.addEventListener('click', () => {
      document.getElementById('reviews-modal').classList.add('hidden');
    });
  }
  
  // 手機版詳細視窗關閉按鈕
  const btnCloseDetails = document.getElementById('btn-close-details');
  if (btnCloseDetails) {
    btnCloseDetails.addEventListener('click', () => {
      document.getElementById('coffee-details').classList.add('hidden');
      
      const placeholder = document.getElementById('welcome-placeholder');
      if (placeholder) placeholder.classList.remove('hidden');
      
      activeCoffeeId = null;
      activeCoffeeObj = null;
    });
  }
  
  const continentMap = {
    '非洲': ['衣索比亞', '肯亞', '盧安達', '蒲隆地'],
    '中南美洲': ['巴拿馬', '哥斯大黎加', '薩爾瓦多', '瓜地馬拉', '宏都拉斯', '巴西', '哥倫比亞', '祕魯', '牙買加'],
    '亞洲': ['印尼', '台灣', '葉門']
  };

  function getContinent(country) {
    for (let continent in continentMap) {
      if (continentMap[continent].includes(country)) return continent;
    }
    return '其他';
  }

  function renderCafeList(filterText = '') {
    cafeListContainer.innerHTML = '';
    const term = filterText.toLowerCase();

    // 將所有豆子打平放入一維陣列，並加上洲與國家的屬性
    let allCoffees = [];
    coffeeData.forEach(cafeObj => {
       cafeObj.coffees.forEach(c => {
           let country = c.name.split(' ')[0];
           allCoffees.push({
               ...c,
               country: country,
               continent: getContinent(country),
               cafeName: cafeObj.cafe,
               location: cafeObj.location
           });
       });
    });

    const matchedCoffees = allCoffees.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.desc.toLowerCase().includes(term) ||
      c.cafeName.toLowerCase().includes(term) ||
      c.country.toLowerCase().includes(term) ||
      c.continent.toLowerCase().includes(term)
    );

    // 進行分層群組化
    const grouped = {};
    matchedCoffees.forEach(c => {
      if (!grouped[c.continent]) grouped[c.continent] = {};
      if (!grouped[c.continent][c.country]) grouped[c.continent][c.country] = [];
      grouped[c.continent][c.country].push(c);
    });

    // 依序渲染（設定固定順序）
    const continentOrder = ['中南美洲', '非洲', '亞洲', '其他'];
    
    continentOrder.forEach(continent => {
      if (grouped[continent]) {
        // 洲 Header
        const contDiv = document.createElement('div');
        contDiv.className = 'continent-section';
        
        const contHeader = document.createElement('div');
        contHeader.className = (term) ? 'continent-header open' : 'continent-header';
        contHeader.textContent = continent;
        contDiv.appendChild(contHeader);
        
        const contBody = document.createElement('div');
        contBody.className = (term) ? 'continent-body open' : 'continent-body';
        contDiv.appendChild(contBody);
        
        contHeader.addEventListener('click', () => {
            contHeader.classList.toggle('open');
            contBody.classList.toggle('open');
        });

        const countries = Object.keys(grouped[continent]).sort();
        countries.forEach(country => {
          // 國家 Section
          const countryDiv = document.createElement('div');
          countryDiv.className = 'country-section';
          
          const countryHeader = document.createElement('div');
          // 當有搜尋條件時預設展開，否則預設收合
          countryHeader.className = (term) ? 'country-header open' : 'country-header';
          countryHeader.textContent = country;
          
          const countryList = document.createElement('div');
          countryList.className = (term) ? 'country-list open' : 'country-list';
          
          countryHeader.addEventListener('click', () => {
            countryHeader.classList.toggle('open');
            countryList.classList.toggle('open');
          });
          
          // 該國家下的各品項豆子
          grouped[continent][country].forEach(coffee => {
            const item = document.createElement('div');
            item.className = 'coffee-item flat-coffee-item hierarchical-item';
            
            let displayName = coffee.name;
            if (term && displayName.toLowerCase().includes(term)) {
                 const regex = new RegExp(`(${term})`, 'gi');
                 displayName = displayName.replace(regex, `<span style="color:var(--accent-gold); font-weight:bold;">$1</span>`);
            }

            item.innerHTML = `
              <div class="flat-name">${displayName}</div>
            `;

            item.dataset.id = coffee.id;
            // 保持選中項的可見性邏輯
            if (activeCoffeeId === coffee.id) {
                item.classList.add('active');
                if (!term) {
                    contHeader.classList.add('open');
                    contBody.classList.add('open');
                    countryHeader.classList.add('open');
                    countryList.classList.add('open');
                }
            }
            
            item.addEventListener('click', () => {
              document.querySelectorAll('.coffee-item').forEach(el => el.classList.remove('active'));
              item.classList.add('active');
              showCoffeeDetails(coffee.cafeName, coffee);
              
              if(window.closeSidebar) window.closeSidebar(); // auto close on mobile/drawer selection
              
              // 不再單純平移，這裡已經觸發了 showCoffeeDetails，由那邊負責篩選與縮放。
            });
            
            countryList.appendChild(item);
          });
          
          countryDiv.appendChild(countryHeader);
          countryDiv.appendChild(countryList);
          contBody.appendChild(countryDiv);
        });
        
        cafeListContainer.appendChild(contDiv);
      }
    });
  }

  function renderTop5Coffees() {
    const top5Grid = document.getElementById('top5-grid');
    if (!top5Grid) return;
    
    let allCoffees = [];
    coffeeData.forEach(cafeObj => {
       cafeObj.coffees.forEach(c => {
           let country = c.name.split(' ')[0];
           let baseScore = (c.stats.reduce((a,b)=>a+b,0) / 5 * 2).toFixed(1);
           allCoffees.push({
               ...c,
               country: country,
               cafeName: cafeObj.cafe,
               score: parseFloat(baseScore)
           });
       });
    });

    // 依分數高低排序，取最前面 5 名
    allCoffees.sort((a,b) => b.score - a.score);
    const top5 = allCoffees.slice(0, 5);
    
    top5Grid.innerHTML = '';
    
    let cardGradientMap = {
        '衣索比亞': 'rgba(8,142,67,0.15) 0%, rgba(252,209,22,0.15) 50%, rgba(239,33,40,0.15) 100%', 
        '肯亞': 'rgba(0,0,0,0.15) 0%, rgba(187,0,0,0.15) 50%, rgba(0,102,0,0.15) 100%',      
        '盧安達': 'rgba(0,161,222,0.15) 0%, rgba(250,210,1,0.15) 70%, rgba(32,96,61,0.15) 100%',    
        '蒲隆地': 'rgba(206,17,38,0.15) 0%, rgba(255,255,255,0.15) 50%, rgba(30,181,58,0.15) 100%',
        '哥倫比亞': 'rgba(255,205,0,0.15) 0%, rgba(0,48,135,0.15) 60%, rgba(200,16,46,0.15) 100%',  
        '薩爾瓦多': 'rgba(0,71,171,0.15) 0%, rgba(255,255,255,0.15) 50%, rgba(0,71,171,0.15) 100%',  
        '哥斯大黎加': 'rgba(0,43,127,0.15) 0%, rgba(255,255,255,0.15) 30%, rgba(206,17,38,0.15) 50%, rgba(255,255,255,0.15) 70%, rgba(0,43,127,0.15) 100%',
        '瓜地馬拉': 'rgba(73,151,208,0.15) 0%, rgba(255,255,255,0.15) 50%, rgba(73,151,208,0.15) 100%',
        '巴西': 'rgba(0,156,59,0.15) 0%, rgba(255,223,0,0.15) 60%, rgba(0,39,118,0.15) 100%',      
        '宏都拉斯': 'rgba(0,115,207,0.15) 0%, rgba(255,255,255,0.15) 50%, rgba(0,115,207,0.15) 100%',
        '祕魯': 'rgba(217,16,35,0.15) 0%, rgba(255,255,255,0.15) 50%, rgba(217,16,35,0.15) 100%',
        '牙買加': 'rgba(0,155,58,0.15) 0%, rgba(254,209,0,0.15) 50%, rgba(0,0,0,0.15) 100%',
        '巴拿馬': 'rgba(0,82,147,0.15) 0%, rgba(255,255,255,0.15) 50%, rgba(210,16,52,0.15) 100%',    
        '印尼': 'rgba(255,0,0,0.15) 0%, rgba(255,255,255,0.15) 100%',      
        '葉門': 'rgba(206,17,38,0.15) 0%, rgba(255,255,255,0.15) 50%, rgba(0,0,0,0.15) 100%',      
        '台灣': 'rgba(0,41,204,0.15) 10%, rgba(255,255,255,0.15) 50%, rgba(222,33,40,0.15) 90%'       
    };

    top5.forEach((coffee, index) => {
        let posterMap = {
            '衣索比亞': 'poster_ethiopia.png',
            '肯亞': 'poster_ethiopia.png',
            '盧安達': 'poster_ethiopia.png',
            '蒲隆地': 'poster_ethiopia.png',
            '哥倫比亞': 'poster_colombia.png',
            '薩爾瓦多': 'poster_colombia.png',
            '哥斯大黎加': 'poster_colombia.png',
            '瓜地馬拉': 'poster_colombia.png',
            '巴西': 'poster_colombia.png',
            '宏都拉斯': 'poster_colombia.png',
            '祕魯': 'poster_colombia.png',
            '牙買加': 'poster_colombia.png',
            '巴拿馬': 'poster_panama.png',
            '印尼': 'poster_indonesia.png',
            '葉門': 'poster_indonesia.png',
            '台灣': 'poster_taiwan.png'
        };
        
        let posterImg = 'coffee_poster.png';
        let bgGrad = 'none';
        let bgGradHover = 'none';
        
        Object.keys(posterMap).forEach(key => {
            if (coffee.name.includes(key)) posterImg = posterMap[key];
        });
        
        Object.keys(cardGradientMap).forEach(key => {
            if (coffee.name.includes(key)) {
                bgGrad = `linear-gradient(135deg, ${cardGradientMap[key]})`;
                bgGradHover = bgGrad.replace(/0\.15/g, '0.25'); 
            }
        });

        const card = document.createElement('div');
        card.className = 'top5-card';
        card.style.setProperty('--top5-bg', bgGrad);
        card.style.setProperty('--top5-bg-hover', bgGradHover);
        
        // 隨機產生投票數營造社群感 (10~59K)
        let randomVotes = Math.floor(Math.random() * 50) + 10; 
        
        card.innerHTML = `
          <div class="top5-badge">#${index + 1}</div>
          <div class="top5-poster-wrap">
             <img src="./${posterImg}" class="top5-poster" alt="poster">
             <div class="top5-poster-overlay"></div>
          </div>
          <div class="top5-info">
             <div class="top5-name">${coffee.name}</div>
             <div class="top5-meta">${coffee.cafeName} • 原豆單品</div>
             <div class="top5-rate-row">
                 <div class="top5-score-box">
                    <span style="color:#f5c518; font-size:1.2rem;">★</span>
                    <span class="top5-score-val">${coffee.score.toFixed(1)}</span>
                    <span class="top5-score-count">(${randomVotes}K)</span>
                 </div>
                 <div class="top5-action" style="margin-left: auto;">
                    <span style="color:#57a3e8;">☆</span> Rate
                 </div>
             </div>
             <div class="top5-action" style="margin-top:0;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>
                View Details
             </div>
          </div>
        `;
        
        card.addEventListener('click', () => {
            showCoffeeDetails(coffee.cafeName, coffee);
            // 手動觸發選單狀態同步並展開對應層級
            const sidebarItem = document.querySelector(`.coffee-item[data-id="${coffee.id}"]`);
            if(sidebarItem) {
                // 展開所屬國家折疊選單
                const countryList = sidebarItem.closest('.country-list');
                if (countryList) {
                    countryList.classList.add('open');
                    if (countryList.previousElementSibling) countryList.previousElementSibling.classList.add('open');
                }
                
                // 展開所屬洲別折疊選單
                const contBody = sidebarItem.closest('.continent-body');
                if (contBody) {
                    contBody.classList.add('open');
                    if (contBody.previousElementSibling) contBody.previousElementSibling.classList.add('open');
                }
                
                // 觸發選中與捲動
                sidebarItem.click();
                setTimeout(() => {
                    sidebarItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        });
        
        top5Grid.appendChild(card);
    });
  }

  // 初始渲染
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  
  if (searchParam) {
    if (searchInput) searchInput.value = searchParam;
    if (sidebar) sidebar.classList.add('active');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
    renderCafeList(searchParam);
    
    // 取得參數後自動清除網址列中的 ?search=，避免後續按重新整理時又觸發自動開出側邊欄
    if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  } else {
    renderCafeList();
  }
  
  // 渲染 Top 5 排行榜
  renderTop5Coffees();

  // 綁定搜尋輸入
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderCafeList(e.target.value);
    });
    
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = e.target.value;
        if (val && !sidebar.classList.contains('active')) {
           sidebar.classList.add('active');
           sidebarOverlay.classList.add('active');
           
           const topSearchPopup = document.getElementById('topbar-search-popup');
           if (topSearchPopup) topSearchPopup.classList.add('hidden');
           searchInput.blur(); // 隱藏鍵盤
        }
      }
    });
  }

  // 移除單品下的店家搜尋註冊
  
  // 評論表單事件
  const reviewForm = document.getElementById('review-form');
  
  // 總評分(1-10)連動顯示
  const overallIn = document.getElementById('overall-score-in');
  const overallVal = document.getElementById('overall-val');
  if (overallIn && overallVal) {
    overallIn.addEventListener('input', (e) => {
      overallVal.textContent = e.target.value;
    });
  }
  
  // 初始化自訂豆子評分
  let currentStars = [5, 5, 5, 5, 5];
  document.querySelectorAll('.stars').forEach(container => {
    const idx = parseInt(container.dataset.idx);
    container.innerHTML = '';
    for(let i=1; i<=5; i++){
      let s = document.createElement('span');
      s.textContent = '*';
      s.className = 'star-icon active';
      s.dataset.val = i;
      s.addEventListener('click', () => {
        currentStars[idx] = i;
        updateStars(container, i);
      });
      container.appendChild(s);
    }
  });
  
  function updateStars(container, val) {
    container.querySelectorAll('.star-icon').forEach(s => {
      if(parseInt(s.dataset.val) <= val) {
        s.classList.add('active');
        s.style.color = 'var(--accent-gold)';
      } else {
        s.classList.remove('active');
        s.style.color = '#ccc';
      }
    });
  }

  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('review-input');
    const text = input.value.trim();
    const overallScore = parseInt(overallIn.value);
    
    if (text && activeCoffeeId) {
      try {
        // 複製一份陣列儲存
        saveReview(activeCoffeeId, text, [...currentStars], overallScore);
        input.value = '';
        
        // 重置
        overallIn.value = 8;
        if(overallVal) overallVal.textContent = 8;
        currentStars = [5, 5, 5, 5, 5];
        document.querySelectorAll('.stars').forEach((container) => {
          updateStars(container, 5);
        });
        
        // 依照要求跳出視窗
        alert('已送出!謝謝');
        // 送出後關閉評論視窗
        document.getElementById('reviews-modal').classList.add('hidden');
      } catch(err) {
        console.error('儲存評論時發生錯誤:', err);
        const btn = document.querySelector('.btn-submit');
        if (btn) {
          const originalText = btn.textContent;
          btn.textContent = '❌ ' + (err.message || '發生錯誤');
          btn.style.backgroundColor = '#f44336';
          btn.style.color = '#fff';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
            btn.style.color = '';
          }, 4000);
        } else {
          alert('發生錯誤：' + err.message);
        }
      }
    }
  });
});

function showCoffeeDetails(cafeName, coffee) {
  activeCoffeeId = coffee.id;
  activeCoffeeObj = coffee;
  
  if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const detailsCard = document.getElementById('coffee-details');
  detailsCard.classList.remove('hidden');
  
  const placeholder = document.getElementById('welcome-placeholder');
  if (placeholder) placeholder.classList.add('hidden');
  
  detailsCard.style.animation = 'none';
  detailsCard.offsetHeight; 
  detailsCard.style.animation = null; 
  
  document.getElementById('coffee-name').textContent = coffee.name;
  
  // ======= 國家客製化海報與國旗色彩邏輯 =======
  let posterMap = {
      '衣索比亞': 'poster_ethiopia.png',
      '肯亞': 'poster_ethiopia.png',
      '盧安達': 'poster_ethiopia.png',
      '蒲隆地': 'poster_ethiopia.png',
      '哥倫比亞': 'poster_colombia.png',
      '薩爾瓦多': 'poster_colombia.png',
      '哥斯大黎加': 'poster_colombia.png',
      '瓜地馬拉': 'poster_colombia.png',
      '巴西': 'poster_colombia.png',
      '宏都拉斯': 'poster_colombia.png',
      '祕魯': 'poster_colombia.png',
      '牙買加': 'poster_colombia.png',
      '巴拿馬': 'poster_panama.png',
      '印尼': 'poster_indonesia.png',
      '葉門': 'poster_indonesia.png',
      '台灣': 'poster_taiwan.png'
  };

  // 生成帶有黑底保護文字層的各國國旗漸層色
  const shadowLayer = 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)';
  let flagMap = {
      '衣索比亞': `${shadowLayer}, linear-gradient(135deg, rgba(8,142,67,0.7) 0%, rgba(252,209,22,0.7) 50%, rgba(239,33,40,0.7) 100%)`, 
      '肯亞': `${shadowLayer}, linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(187,0,0,0.7) 50%, rgba(0,102,0,0.7) 100%)`,      
      '盧安達': `${shadowLayer}, linear-gradient(135deg, rgba(0,161,222,0.7) 0%, rgba(250,210,1,0.7) 70%, rgba(32,96,61,0.7) 100%)`,    
      '蒲隆地': `${shadowLayer}, linear-gradient(135deg, rgba(206,17,38,0.7) 0%, rgba(255,255,255,0.7) 50%, rgba(30,181,58,0.7) 100%)`,
      '哥倫比亞': `${shadowLayer}, linear-gradient(135deg, rgba(255,205,0,0.7) 0%, rgba(0,48,135,0.7) 60%, rgba(200,16,46,0.7) 100%)`,  
      '薩爾瓦多': `${shadowLayer}, linear-gradient(135deg, rgba(0,71,171,0.7) 0%, rgba(255,255,255,0.7) 50%, rgba(0,71,171,0.7) 100%)`,  
      '哥斯大黎加': `${shadowLayer}, linear-gradient(135deg, rgba(0,43,127,0.7) 0%, rgba(255,255,255,0.7) 30%, rgba(206,17,38,0.7) 50%, rgba(255,255,255,0.7) 70%, rgba(0,43,127,0.7) 100%)`,
      '瓜地馬拉': `${shadowLayer}, linear-gradient(135deg, rgba(73,151,208,0.7) 0%, rgba(255,255,255,0.7) 50%, rgba(73,151,208,0.7) 100%)`,
      '巴西': `${shadowLayer}, linear-gradient(135deg, rgba(0,156,59,0.7) 0%, rgba(255,223,0,0.7) 60%, rgba(0,39,118,0.7) 100%)`,      
      '宏都拉斯': `${shadowLayer}, linear-gradient(135deg, rgba(0,115,207,0.7) 0%, rgba(255,255,255,0.7) 50%, rgba(0,115,207,0.7) 100%)`,
      '祕魯': `${shadowLayer}, linear-gradient(135deg, rgba(217,16,35,0.7) 0%, rgba(255,255,255,0.7) 50%, rgba(217,16,35,0.7) 100%)`,
      '牙買加': `${shadowLayer}, linear-gradient(135deg, rgba(0,155,58,0.7) 0%, rgba(254,209,0,0.7) 50%, rgba(0,0,0,0.7) 100%)`,
      '巴拿馬': `${shadowLayer}, linear-gradient(135deg, rgba(0,82,147,0.7) 0%, rgba(255,255,255,0.7) 50%, rgba(210,16,52,0.7) 100%)`,    
      '印尼': `${shadowLayer}, linear-gradient(135deg, rgba(255,0,0,0.7) 0%, rgba(255,255,255,0.7) 100%)`,      
      '葉門': `${shadowLayer}, linear-gradient(135deg, rgba(206,17,38,0.7) 0%, rgba(255,255,255,0.7) 50%, rgba(0,0,0,0.7) 100%)`,      
      '台灣': `${shadowLayer}, linear-gradient(135deg, rgba(0,41,204,0.7) 10%, rgba(255,255,255,0.7) 50%, rgba(222,33,40,0.7) 90%)`       
  };
  
  let targetCountry = null;
  Object.keys(posterMap).forEach(key => {
      if (coffee.name.includes(key)) targetCountry = key;
  });

  let imgFile = targetCountry ? posterMap[targetCountry] : 'coffee_poster.png';
  // 預設為原本的炭黑色漸層
  let bannerFlagGradient = targetCountry && flagMap[targetCountry] ? flagMap[targetCountry] : 'linear-gradient(to top, rgba(15,15,15,0.95) 0%, rgba(15,15,15,0.3) 100%)';

  const bannerBg = document.querySelector('.imdb-banner-bg');
  const posterImg = document.querySelector('.imdb-poster img');
  const bannerContainer = document.querySelector('.imdb-banner');
  
  if (bannerBg) bannerBg.style.backgroundImage = `url('./${imgFile}?v=2')`;
  if (posterImg) posterImg.src = `./${imgFile}?v=2`;
  if (bannerContainer) {
      bannerContainer.style.setProperty('--flag-gradient', bannerFlagGradient);
  }
  // ===================================
  
  const cafesContainer = document.getElementById('coffee-cafes-list');
  if (cafesContainer) {
      const baseName = coffee.name.replace(/\(.*\)/g, '').trim();
      const stores = [];
      
      coffeeData.forEach(cafeObj => {
          const hasIt = cafeObj.coffees.some(c => {
              const cBase = c.name.replace(/\(.*\)/g, '').trim();
              return cBase === baseName || cBase.includes(baseName) || baseName.includes(cBase);
          });
          if (hasIt) {
              const label = `${cafeObj.cafe} (${cafeObj.location})`;
              if (!stores.some(s => s.label === label)) {
                  stores.push({ cafe: cafeObj.cafe, label: label });
              }
          }
      });
      
      currentCoffeeStores = stores;
      renderCoffeeStores();
  }

  document.getElementById('coffee-desc').textContent = coffee.desc;
  
  // renderReviews 裡會同時處理計算與顯示總平均分與雷達圖重生
  renderReviews(coffee.id);
}

function renderRadarChart(coffeeName, stats) {
  const ctx = document.getElementById('radarChart').getContext('2d');
  
  if (currentChart) {
    currentChart.destroy();
  }
  
  const enLabels = ['Aroma', 'Acidity', 'Sweetness', 'Body', 'Aftertaste'];
  const chLabels = ['香氣', '酸度', '甜度', '厚度', '餘韻'];
  
  const chartLabels = chLabels.map((L, i) => {
    return `${L} ${enLabels[i]}`;
  });

  // 圖表改為黑金色調，並且將分數直接在標籤上秀出星星
  const data = {
    labels: chartLabels,
    datasets: [{
      label: '五感分數 (滿分5星)',
      data: stats,
      backgroundColor: 'rgba(205, 162, 91, 0.15)', // lighter gold dim
      borderColor: 'rgba(205, 162, 91, 1)',      // gold
      pointBackgroundColor: '#fff',
      pointBorderColor: 'rgba(205, 162, 91, 1)',
      pointHoverBackgroundColor: 'rgba(205, 162, 91, 1)',
      pointHoverBorderColor: '#333',
      borderWidth: 2,
    }]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10 /* 留白縮小以盡可能放大雷達圖本體 */
    },
    scales: {
      r: {
        min: 0,
        max: 5,
        angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        pointLabels: {
          color: '#b88d4c', /* 回歸多行顯示，微調字體大小與行高 */
          font: { size: 14, weight: 'bold', family: "'Noto Sans TC', sans-serif" }
        },
        ticks: {
          display: false,
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: { display: false },
      title: { 
          display: true, 
          text: '咖啡五感 Coffee Senses', 
          color: '#cda25b', 
          font: { size: 16, family: "'Oswald', 'Noto Sans TC', sans-serif" } 
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#555',
        titleFont: { size: 14, family: "'Noto Sans TC', sans-serif" },
        bodyFont: { size: 14, family: "'Noto Sans TC', sans-serif" },
        padding: 12,
        cornerRadius: 0,
        displayColors: false,
        borderColor: '#cda25b',
        borderWidth: 1
      }
    }
  };
  
  currentChart = new Chart(ctx, {
    type: 'radar',
    data: data,
    options: options
  });
}

const cafeLinks = {
    "Simple Kaffa 興波咖啡": "https://simplekaffa.com/",
    "Fika Fika Cafe": "https://www.fikafikacafe.com/",
    "豆舖咖啡館": "https://www.facebook.com/Doopoocoffee/",
    "SIDRA 栖爪咖啡": "https://www.instagram.com/sidracoffee/",
    "ML coffee 慕光咖啡工作室": "https://www.instagram.com/ml_coffee_studio/",
    "Jo's Corner Café": "https://www.facebook.com/JosCornerCafe/",
    "著手咖啡 Coffee Intro (中壢內壢店)": "https://www.coffeeintro.com/",
    "拾事咖啡 SEIZE THE DAY": "https://www.facebook.com/seizethedaycoffee/",
    "暖空咖啡 Warm air Kafe": "https://www.instagram.com/warmairkafe/",
    "墨咖啡 Ink Coffee": "https://www.facebook.com/inkcoffee99/",
    "The Factory Mojocoffee": "https://www.mojocoffee.com.tw/",
    "著手咖啡 Coffee Intro": "https://www.coffeeintro.com/",
    "存憶 Cafe Bar": "https://www.facebook.com/tsunyi1932/",
    "馤咖啡。食作": "https://www.facebook.com/haicoffee2015/"
};

function renderCoffeeStores() {
  const cafesContainer = document.getElementById('coffee-cafes-list');
  if (!cafesContainer) return;

  if (currentCoffeeStores.length > 0) {
      cafesContainer.innerHTML = currentCoffeeStores.map(storeObj => {
          const link = cafeLinks[storeObj.cafe] || `https://www.google.com/search?q=${encodeURIComponent(storeObj.cafe + ' 咖啡')}`;
          const target = link.startsWith('http') ? 'target="_blank"' : '';
          return `<a href="${link}" ${target} class="cafe-tag" style="text-decoration:none; display:inline-block; background: rgba(207, 169, 104, 0.1); border: 1px solid var(--accent-gold); padding: 6px 12px; border-radius: 4px; font-size: 0.95rem; margin-right: 5px; margin-bottom: 5px; transition: all 0.2s;">
              <span style="color: var(--accent-gold); font-weight: bold;">${storeObj.label}</span>
          </a>`;
      }).join('');
  } else {
      cafesContainer.innerHTML = '<span style="color:#888;">暫無紀錄</span>';
  }
}

// 註冊 Service Worker (PWA支援)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('ServiceWorker 註冊成功，範圍為: ', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker 註冊失敗: ', err);
      });
  });
}

