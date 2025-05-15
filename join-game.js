document.addEventListener('DOMContentLoaded', () => {
    // تعريف معرف مستخدم فريد
    const userId = 'user_' + Math.random().toString(36).substring(2, 15);
    console.log("تم تعريف userId:", userId);

    const playerNameInput = document.getElementById('playerName');
    const gameCodeInput = document.getElementById('gameCodeInput');
    const joinGameBtn = document.getElementById('joinGameBtn');
    const setupForm = document.querySelector('.setup-form');
    const waitingRoom = document.querySelector('.waiting-room');
    const roomCodeElement = document.getElementById('roomCode');
    const playersListElement = document.getElementById('playersList');

    // إضافة تسجيل الأخطاء
    console.log("تم تحميل صفحة الانضمام إلى اللعبة");
    
    // التحقق من اتصال Firebase
    function checkFirebaseReady(callback) {
        let checkAttempts = 0;
        const maxAttempts = 20;
        
        const checkInterval = setInterval(() => {
            checkAttempts++;
            
            if (window.firebase && window.database) {
                clearInterval(checkInterval);
                console.log('Firebase والـ database جاهزان');
                callback(true);
            } else if (checkAttempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('فشل تحميل Firebase أو database بعد عدة محاولات');
                alert('حدثت مشكلة في الاتصال بالخادم. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
                callback(false);
            } else {
                console.log(`انتظار Firebase و database... محاولة ${checkAttempts}/${maxAttempts}`);
            }
        }, 500);
    }
    
    // نتحقق من اتصال Firebase
    checkFirebaseReady((isReady) => {
        if (!isReady) return;
        
        try {
            console.log("التحقق من اتصال Firebase...");
            console.log("تكوين Firebase:", JSON.stringify({
                projectId: firebase.app().options.projectId,
                databaseURL: firebase.app().options.databaseURL,
                authDomain: firebase.app().options.authDomain
            }));
            
            // إنشاء المرجع لاختبار الاتصال
            const testRef = window.database.ref("connection_test");
            console.log("تم إنشاء مرجع اختبار الاتصال بنجاح");
            
            // اختبار الاتصال بقاعدة البيانات
            testRef.set({
                timestamp: Date.now(),
                message: "تم الاتصال بنجاح"
            })
            .then(() => {
                console.log("تم الاتصال بقاعدة بيانات Firebase بنجاح!");
            })
            .catch(error => {
                console.error("خطأ في الاتصال بقاعدة البيانات:", error);
                alert("هناك مشكلة في الاتصال بالخادم. الرجاء التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
            });
        } catch (error) {
            console.error("خطأ في تهيئة Firebase:", error);
            alert("حدث خطأ في تهيئة الاتصال بالخادم. الرجاء تحديث الصفحة والمحاولة مرة أخرى.");
        }
    });

    // عرض قائمة اللاعبين من Firebase
    function renderPlayersList(players) {
        playersListElement.innerHTML = '';
        
        if (!players) {
            console.warn("لم يتم العثور على لاعبين في الغرفة");
            return;
        }
        
        console.log("تحديث قائمة اللاعبين:", Object.keys(players).length);
        
        Object.entries(players).forEach(([playerId, playerData]) => {
            const li = document.createElement('li');
            li.textContent = playerData.name + (playerData.isHost ? ' (المضيف)' : '');
            playersListElement.appendChild(li);
        });
    }

    // الاستماع إلى تغييرات اللعبة
    function listenToGameChanges(gameCode) {
        console.log("بدء الاستماع إلى تغييرات اللعبة:", gameCode);
        const gameRef = window.database.ref(`games/${gameCode}`);
        
        // الاستماع إلى تغييرات اللاعبين
        gameRef.child('players').on('value', (snapshot) => {
            const players = snapshot.val() || {};
            console.log("تم استلام تحديث للاعبين:", Object.keys(players).length);
            renderPlayersList(players);
        }, (error) => {
            console.error("خطأ في الاستماع إلى تغييرات اللاعبين:", error);
        });
        
        // الاستماع إلى تغيير حالة اللعبة
        gameRef.child('status').on('value', (snapshot) => {
            const status = snapshot.val();
            console.log("تم استلام تحديث لحالة اللعبة:", status);
            if (status === 'started') {
                // إذا بدأت اللعبة، انتقل إلى صفحة اللعب
                console.log("اللعبة بدأت، جاري الانتقال إلى صفحة اللعب...");
                window.location.href = 'game.html';
            }
        }, (error) => {
            console.error("خطأ في الاستماع إلى تغييرات حالة اللعبة:", error);
        });
    }

    joinGameBtn.addEventListener('click', () => {
        // التحقق من إدخال اسم اللاعب ورمز اللعبة
        const playerName = playerNameInput.value.trim();
        const gameCode = gameCodeInput.value.trim().toUpperCase();

        if (!playerName) {
            alert('الرجاء إدخال اسمك');
            return;
        }

        if (!gameCode || gameCode.length !== 4) {
            alert('الرجاء إدخال رمز لعبة صحيح (4 أحرف)');
            return;
        }

        console.log("محاولة الانضمام إلى اللعبة:", gameCode);

        // التحقق من اتصال Firebase قبل المتابعة
        checkFirebaseReady((isReady) => {
            if (!isReady) {
                alert("تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت وإعادة المحاولة.");
                return;
            }

            // التحقق من وجود اللعبة في Firebase
            const gameRef = window.database.ref(`games/${gameCode}`);
            gameRef.once('value', (snapshot) => {
                const gameData = snapshot.val();
                
                if (!gameData) {
                    console.error("لم يتم العثور على لعبة بهذا الرمز:", gameCode);
                    alert('لم يتم العثور على لعبة بهذا الرمز!');
                    return;
                }
                
                console.log("تم العثور على اللعبة:", gameCode, "الحالة:", gameData.status);
                
                if (gameData.status === 'started') {
                    console.warn("اللعبة قد بدأت بالفعل");
                    alert('اللعبة قد بدأت بالفعل!');
                    return;
                }
                
                // التحقق من عدد اللاعبين
                const players = gameData.players || {};
                if (Object.keys(players).length >= gameData.maxPlayers) {
                    console.warn("اللعبة ممتلئة بالفعل");
                    alert('اللعبة ممتلئة بالفعل!');
                    return;
                }
                
                console.log("جاري إضافة اللاعب إلى اللعبة:", playerName);
                
                // إضافة اللاعب إلى اللعبة
                gameRef.child('players').update({
                    [userId]: {
                        name: playerName,
                        isHost: false,
                        joinedAt: firebase.database.ServerValue.TIMESTAMP
                    }
                })
                .then(() => {
                    console.log("تم إضافة اللاعب بنجاح");
                    
                    // تخزين معلومات اللاعب والغرفة في التخزين المحلي
                    const localGameData = {
                        gameCode,
                        host: false,
                        playerName,
                        userId
                    };
                    localStorage.setItem('mafia_game_data', JSON.stringify(localGameData));
                    console.log("تم تخزين بيانات اللعبة محلياً");
                    
                    // إخفاء نموذج الانضمام وإظهار غرفة الانتظار
                    setupForm.style.display = 'none';
                    waitingRoom.style.display = 'block';
                    
                    // عرض رمز الغرفة
                    roomCodeElement.textContent = gameCode;
                    
                    // الاستماع إلى تغييرات اللعبة
                    listenToGameChanges(gameCode);
                })
                .catch(error => {
                    console.error("خطأ في إضافة اللاعب إلى اللعبة:", error);
                    alert("حدث خطأ أثناء الانضمام إلى اللعبة. الرجاء المحاولة مرة أخرى.");
                });
            }, (error) => {
                console.error("خطأ في البحث عن اللعبة:", error);
                alert("حدث خطأ أثناء البحث عن اللعبة. الرجاء التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
            });
        });
    });
}); 