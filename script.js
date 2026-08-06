// ==========================================================================
// STATE MANAGEMENT & LOCAL STORAGE
// ==========================================================================

const DEFAULT_STATE = {
    theme: 'light',
    user: { name: 'Student' },
    streak: 0,
    lastLogin: null,
    courses: [
        { id: 'c1', title: 'HTML Foundations', category: 'web', progress: 0, img: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=500&q=80', desc: 'Learn the structure of web pages.' },
        { id: 'c2', title: 'CSS Mastery', category: 'web', progress: 0, img: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=500&q=80', desc: 'Style your web pages beautifully.' },
        { id: 'c3', title: 'JavaScript Basics', category: 'web', progress: 0, img: 'https://images.unsplash.com/photo-1627398240411-b04b901a1158?w=500&q=80', desc: 'Add interactivity to your sites.' },
        { id: 'c4', title: 'Python Programming', category: 'programming', progress: 0, img: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=500&q=80', desc: 'Learn one of the most popular languages.' },
        { id: 'c5', title: 'Data Structures', category: 'cs', progress: 0, img: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500&q=80', desc: 'Organize data efficiently.' },
        { id: 'c6', title: 'DBMS', category: 'cs', progress: 0, img: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&q=80', desc: 'Database Management Systems.' }
    ],
    videos: [
        { id: 'v1', title: 'HTML Crash Course', desc: '1 hour of HTML basics', completed: false, url: 'https://www.youtube.com/embed/qz0aGYrrlhU' },
        { id: 'v2', title: 'CSS Flexbox', desc: 'Master Flexbox in 30 mins', completed: false, url: 'https://www.youtube.com/embed/fYq5JZgSks0' }
    ],
    quizScores: { html: 0, css: 0, js: 0 },
    tasks: [],
    notes: [],
    attendance: { present: 0, total: 30, lastMarked: null },
    achievements: ['First Login'],
    xp: 0
};

let appState = JSON.parse(localStorage.getItem('smartEduState'));
if (!appState) {
    appState = DEFAULT_STATE;
    saveState();
} else {
    // Merge new defaults if missing
    appState = { ...DEFAULT_STATE, ...appState };
}

function saveState() {
    localStorage.setItem('smartEduState', JSON.stringify(appState));
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => document.getElementById('loading-screen').style.display = 'none', 500);
    }, 1000);

    initTheme();
    initNavigation();
    initDashboard();
    initCourses();
    initVideos();
    initPlanner();
    initNotes();
    initTracker();
    initCertificates();
    initLeaderboard();
    initTimer();
    initSearch();
    
    // Check daily streak
    checkStreak();

    // Contact Form
    document.getElementById('contact-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Message sent successfully!');
        e.target.reset();
    });
});

// ==========================================================================
// UI & NAVIGATION
// ==========================================================================

function initTheme() {
    if (appState.theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('theme-toggle').innerHTML = "<i class='bx bx-sun'></i>";
    }
    
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        if (document.body.classList.contains('dark-theme')) {
            appState.theme = 'dark';
            document.getElementById('theme-toggle').innerHTML = "<i class='bx bx-sun'></i>";
        } else {
            appState.theme = 'light';
            document.getElementById('theme-toggle').innerHTML = "<i class='bx bx-moon'></i>";
        }
        saveState();
        initChart(); // Re-render chart colors
    });
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.dataset.target) {
                e.preventDefault();
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                document.querySelectorAll(`.nav-link[data-target="${link.dataset.target}"]`).forEach(l => l.classList.add('active'));
                
                // Show section
                sections.forEach(sec => sec.classList.remove('active', 'hidden'));
                sections.forEach(sec => {
                    if(sec.id !== link.dataset.target) sec.classList.add('hidden');
                });
                document.getElementById(link.dataset.target).classList.add('active');

                // Close sidebar on mobile
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                window.scrollTo(0, 0);
            }
        });
    });

    document.getElementById('hamburger-menu').addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });

    document.getElementById('close-sidebar').addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Scroll to top
    const scrollTopBtn = document.getElementById('btn-scroll-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) scrollTopBtn.style.display = 'flex';
        else scrollTopBtn.style.display = 'none';
    });
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Start learning button
    document.getElementById('btn-start-learning')?.addEventListener('click', (e) => {
        document.querySelector('.nav-link[data-target="dashboard"]').click();
    });
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class='bx bx-check-circle' style='color: var(--secondary); font-size: 1.5rem;'></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================================================
// DASHBOARD
// ==========================================================================

