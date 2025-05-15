document.addEventListener('DOMContentLoaded', () => {
    // تعريف معرف مستخدم فريد
    const userId = 'user_' + Math.random().toString(36).substring(2, 15);
    console.log("تم تعريف userId:", userId);
    
    const playerNameInput = document.getElementById('playerName');
    const playerCountSelect = document.getElementById('playerCount');
    const createGameBtn = document.getElementById('createGameBtn');
    const setupForm = document.querySelector('.setup-form');
    const gameInfo = document.querySelector('.game-info');
    const gameCodeElement = document.getElementById('gameCode');
    const copyCodeBtn = document.getElementById('copyCode');
    const playerCounter = document.getElementById('playerCounter');
    const totalPlayers = document.getElementById('totalPlayers');
    const startGameBtn = document.getElementById('startGameBtn');

    console.log("تم العثور على العناصر:", {
        createGameBtn: !!createGameBtn,
        setupForm: !!setupForm,
        gameInfo: !!gameInfo,
        playerCounter: !!playerCounter,
        totalPlayers: !!totalPlayers
    });

    // إنشاء رمز عشوائي للعبة
    function generateGameCode() {
        return Math.random().toString(36).substring(2, 6).toUpperCase();
    }

    // التحقق من وجود firebase و database
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

    // الاستماع إلى تغييرات اللاعبين في الغرفة
    function listenToPlayersChanges(gameCode, maxPlayers) {
        const gameRef = window.database.ref(`games/${gameCode}`);
        
        // تأكد من أن عناصر DOM موجودة
        if (!playerCounter || !startGameBtn) {
            console.error("عناصر DOM غير موجودة!");
            return;
        }
        
        console.log("بدء الاستماع لتغييرات اللاعبين...");
        
        // الاستماع إلى إضافة لاعبين جدد
        gameRef.child('players').on('value', (snapshot) => {
            const players = snapshot.val() || {};
            const playersCount = Object.keys(players).length;
            
            console.log("تم تحديث قائمة اللاعبين:", playersCount, "لاعب");
            
            // تحديث عداد اللاعبين
            playerCounter.textContent = playersCount;
            console.log("تم تحديث عداد اللاعبين إلى:", playersCount);
            
            // تمكين زر بدء اللعبة عندما يصل عدد اللاعبين إلى ثلاثة على الأقل
            if (playersCount >= 3) {
                startGameBtn.disabled = false;
                console.log("تم تمكين زر بدء اللعبة (عدد اللاعبين كافٍ)");
            } else {
                startGameBtn.disabled = true;
                console.log("تم تعطيل زر بدء اللعبة (عدد اللاعبين غير كافٍ)");
            }

            // تحقق مما إذا تم بدء اللعبة
            gameRef.child('status').once('value', (statusSnapshot) => {
                const status = statusSnapshot.val();
                if (status === 'started') {
                    window.location.href = 'game.html';
                }
            });
        }, (error) => {
            console.error("حدث خطأ أثناء الاستماع لتغييرات اللاعبين:", error);
        });
    }

    console.log("تسجيل معالج حدث النقر على زر إنشاء اللعبة");
    
    createGameBtn.addEventListener('click', () => {
        console.log("تم النقر على زر إنشاء اللعبة");
        
        // التحقق من إدخال اسم اللاعب
        const playerName = playerNameInput.value.trim();
        console.log("اسم اللاعب:", playerName);
        
        if (!playerName) {
            alert('الرجاء إدخال اسمك');
            return;
        }

        // التحقق من اتصال Firebase قبل إنشاء اللعبة
        console.log("التحقق من جاهزية Firebase...");
        checkFirebaseReady((isReady) => {
            console.log("حالة جاهزية Firebase:", isReady);
            
            if (!isReady) return;
            
            // إخفاء نموذج الإعداد وإظهار معلومات اللعبة
            setupForm.style.display = 'none';
            gameInfo.style.display = 'block';

            // إنشاء رمز للعبة وعرضه
            const gameCode = generateGameCode();
            gameCodeElement.textContent = gameCode;
            console.log("تم إنشاء رمز اللعبة:", gameCode);

            // تحديد عدد اللاعبين
            const maxPlayers = parseInt(playerCountSelect.value);
            totalPlayers.textContent = maxPlayers;
            console.log("تم تعيين إجمالي عدد اللاعبين إلى:", maxPlayers);

            // إنشاء غرفة اللعبة في Firebase
            try {
                console.log("جاري إنشاء مرجع لقاعدة البيانات...", window.database);
                const gameRef = window.database.ref(`games/${gameCode}`);
                
                // حفظ معلومات اللعبة
                console.log("حفظ معلومات اللعبة في Firebase...");
                gameRef.set({
                    host: userId,
                    createdAt: window.firebase.database.ServerValue.TIMESTAMP,
                    maxPlayers: maxPlayers,
                    status: 'waiting',
                    players: {
                        [userId]: {
                            name: playerName,
                            isHost: true,
                            joinedAt: window.firebase.database.ServerValue.TIMESTAMP
                        }
                    }
                }).then(() => {
                    console.log("تم حفظ معلومات اللعبة بنجاح!");
                    
                    // وضع القيمة الأولية لعداد اللاعبين
                    playerCounter.textContent = "1";
                    console.log("تم تعيين عداد اللاعبين الأولي إلى: 1");
                    
                    // الاستماع إلى تغييرات اللاعبين
                    listenToPlayersChanges(gameCode, maxPlayers);
                }).catch((error) => {
                    console.error("خطأ في حفظ معلومات اللعبة:", error);
                });

                // تخزين معلومات اللاعب والغرفة في التخزين المحلي
                const gameData = {
                    gameCode,
                    host: true,
                    playerName,
                    maxPlayers,
                    userId
                };
                localStorage.setItem('mafia_game_data', JSON.stringify(gameData));
                console.log("تم حفظ معلومات اللعبة في التخزين المحلي");

                // نسخ رمز اللعبة إلى الحافظة
                copyCodeBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(gameCode)
                        .then(() => {
                            alert('تم نسخ الرمز!');
                        })
                        .catch(err => {
                            console.error('خطأ في نسخ الرمز: ', err);
                        });
                });

                // عند الضغط على زر بدء اللعبة
                startGameBtn.addEventListener('click', () => {
                    console.log("تم النقر على زر بدء اللعبة");
                    
                    // التحقق من عدد اللاعبين مرة أخرى
                    gameRef.child('players').once('value', (snapshot) => {
                        const players = snapshot.val() || {};
                        const playersCount = Object.keys(players).length;
                        
                        if (playersCount < 3) {
                            alert("لا يمكن بدء اللعبة. يجب أن يكون هناك 3 لاعبين على الأقل!");
                            return;
                        }
                        
                        console.log("جاري بدء اللعبة مع", playersCount, "لاعبين...");
                        
                        // تحديث حالة اللعبة إلى "بدأت"
                        gameRef.child('status').set('started').then(() => {
                            console.log("تم تحديث حالة اللعبة إلى 'started'");
                            
                            // توزيع الأدوار على اللاعبين
                            gameRef.child('players').once('value', (snapshot) => {
                                const players = snapshot.val() || {};
                                const playerIds = Object.keys(players);
                                
                                // تحديد عدد اللاعبين في كل دور
                                const totalPlayers = playerIds.length;
                                const mafiaCount = Math.max(1, Math.floor(totalPlayers / 4));
                                const detectiveCount = 1;
                                const doctorCount = 1;
                                const citizenCount = totalPlayers - mafiaCount - detectiveCount - doctorCount;
                                
                                console.log("توزيع الأدوار:", {
                                    totalPlayers,
                                    mafiaCount,
                                    detectiveCount,
                                    doctorCount,
                                    citizenCount
                                });
                                
                                // إنشاء مصفوفة الأدوار
                                let roles = [];
                                for (let i = 0; i < mafiaCount; i++) roles.push('mafia');
                                for (let i = 0; i < detectiveCount; i++) roles.push('detective');
                                for (let i = 0; i < doctorCount; i++) roles.push('doctor');
                                for (let i = 0; i < citizenCount; i++) roles.push('citizen');
                                
                                // خلط الأدوار
                                roles = shuffleArray(roles);
                                
                                // تعيين الأدوار للاعبين
                                const updates = {};
                                playerIds.forEach((playerId, index) => {
                                    updates[`${playerId}/role`] = roles[index];
                                });
                                
                                // حفظ الأدوار في Firebase
                                gameRef.child('players').update(updates).then(() => {
                                    console.log("تم توزيع الأدوار بنجاح");
                                    // الانتقال إلى صفحة اللعب
                                    window.location.href = 'game.html';
                                }).catch(error => {
                                    console.error("خطأ في توزيع الأدوار:", error);
                                });
                            });
                        }).catch(error => {
                            console.error("خطأ في تحديث حالة اللعبة:", error);
                        });
                    });
                });
            } catch (error) {
                console.error("خطأ أثناء إنشاء اللعبة:", error);
                alert("حدث خطأ أثناء إنشاء اللعبة: " + error.message);
            }
        });
    });

    // دالة لخلط المصفوفة
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}); 