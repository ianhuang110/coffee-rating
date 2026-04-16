import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, push, get, child, query, orderByChild, equalTo, set, update } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzVPkkUUlfiJGvUetJbe5Nf3yCjYraOUo",
  authDomain: "coffee-rating-372b1.firebaseapp.com",
  databaseURL: "https://coffee-rating-372b1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "coffee-rating-372b1",
  storageBucket: "coffee-rating-372b1.firebasestorage.app",
  messagingSenderId: "769576087606",
  appId: "1:769576087606:web:a7ee84188013a6fdd8a897"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

window.firebaseDB = {
    async getReviews(coffeeId) {
        try {
            const dbRef = ref(db);
            const reviewsRef = child(dbRef, "reviews");
            // Realtime Db 可以透過 orderByChild 搭配 equalTo 進行簡易過濾
            const q = query(reviewsRef, orderByChild("coffeeId"), equalTo(coffeeId));
            const snapshot = await get(q);
            const reviews = [];
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    reviews.push(childSnapshot.val());
                });
            }
            // 讓最新留言排後面 (在畫面上會用 flex-direction: column-reverse 處理)
            return reviews.sort((a, b) => new Date(a.date) - new Date(b.date));
        } catch(e) {
            console.error("讀取 Firebase 資料失敗:", e);
            return [];
        }
    },
    async saveReview(coffeeId, text, stats, overallScore, userName) {
        try {
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            
            // 使用 push 會自動產生一個唯一的隨機 ID 當作鍵值
            const newReviewRef = push(ref(db, "reviews"));
            await set(newReviewRef, {
                coffeeId: coffeeId,
                user: userName,
                text: text,
                date: dateStr,
                stats: stats,
                userAvg: overallScore,
                timestamp: Date.now()
            });
            return true;
        } catch(e) {
            console.error("寫入 Firebase 資料失敗:", e);
            return false;
        }
    },
    async registerUser(email, name, phone, password) {
        try {
            const usersRef = ref(db, "users");
            const q = query(usersRef, orderByChild("email"), equalTo(email));
            const snapshot = await get(q);
            
            // 如果查得到資料，代表註冊過了
            if (snapshot.exists()) {
                return { success: false, message: '此 Email 已經註冊過囉，請直接使用密碼登入！' };
            }
            
            const newUserRef = push(ref(db, "users"));
            await set(newUserRef, { email, name, phone, password });
            return { success: true };
        } catch(e) {
            console.error(e);
            return { success: false, message: '伺服器錯誤，請稍後再試' };
        }
    },
    async loginUser(email, password) {
        try {
            const usersRef = ref(db, "users");
            const q = query(usersRef, orderByChild("email"), equalTo(email));
            const snapshot = await get(q);
            
            if (!snapshot.exists()) {
                return { success: false, message: '找不到此 Email 的註冊紀錄，請先註冊會員！' };
            }
            
            let loggedInUser = null;
            let loggedInUserId = null;
            
            snapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();
                if (userData.password === password) {
                    loggedInUser = userData;
                    loggedInUserId = childSnapshot.key;
                }
            });
            
            if (!loggedInUser) {
                return { success: false, message: 'Email 或密碼錯誤！' };
            }
            
            return { success: true, user: loggedInUser, id: loggedInUserId };
        } catch(e) {
            console.error(e);
            return { success: false, message: '伺服器錯誤' };
        }
    },
    async resetPassword(email, newTempPassword) {
        try {
            const usersRef = ref(db, "users");
            const q = query(usersRef, orderByChild("email"), equalTo(email));
            const snapshot = await get(q);
            
            if (!snapshot.exists()) {
                return { success: false, message: '找不到此 Email 的註冊紀錄，請先註冊會員！' };
            }
            
            let userIdToUpdate = null;
            snapshot.forEach((childSnapshot) => {
                userIdToUpdate = childSnapshot.key; // 紀錄下 Realtime DB 自動產生的 ID
            });
            
            if (userIdToUpdate) {
                const userDocRef = ref(db, `users/${userIdToUpdate}`);
                await update(userDocRef, { password: newTempPassword });
                return { success: true };
            }
            return { success: false, message: '伺服器發生異常。' };
        } catch(e) {
             console.error(e);
             return { success: false, message: '伺服器錯誤' };
        }
    },
    async updatePassword(email, newPassword) {
        return this.resetPassword(email, newPassword);
    }
};