function checkStreak() {
    const today = new Date().toDateString();
    if (appState.lastLogin !== today) {
        if (appState.lastLogin === new Date(Date.now() - 86400000).toDateString()) {
            appState.streak++;
        } else if (appState.lastLogin !== null) {
            appState.streak = 1;
        } else {
            appState.streak = 1; // First login
        }
        appState.lastLogin = today;
        saveState();
        showToast(`Streak updated! You are on a ${appState.streak}-day streak!`);
        checkAchievements();
    }
}

function initDashboard() {
    const quotes = [
        "The beautiful thing about learning is that no one can take it away from you.",
        "Education is the passport to the future.",
        "Learning never exhausts the mind.",
        "Procrastination makes easy things hard, hard things harder."
    ];
    document.getElementById('daily-quote').textContent = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
    document.getElementById('streak-count').textContent = appState.streak;

    // Calculate stats
    const completedCourses = appState.courses.filter(c => c.progress === 100).length;
    document.getElementById('stat-courses').textContent = completedCourses;
    document.getElementById('stat-hours').textContent = Math.floor(appState.xp / 100) + 'h';
    
    let totalQuiz = 0, quizCount = 0;
    for(let key in appState.quizScores) { totalQuiz += appState.quizScores[key]; quizCount++; }
    document.getElementById('stat-quiz-avg').textContent = Math.floor(totalQuiz / quizCount) + '%';
    
    const att = Math.floor((appState.attendance.present / appState.attendance.total) * 100);
    document.getElementById('stat-attendance').textContent = att + '%';
    document.getElementById('daily-goal-progress').style.background = `conic-gradient(var(--primary) ${att * 3.6}deg, var(--border) 0deg)`;
    document.querySelector('#daily-goal-progress .progress-value').textContent = att + '%';

    renderCalendar();
    initChart();
    renderActivity();
}

function renderActivity() {
    const list = document.getElementById('activity-list');
    list.innerHTML = '';
    const activities = [];
    if(appState.attendance.present > 0) activities.push('Marked attendance today');
    if(appState.tasks.filter(t => t.completed).length > 0) activities.push(`Completed ${appState.tasks.filter(t => t.completed).length} tasks`);
    
    if (activities.length === 0) {
        list.innerHTML = '<li class="empty-state">No recent activity.</li>';
    } else {
        activities.forEach(act => {
            list.innerHTML += `<li style="padding: 0.5rem 0; border-bottom: 1px solid var(--border);"><i class='bx bx-check'></i> ${act}</li>`;
        });
    }
}

function renderCalendar() {
    const date = new Date();
    document.getElementById('month-year').textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    const datesEl = document.getElementById('calendar-dates');
    datesEl.innerHTML = '';
    
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        const div = document.createElement('div');
        div.textContent = i;
        if (i === date.getDate()) div.classList.add('active');
        datesEl.appendChild(div);
    }
}

function initChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Simple bar chart using canvas API manually
    const width = canvas.parentElement.clientWidth;
    const height = 300;
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);
    
    const data = [20, 40, 60, 80, 50, 90, 70];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxVal = 100;
    
    const barWidth = (width / data.length) * 0.6;
    const spacing = (width / data.length) * 0.4;
    
    const isDark = document.body.classList.contains('dark-theme');
    const color = isDark ? '#3B82F6' : '#2563EB';
    const textColor = isDark ? '#94A3B8' : '#64748B';

    data.forEach((val, index) => {
        const barHeight = (val / maxVal) * (height - 40);
        const x = index * (barWidth + spacing) + spacing / 2;
        const y = height - barHeight - 20;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();
        
        ctx.fillStyle = textColor;
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x + barWidth / 2, height - 5);
    });
}

// ==========================================================================
// COURSES
// ==========================================================================

function initCourses() {
    const container = document.getElementById('course-container');
    container.innerHTML = '';
    appState.courses.forEach(course => {
        container.innerHTML += `
            <div class="course-card glass-card" data-category="${course.category}">
                <img src="${course.img}" alt="${course.title}" class="course-img">
                <div class="course-content">
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-desc">${course.desc}</p>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${course.progress}%"></div>
                    </div>
                    <button class="btn btn-primary mt-2" onclick="startCourse('${course.id}')">
                        ${course.progress === 100 ? 'Completed' : (course.progress > 0 ? 'Continue' : 'Start Learning')}
                    </button>
                </div>
            </div>
        `;
    });

    document.getElementById('course-search').addEventListener('input', filterCourses);
    document.getElementById('course-category').addEventListener('change', filterCourses);
}

