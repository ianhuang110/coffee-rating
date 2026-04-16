import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzVPkkUUlfiJGvUetJbe5Nf3yCjYraOUo",
  authDomain: "coffee-rating-372b1.firebaseapp.com",
  projectId: "coffee-rating-372b1",
  storageBucket: "coffee-rating-372b1.firebasestorage.app",
  messagingSenderId: "769576087606",
  appId: "1:769576087606:web:a7ee84188013a6fdd8a897"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.firebaseDB = {
    async getReviews(coffeeId) {
        try {
            // Firestore 不一定預設排序，這裡我們只過濾 coffeeId 後在本地排序，減少複合索引(Composite Index)設定麻煩
            const q = query(collection(db, "reviews"), where("coffeeId", "==", coffeeId));
            const querySnapshot = await getDocs(q);
            const reviews = [];
            querySnapshot.forEach(doc => reviews.push(doc.data()));
            // 讓最新的留言在後面（原本邏輯是在渲染時 reversed）
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
            await addDoc(collection(db, "reviews"), {
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
            const q = query(collection(db, "users"), where("email", "==", email));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) return { success: false, message: '此 Email 已經註冊過囉，請直接使用密碼登入！' };
            await addDoc(collection(db, "users"), { email, name, phone, password });
            return { success: true };
        } catch(e) {
            console.error(e);
            return { success: false, message: '伺服器錯誤，請稍後再試' };
        }
    },
    async loginUser(email, password) {
        try {
            const q = query(collection(db, "users"), where("email", "==", email));
            const snapshot = await getDocs(q);
            if (snapshot.empty) return { success: false, message: '找不到此 Email 的註冊紀錄，請先註冊會員！' };
            
            const userDoc = snapshot.docs[0];
            const userData = userDoc.data();
            if (userData.password !== password) return { success: false, message: 'Email 或密碼錯誤！' };
            return { success: true, user: userData, id: userDoc.id };
        } catch(e) {
            console.error(e);
            return { success: false, message: '伺服器錯誤' };
        }
    },
    async resetPassword(email, newTempPassword) {
        try {
            const q = query(collection(db, "users"), where("email", "==", email));
            const snapshot = await getDocs(q);
            if (snapshot.empty) return { success: false, message: '找不到此 Email 的註冊紀錄，請先註冊會員！' };
            
            const userDocRefs = snapshot.docs[0];
            const { updateDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js");
            await updateDoc(doc(db, "users", userDocRefs.id), { password: newTempPassword });
            return { success: true };
        } catch(e) {
             console.error(e);
             return { success: false, message: '伺服器錯誤' };
        }
    },
    async updatePassword(email, newPassword) {
        return this.resetPassword(email, newPassword);
    }
};