function filterCourses() {
    const search = document.getElementById('course-search').value.toLowerCase();
    const cat = document.getElementById('course-category').value;
    const cards = document.querySelectorAll('.course-card');
    
    cards.forEach(card => {
        const title = card.querySelector('.course-title').textContent.toLowerCase();
        const category = card.dataset.category;
        if ((cat === 'all' || category === cat) && title.includes(search)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

window.startCourse = function(id) {
    const course = appState.courses.find(c => c.id === id);
    if(course.progress < 100) {
        course.progress = Math.min(course.progress + 25, 100);
        saveState();
        initCourses();
        initDashboard();
        showToast(`Progress saved for ${course.title}!`);
        if(course.progress === 100) checkAchievements();
    }
};

// ==========================================================================
// VIDEOS
// ==========================================================================

function initVideos() {
    const list = document.getElementById('video-list');
    list.innerHTML = '';
    appState.videos.forEach(v => {
        list.innerHTML += `
            <li class="playlist-item" onclick="loadVideo('${v.id}')">
                <img src="https://img.youtube.com/vi/${v.url.split('/').pop()}/default.jpg" alt="${v.title}">
                <div class="playlist-item-info">
                    <h4>${v.title}</h4>
                    <p>${v.desc}</p>
                </div>
            </li>
        `;
    });
}

window.loadVideo = function(id) {
    const v = appState.videos.find(x => x.id === id);
    document.getElementById('main-video-frame').src = v.url;
    document.getElementById('video-title').textContent = v.title;
    document.getElementById('video-desc').textContent = v.desc;
    document.getElementById('mark-video-complete').checked = v.completed;
    
    document.getElementById('mark-video-complete').onchange = (e) => {
        v.completed = e.target.checked;
        saveState();
        showToast(e.target.checked ? 'Lesson completed!' : 'Lesson unmarked.');
    };
};

// ==========================================================================
// QUIZ
// ==========================================================================

const quizData = {
    html: [
        { q: "What does HTML stand for?", options: ["Hyper Text Preprocessor", "Hyper Text Markup Language", "Hyper Tool Multi Language"], ans: 1 },
        { q: "Choose the correct HTML element for the largest heading:", options: ["<heading>", "<h6>", "<h1>"], ans: 2 }
    ],
    css: [
        { q: "What does CSS stand for?", options: ["Cascading Style Sheets", "Creative Style System", "Computer Style Sheets"], ans: 0 }
    ],
    js: [
        { q: "Inside which HTML element do we put the JavaScript?", options: ["<script>", "<js>", "<javascript>"], ans: 0 }
    ]
};

let currentQuiz = [];
let currentQIndex = 0;
let currentScore = 0;
let currentTopic = '';

function initQuizScore() {
    document.getElementById('highest-scores').innerHTML = `
        HTML: ${appState.quizScores.html}% | 
        CSS: ${appState.quizScores.css}% | 
        JS: ${appState.quizScores.js}%
    `;
}

window.startQuiz = function(topic) {
    currentTopic = topic;
    currentQuiz = quizData[topic];
    currentQIndex = 0;
    currentScore = 0;
    
    document.getElementById('quiz-setup').classList.add('hidden');
    document.getElementById('quiz-active').classList.remove('hidden');
    document.getElementById('quiz-title').textContent = `${topic.toUpperCase()} Quiz`;
    
    loadQuestion();
};

function loadQuestion() {
    document.getElementById('btn-next-question').disabled = true;
    document.getElementById('quiz-progress').textContent = `Question ${currentQIndex + 1} of ${currentQuiz.length}`;
    document.getElementById('quiz-progress-bar').style.width = `${((currentQIndex + 1) / currentQuiz.length) * 100}%`;
    
    const q = currentQuiz[currentQIndex];
    document.getElementById('question-text').textContent = q.q;
    
    const opts = document.getElementById('options-container');
    opts.innerHTML = '';
    q.options.forEach((opt, idx) => {
        opts.innerHTML += `<button class="option-btn" onclick="checkAnswer(${idx}, this)">${opt}</button>`;
    });
}

window.checkAnswer = function(idx, btn) {
    const q = currentQuiz[currentQIndex];
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.disabled = true);
    
    if (idx === q.ans) {
        btn.classList.add('correct');
        currentScore++;
    } else {
        btn.classList.add('wrong');
        btns[q.ans].classList.add('correct');
    }
    
    document.getElementById('btn-next-question').disabled = false;
};

document.getElementById('btn-next-question')?.addEventListener('click', () => {
    currentQIndex++;
    if (currentQIndex < currentQuiz.length) {
        loadQuestion();
    } else {
        endQuiz();
    }
});

function endQuiz() {
    document.getElementById('quiz-active').classList.add('hidden');
    document.getElementById('quiz-result').classList.remove('hidden');
    
    const percentage = Math.round((currentScore / currentQuiz.length) * 100);
    document.getElementById('final-score').textContent = percentage + '%';
    
    if (percentage > appState.quizScores[currentTopic]) {
        appState.quizScores[currentTopic] = percentage;
        saveState();
        showToast('New high score saved!');
        checkAchievements();
    }
    initDashboard();
}

document.getElementById('btn-retry-quiz')?.addEventListener('click', () => {
    document.getElementById('quiz-result').classList.add('hidden');
    document.getElementById('quiz-setup').classList.remove('hidden');
    initQuizScore();
});

// ==========================================================================
// PLANNER
// ==========================================================================

function initPlanner() {
    renderTasks('all');
    
    document.getElementById('btn-add-task').addEventListener('click', () => {
        const input = document.getElementById('task-input');
        if (input.value.trim() !== '') {
            appState.tasks.push({ id: Date.now().toString(), text: input.value, completed: false });
            input.value = '';
            saveState();
            renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
        }
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks(btn.dataset.filter);
        });
    });
}

function renderTasks(filter) {
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    
    const filtered = appState.tasks.filter(t => {
        if(filter === 'active') return !t.completed;
        if(filter === 'completed') return t.completed;
        return true;
    });

    filtered.forEach(t => {
        list.innerHTML += `
            <li class="task-item ${t.completed ? 'completed' : ''}">
                <span class="task-text">${t.text}</span>
                <div class="task-actions">
                    <button class="icon-btn" onclick="toggleTask('${t.id}')">
                        <i class='bx ${t.completed ? 'bx-undo' : 'bx-check'}'></i>
                    </button>
                    <button class="icon-btn" onclick="deleteTask('${t.id}')">
                        <i class='bx bx-trash' style="color: var(--danger)"></i>
                    </button>
                </div>
            </li>
        `;
    });
}

window.toggleTask = function(id) {
    const task = appState.tasks.find(t => t.id === id);
    task.completed = !task.completed;
    saveState();
    renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
};

window.deleteTask = function(id) {
    appState.tasks = appState.tasks.filter(t => t.id !== id);
    saveState();
    renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
};

// ==========================================================================
// NOTES
// ==========================================================================

let activeNoteId = null;

function initNotes() {
    renderNotesList();
    
    document.getElementById('btn-new-note').addEventListener('click', () => {
        activeNoteId = null;
        document.getElementById('note-title').value = '';
        document.getElementById('note-content').value = '';
        document.getElementById('btn-delete-note').style.display = 'none';
        document.querySelectorAll('.note-item').forEach(n => n.classList.remove('active'));
    });

    document.getElementById('btn-save-note').addEventListener('click', () => {
        const title = document.getElementById('note-title').value || 'Untitled Note';
        const content = document.getElementById('note-content').value;
        
        if (activeNoteId) {
            const note = appState.notes.find(n => n.id === activeNoteId);
            note.title = title;
            note.content = content;
        } else {
            const newNote = { id: Date.now().toString(), title, content, date: new Date().toLocaleDateString() };
            appState.notes.push(newNote);
            activeNoteId = newNote.id;
        }
        
        saveState();
        renderNotesList();
        showToast('Note saved successfully!');
    });

    document.getElementById('btn-delete-note').addEventListener('click', () => {
        if (activeNoteId) {
            appState.notes = appState.notes.filter(n => n.id !== activeNoteId);
            saveState();
            document.getElementById('btn-new-note').click();
            renderNotesList();
            showToast('Note deleted.');
        }
    });

    document.getElementById('notes-search').addEventListener('input', (e) => {
        renderNotesList(e.target.value.toLowerCase());
    });
}

function renderNotesList(search = '') {
    const list = document.getElementById('notes-list');
    list.innerHTML = '';
    
    appState.notes.filter(n => n.title.toLowerCase().includes(search) || n.content.toLowerCase().includes(search)).forEach(n => {
        const li = document.createElement('li');
        li.className = `note-item ${n.id === activeNoteId ? 'active' : ''}`;
        li.innerHTML = `
            <div class="note-item-title">${n.title}</div>
            <div class="note-item-preview">${n.content.substring(0, 30)}...</div>
        `;
        li.onclick = () => loadNote(n.id);
        list.appendChild(li);
    });
}

function loadNote(id) {
    activeNoteId = id;
    const note = appState.notes.find(n => n.id === id);
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-content').value = note.content;
    document.getElementById('btn-delete-note').style.display = 'inline-flex';
    renderNotesList();
}

// ==========================================================================
// TRACKER & CERTIFICATES
// ==========================================================================

function initTracker() {
    updateTrackerUI();
    
    document.getElementById('btn-mark-attendance').addEventListener('click', () => {
        const today = new Date().toDateString();
        if (appState.attendance.lastMarked !== today) {
            appState.attendance.present++;
            appState.attendance.lastMarked = today;
            appState.xp += 10;
            saveState();
            updateTrackerUI();
            showToast('Attendance marked for today! +10 XP');
            initDashboard();
        } else {
            showToast('Attendance already marked for today.');
        }
    });
}

function updateTrackerUI() {
    const att = Math.floor((appState.attendance.present / appState.attendance.total) * 100);
    document.getElementById('attendance-percent').textContent = att + '%';
    document.getElementById('days-present').textContent = appState.attendance.present;
    document.getElementById('attendance-circle').style.background = `conic-gradient(var(--secondary) ${att * 3.6}deg, var(--border) 0deg)`;

    const cProg = appState.courses.reduce((acc, c) => acc + c.progress, 0) / appState.courses.length;
    document.getElementById('prog-course').style.width = cProg + '%';
    
    const qProg = (appState.quizScores.html + appState.quizScores.css + appState.quizScores.js) / 3;
    document.getElementById('prog-quiz').style.width = qProg + '%';

    const tProg = appState.tasks.length > 0 ? (appState.tasks.filter(t=>t.completed).length / appState.tasks.length) * 100 : 0;
    document.getElementById('prog-tasks').style.width = tProg + '%';
}

function initCertificates() {
    const container = document.getElementById('certificates-container');
    container.innerHTML = '';
    
    const eligibleCourses = appState.courses.filter(c => c.progress === 100);
    if(eligibleCourses.length > 0) {
        eligibleCourses.forEach(c => {
            container.innerHTML += `
                <div class="cert-card glass-card" onclick="showCertificate('${c.title}')">
                    <i class='bx bx-award'></i>
                    <h3 class="mt-2">${c.title}</h3>
                    <p class="text-muted">Completed on ${new Date().toLocaleDateString()}</p>
                </div>
            `;
        });
    } else {
        container.innerHTML = '<div class="empty-state w-100 text-center">No certificates earned yet. Complete a course to earn one!</div>';
    }

    const modal = document.getElementById('cert-modal');
    document.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if(e.target == modal) modal.style.display = 'none'; }
}

window.showCertificate = function(courseName) {
    document.getElementById('cert-student-name').textContent = appState.user.name;
    document.getElementById('cert-course-name').textContent = courseName;
    document.getElementById('cert-date').textContent = new Date().toLocaleDateString();
    document.getElementById('cert-modal').style.display = 'block';
};

// ==========================================================================
// LEADERBOARD & ACHIEVEMENTS
// ==========================================================================

function checkAchievements() {
    const badges = [
        { id: 'Course Completed', cond: () => appState.courses.some(c => c.progress === 100) },
        { id: 'Quiz Master', cond: () => Object.values(appState.quizScores).some(s => s >= 80) },
        { id: '5-Day Streak', cond: () => appState.streak >= 5 },
        { id: 'Fast Learner', cond: () => appState.xp > 100 }
    ];

    badges.forEach(b => {
        if (!appState.achievements.includes(b.id) && b.cond()) {
            appState.achievements.push(b.id);
            showToast(`Achievement Unlocked: ${b.id} 🏆`);
            saveState();
        }
    });
    initLeaderboard();
}

function initLeaderboard() {
    // Badges
    const badgeContainer = document.getElementById('badges-container');
    badgeContainer.innerHTML = '';
    const allBadges = [
        { id: 'First Login', icon: 'bx-user-check' },
        { id: 'Course Completed', icon: 'bx-book-reader' },
        { id: 'Quiz Master', icon: 'bx-brain' },
        { id: '5-Day Streak', icon: 'bxs-flame' },
        { id: 'Fast Learner', icon: 'bx-rocket' }
    ];

    allBadges.forEach(b => {
        const unlocked = appState.achievements.includes(b.id);
        badgeContainer.innerHTML += `
            <div class="badge-item ${unlocked ? 'unlocked' : ''}" title="${b.id}">
                <i class='bx ${b.icon}'></i>
                <p style="font-size: 0.8rem">${b.id}</p>
            </div>
        `;
    });

    // Mock Leaderboard mixed with current user
    const tb = document.getElementById('leaderboard-body');
    const dummyData = [
        { name: 'Alice Walker', xp: 500 },
        { name: 'Bob Smith', xp: 450 },
        { name: 'Charlie Davis', xp: 300 }
    ];
    dummyData.push({ name: appState.user.name, xp: appState.xp });
    dummyData.sort((a,b) => b.xp - a.xp);

    tb.innerHTML = '';
    dummyData.forEach((d, i) => {
        tb.innerHTML += `
            <tr style="${d.name === appState.user.name ? 'font-weight: bold; background: rgba(37,99,235,0.1);' : ''}">
                <td>#${i + 1}</td>
                <td>${d.name}</td>
                <td>${d.xp} XP</td>
            </tr>
        `;
    });
}

// ==========================================================================
// TIMER
// ==========================================================================

let timerInterval;
let timeLeft = 25 * 60;
let isTimerRunning = false;

function initTimer() {
    const display = document.getElementById('time-display');
    const startBtn = document.getElementById('btn-timer-start');
    const resetBtn = document.getElementById('btn-timer-reset');
    
    function updateDisplay() {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        display.textContent = `${m}:${s}`;
    }

    startBtn.addEventListener('click', () => {
        if(isTimerRunning) {
            clearInterval(timerInterval);
            startBtn.textContent = 'Start';
            isTimerRunning = false;
        } else {
            timerInterval = setInterval(() => {
                if(timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                } else {
                    clearInterval(timerInterval);
                    showToast('Timer completed!');
                    startBtn.textContent = 'Start';
                    isTimerRunning = false;
                }
            }, 1000);
            startBtn.textContent = 'Pause';
            isTimerRunning = true;
        }
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
        startBtn.textContent = 'Start';
        timeLeft = document.getElementById('tab-pomodoro').classList.contains('active') ? 25 * 60 : 5 * 60;
        updateDisplay();
    });

    document.getElementById('tab-pomodoro').addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        timeLeft = 25 * 60;
        resetBtn.click();
    });
    
    document.getElementById('tab-short-break').addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        timeLeft = 5 * 60;
        resetBtn.click();
    });
}

// ==========================================================================
// SEARCH SYSTEM
// ==========================================================================

function initSearch() {
    const searchInput = document.getElementById('global-search');
    const resultsDiv = document.getElementById('search-results');

    searchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        if(val.length < 2) {
            resultsDiv.classList.add('hidden');
            return;
        }

        let results = [];
        // Search courses
        appState.courses.forEach(c => {
            if(c.title.toLowerCase().includes(val)) results.push({ type: 'Course', name: c.title, target: 'courses' });
        });
        // Search notes
        appState.notes.forEach(n => {
            if(n.title.toLowerCase().includes(val)) results.push({ type: 'Note', name: n.title, target: 'notes' });
        });

        if(results.length > 0) {
            resultsDiv.innerHTML = results.map(r => `
                <div class="search-result-item" onclick="document.querySelector('.nav-link[data-target=\\'${r.target}\\']').click(); document.getElementById('search-results').classList.add('hidden');">
                    <small style="color:var(--primary)">${r.type}</small><br>${r.name}
                </div>
            `).join('');
            resultsDiv.classList.remove('hidden');
        } else {
            resultsDiv.innerHTML = '<div class="search-result-item">No results found</div>';
            resultsDiv.classList.remove('hidden');
        }
    });

    // Close search results on click outside
    document.addEventListener('click', (e) => {
        if(!e.target.closest('.nav-search')) resultsDiv.classList.add('hidden');
    });
}
