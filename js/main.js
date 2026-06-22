/* ==========================================================================
   Expedia Android SDE-2 Interview Prep Handbook - Main JS Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Theme Management (Light / Dark)
    // ----------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const hljsThemeDark = document.getElementById('hljs-theme-dark');
    const hljsThemeLight = document.getElementById('hljs-theme-light');

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.querySelector('meta[name="color-scheme"]').content = theme;

        if (theme === 'dark') {
            hljsThemeDark.disabled = false;
            hljsThemeLight.disabled = true;
        } else {
            hljsThemeDark.disabled = true;
            hljsThemeLight.disabled = false;
        }
        localStorage.setItem('color-scheme', theme);
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
    });

    // React to system color scheme shifts
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('color-scheme') === 'system' || !localStorage.getItem('color-scheme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });


    // ----------------------------------------------------
    // 2. Responsive Sidebar (Mobile Drawer)
    // ----------------------------------------------------
    const hamburgerBtn = document.getElementById('hamburger-menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('sidebar');

    function openSidebar() {
        sidebar.classList.add('open');
        hamburgerBtn.classList.add('active');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        hamburgerBtn.classList.remove('active');
    }

    hamburgerBtn.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    closeSidebarBtn.addEventListener('click', closeSidebar);


    // ----------------------------------------------------
    // 3. SPA Routing
    // ----------------------------------------------------
    const contentArea = document.getElementById('content-area');
    const navLinks = document.querySelectorAll('.nav-link');

    // Section configurations for metadata calculation
    const sectionConfigs = {
        'r1-kotlin': { title: 'Kotlin Fundamentals', path: 'sections/r1-kotlin.html', count: 24 },
        'r1-android': { title: 'Android Fundamentals', path: 'sections/r1-android.html', count: 13 },
        'r1-coroutines': { title: 'Coroutines Deep Dive', path: 'sections/r1-coroutines.html', count: 10 },
        'r1-reactive': { title: 'Reactive Programming', path: 'sections/r1-reactive.html', count: 8 },
        'r2-solution-design': { title: 'Solution Design', path: 'sections/r2-solution-design.html', count: 4 },
        'r2-live-coding': { title: 'Live Coding Problems', path: 'sections/r2-live-coding.html', count: 6 },
        'r2-testing': { title: 'Code Testability', path: 'sections/r2-testing.html', count: 5 },
        'r2-clean-code': { title: 'Clean Code Patterns', path: 'sections/r2-clean-code.html', count: 6 },
        'questions': { title: '60Q Practice Bank', path: 'sections/questions.html', count: 1 }
    };

    async function loadRoute() {
        const hash = window.location.hash.replace('#', '') || 'intro';

        // Update active nav links
        navLinks.forEach(link => {
            if (link.getAttribute('data-section') === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Close sidebar on mobile drawer menu links click
        if (window.innerWidth <= 1024) {
            closeSidebar();
        }

        if (hash === 'intro') {
            renderIntro();
            return;
        }

        const config = sectionConfigs[hash];
        if (!config) {
            contentArea.innerHTML = `<div class="no-results"><h2>404 Section Not Found</h2><p>The requested handbook section does not exist.</p></div>`;
            return;
        }

        contentArea.innerHTML = `<div class="no-results"><p>Loading section content...</p></div>`;

        try {
            const response = await fetch(config.path);
            if (!response.ok) throw new Error('Failed to load file');
            const html = await response.text();

            contentArea.innerHTML = html;

            // Format Syntax Highlighting
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });

            // Initialize page interactions & state restoration
            initLoadedPage(hash);

            // Scroll to top
            window.scrollTo(0, 0);

        } catch (error) {
            console.error(error);
            contentArea.innerHTML = `
                <div class="no-results">
                    <h2>Error Loading Content</h2>
                    <p>Could not fetch the section content. Please check your file permissions or web server connection.</p>
                </div>`;
        }
    }

    function renderIntro() {
        contentArea.innerHTML = `
            <div class="intro-placeholder">
                <div class="intro-glass-card">
                    <h1>Expedia Android SDE-2 Interview Prep</h1>
                    <p class="intro-subtitle">Structured prep handbook targeting 3-5 years senior/mid engineering expectations at Expedia.</p>
                    
                    <div class="intro-rounds-grid">
                        <div class="intro-round-card">
                            <h3>Round 1: Tech & Internals</h3>
                            <ul>
                                <li>Kotlin Compiler & JVM/ART translation</li>
                                <li>Android System Architecture & Framework internals</li>
                                <li>Coroutines structured concurrency & execution pools</li>
                                <li>Reactive Stream contracts & StateFlow vs LiveData</li>
                            </ul>
                            <a href="#r1-kotlin" class="btn btn-primary start-btn">Start R1 Prep</a>
                        </div>
                        <div class="intro-round-card">
                            <h3>Round 2: Architecture & Live Code</h3>
                            <ul>
                                <li>Solution Design: Travel-relevant offline-first architectures</li>
                                <li>Live Coding: Advanced async and concurrent Kotlin constructs</li>
                                <li>Code Testability: Flow, Coroutine, and DB testing</li>
                                <li>Clean Code: SOLID applied to Android architecture</li>
                            </ul>
                            <a href="#r2-solution-design" class="btn btn-secondary start-btn">Start R2 Prep</a>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    window.addEventListener('hashchange', loadRoute);
    // Initial Route Trigger
    loadRoute();


    // ----------------------------------------------------
    // 4. Progress and Checkbox Persister
    // ----------------------------------------------------
    const sectionCheckboxes = document.querySelectorAll('.sidebar-nav .section-chk');

    // Handle clicks directly on sidebar section checkboxes (parent-child linkage)
    sectionCheckboxes.forEach(chk => {
        const sectionId = chk.getAttribute('data-section');

        // Initial state loading for sidebar
        const isCompleted = localStorage.getItem(`section-complete-${sectionId}`) === 'true';
        chk.checked = isCompleted;

        chk.addEventListener('change', (e) => {
            const checked = e.target.checked;
            localStorage.setItem(`section-complete-${sectionId}`, checked);

            // If section is R1 or R2 content, toggle all internal topics accordingly
            const config = sectionConfigs[sectionId];
            if (config && sectionId !== 'questions') {
                for (let i = 1; i <= config.count; i++) {
                    localStorage.setItem(`chk-${sectionId}-t${i}`, checked);
                }

                // If we are currently viewing this section, reload the state of checkboxes
                const currentHash = window.location.hash.replace('#', '');
                if (currentHash === sectionId) {
                    const pageCheckboxes = contentArea.querySelectorAll('.topic-chk');
                    pageCheckboxes.forEach(pageChk => {
                        pageChk.checked = checked;
                    });
                }
            }
            calculateMetrics();
        });
    });

    function initLoadedPage(sectionId) {
        // Find all topic checkboxes in the loaded page
        const pageCheckboxes = contentArea.querySelectorAll('.topic-chk');
        const config = sectionConfigs[sectionId];

        if (pageCheckboxes.length > 0) {
            pageCheckboxes.forEach(chk => {
                const topicIndex = chk.getAttribute('data-topic');
                const storageKey = `chk-${sectionId}-t${topicIndex}`;

                // Restore state
                const isChecked = localStorage.getItem(storageKey) === 'true';
                chk.checked = isChecked;

                // Listen for check adjustments
                chk.addEventListener('change', () => {
                    localStorage.setItem(storageKey, chk.checked);
                    updateSectionProgressFromSubtopics(sectionId);
                });
            });
            updateSectionProgressFromSubtopics(sectionId);
        } else if (sectionId === 'questions') {
            // If we loaded the interactive question bank, trigger the filter script hooks
            initQuestionBank();
        }
    }

    function updateSectionProgressFromSubtopics(sectionId) {
        const config = sectionConfigs[sectionId];
        if (!config) return;

        let checkedCount = 0;
        for (let i = 1; i <= config.count; i++) {
            if (localStorage.getItem(`chk-${sectionId}-t${i}`) === 'true') {
                checkedCount++;
            }
        }

        const percentage = Math.round((checkedCount / config.count) * 100);

        // Update sidebar checkboxes state
        const sidebarChk = document.getElementById(`chk-${sectionId}`);
        if (sidebarChk) {
            sidebarChk.checked = (percentage === 100);
            localStorage.setItem(`section-complete-${sectionId}`, percentage === 100);
        }

        calculateMetrics();
    }

    function calculateMetrics() {
        // Calculate Round 1 completion percentage
        const r1Sections = ['r1-kotlin', 'r1-android', 'r1-coroutines', 'r1-reactive'];
        let r1Total = 0, r1Checked = 0;

        r1Sections.forEach(secId => {
            const config = sectionConfigs[secId];
            r1Total += config.count;
            for (let i = 1; i <= config.count; i++) {
                if (localStorage.getItem(`chk-${secId}-t${i}`) === 'true') {
                    r1Checked++;
                }
            }
        });
        const r1Pct = Math.round((r1Checked / r1Total) * 100) || 0;
        document.getElementById('r1-progress').innerText = `${r1Pct}%`;

        // Calculate Round 2 completion percentage
        const r2Sections = ['r2-solution-design', 'r2-live-coding', 'r2-testing', 'r2-clean-code'];
        let r2Total = 0, r2Checked = 0;

        r2Sections.forEach(secId => {
            const config = sectionConfigs[secId];
            r2Total += config.count;
            for (let i = 1; i <= config.count; i++) {
                if (localStorage.getItem(`chk-${secId}-t${i}`) === 'true') {
                    r2Checked++;
                }
            }
        });
        const r2Pct = Math.round((r2Checked / r2Total) * 100) || 0;
        document.getElementById('r2-progress').innerText = `${r2Pct}%`;

        // Calculate overall score
        const totalTopics = r1Total + r2Total;
        const totalChecked = r1Checked + r2Checked;
        const totalPct = Math.round((totalChecked / totalTopics) * 100) || 0;

        document.getElementById('total-progress-bar').style.width = `${totalPct}%`;
        document.getElementById('total-progress-text').innerText = `${totalPct}%`;
    }

    // Call metrics calculation on start
    calculateMetrics();


    // ----------------------------------------------------
    // 5. Global Search Indexer
    // ----------------------------------------------------
    const searchInput = document.getElementById('global-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearchBtn = document.getElementById('close-search-btn');
    const searchResultsList = document.getElementById('search-results-list');
    const searchResultsCount = document.getElementById('search-results-count');

    let searchIndex = [];
    let isIndexLoaded = false;

    // Load search index asynchronously
    async function buildSearchIndex() {
        if (isIndexLoaded) return;

        const docs = [];
        const promises = Object.keys(sectionConfigs).map(async (key) => {
            const config = sectionConfigs[key];
            try {
                const res = await fetch(config.path);
                if (!res.ok) return;
                const htmlText = await res.text();

                // Parse sections for topic elements
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, 'text/html');

                // Index topics cards
                const topicCards = doc.querySelectorAll('.topic-card');
                if (topicCards.length > 0) {
                    topicCards.forEach((card, idx) => {
                        const titleEl = card.querySelector('h2');
                        const bodyEl = card.querySelector('.topic-body');

                        const title = titleEl ? titleEl.textContent.trim() : config.title;
                        const bodyText = bodyEl ? bodyEl.textContent.trim() : '';
                        const id = titleEl ? titleEl.id || `topic-${idx}` : `topic-${idx}`;

                        docs.push({
                            sectionKey: key,
                            sectionTitle: config.title,
                            title: title,
                            content: bodyText,
                            anchor: id
                        });
                    });
                } else {
                    // Fallback document indexing
                    docs.push({
                        sectionKey: key,
                        sectionTitle: config.title,
                        title: config.title,
                        content: doc.body.textContent,
                        anchor: ''
                    });
                }
            } catch (e) {
                console.error(`Failed to index: ${config.path}`, e);
            }
        });

        // Also fetch data/questions.json for question bank search
        const questionsPromise = (async () => {
            try {
                const res = await fetch('data/questions.json');
                if (res.ok) {
                    const list = await res.json();
                    list.forEach(q => {
                        docs.push({
                            sectionKey: 'questions',
                            sectionTitle: 'Question Bank',
                            title: `Q: ${q.question}`,
                            content: `Category: ${q.category}. Diff: ${q.difficulty}. A: ${q.answer}. Followup: ${q.followUp}. Mistake: ${q.commonMistake}`,
                            anchor: `q-${q.id}`
                        });
                    });
                }
            } catch (e) {
                console.error('Failed to index questions.json', e);
            }
        })();

        await Promise.all([...promises, questionsPromise]);
        searchIndex = docs;
        isIndexLoaded = true;
    }

    function performSearch(query) {
        if (!query) {
            closeSearch();
            return;
        }

        buildSearchIndex().then(() => {
            const cleanQuery = query.toLowerCase().trim();
            const results = searchIndex.filter(doc => {
                return doc.title.toLowerCase().includes(cleanQuery) ||
                    doc.content.toLowerCase().includes(cleanQuery) ||
                    doc.sectionTitle.toLowerCase().includes(cleanQuery);
            });

            renderSearchResults(results, cleanQuery);
        });
    }

    function renderSearchResults(results, query) {
        searchOverlay.style.display = 'flex';
        searchResultsCount.innerText = results.length;
        searchResultsList.innerHTML = '';

        if (results.length === 0) {
            searchResultsList.innerHTML = `<div class="no-results"><p>No matches found for "${escapeHTML(query)}". Try other keywords.</p></div>`;
            return;
        }

        results.forEach(doc => {
            const item = document.createElement('div');
            item.className = 'search-result-item';

            // Create highlighted snippet
            let snippet = doc.content;
            const index = snippet.toLowerCase().indexOf(query);
            if (index !== -1) {
                const start = Math.max(0, index - 60);
                const end = Math.min(snippet.length, index + query.length + 80);
                snippet = (start > 0 ? '...' : '') + snippet.substring(start, end) + (end < snippet.length ? '...' : '');
            } else {
                snippet = snippet.substring(0, 140) + (snippet.length > 140 ? '...' : '');
            }

            // Highlight target word
            const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
            const highlightedTitle = doc.title.replace(regex, '<mark>$1</mark>');
            const highlightedSnippet = escapeHTML(snippet).replace(regex, '<mark>$1</mark>');

            item.innerHTML = `
                <div class="search-result-category">${doc.sectionTitle}</div>
                <div class="search-result-title">${highlightedTitle}</div>
                <div class="search-result-snippet">${highlightedSnippet}</div>
            `;

            item.addEventListener('click', () => {
                closeSearch();
                window.location.hash = `#${doc.sectionKey}`;
                // Let page render, then scroll to anchor
                setTimeout(() => {
                    if (doc.anchor) {
                        const targetEl = document.getElementById(doc.anchor);
                        if (targetEl) {
                            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            targetEl.classList.add('pulse-highlight');
                            setTimeout(() => targetEl.classList.remove('pulse-highlight'), 2000);
                        }
                    }
                }, 300);
            });

            searchResultsList.appendChild(item);
        });
    }

    function closeSearch() {
        searchOverlay.style.display = 'none';
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query) {
            clearSearchBtn.style.display = 'block';
            performSearch(query);
        } else {
            closeSearch();
        }
    });

    clearSearchBtn.addEventListener('click', closeSearch);
    closeSearchBtn.addEventListener('click', closeSearch);

    // ESC closes search
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearch();
    });


    // ----------------------------------------------------
    // 6. Interactive Question Bank Renderer (Loaded dynamically)
    // ----------------------------------------------------
    let allQuestions = [];
    let activeCategory = 'all';
    let activeRound = 'all';
    let activeDifficulty = 'all';
    let questionsSearchQuery = '';

    function initQuestionBank() {
        fetch('data/questions.json')
            .then(res => {
                if (!res.ok) throw new Error('Questions file missing');
                return res.json();
            })
            .then(data => {
                allQuestions = data;
                renderQuestions();
                setupQuestionFilters();
            })
            .catch(err => {
                console.error(err);
                const grid = document.getElementById('questions-grid');
                if (grid) {
                    grid.innerHTML = `<div class="no-results"><p>Failed to load practice questions database. Make sure data/questions.json is successfully generated.</p></div>`;
                }
            });
    }

    function setupQuestionFilters() {
        const categoryChips = document.querySelectorAll('.questions-filter-bar .filter-chip');
        const roundChips = document.querySelectorAll('.round-filter .filter-chip');
        const diffBtns = document.querySelectorAll('.difficulty-toggle .diff-btn');
        const qSearch = document.getElementById('question-search');

        // Categories
        categoryChips.forEach(chip => {
            chip.addEventListener('click', () => {
                categoryChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                activeCategory = chip.getAttribute('data-category');
                renderQuestions();
            });
        });

        // Rounds
        roundChips.forEach(chip => {
            chip.addEventListener('click', () => {
                roundChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                activeRound = chip.getAttribute('data-round');
                renderQuestions();
            });
        });

        // Difficulties
        diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                diffBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeDifficulty = btn.getAttribute('data-diff');
                renderQuestions();
            });
        });

        // Text filter
        if (qSearch) {
            qSearch.addEventListener('input', (e) => {
                questionsSearchQuery = e.target.value.toLowerCase().trim();
                renderQuestions();
            });
        }
    }

    function renderQuestions() {
        const grid = document.getElementById('questions-grid');
        if (!grid) return;

        const filtered = allQuestions.filter(q => {
            const matchesRound = activeRound === 'all' || q.round === activeRound;
            const matchesCategory = activeCategory === 'all' || q.category.toLowerCase() === activeCategory.toLowerCase();
            const matchesDiff = activeDifficulty === 'all' || q.difficulty === activeDifficulty;

            const matchesSearch = !questionsSearchQuery ||
                q.question.toLowerCase().includes(questionsSearchQuery) ||
                q.answer.toLowerCase().includes(questionsSearchQuery) ||
                q.category.toLowerCase().includes(questionsSearchQuery);

            return matchesRound && matchesCategory && matchesDiff && matchesSearch;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="no-results"><p>No questions match your filter criteria.</p></div>`;
            return;
        }

        grid.innerHTML = '';
        filtered.forEach(q => {
            const card = document.createElement('article');
            card.className = 'question-card';
            card.id = `q-${q.id}`;

            const diffClass = q.difficulty === 'senior' ? 'senior' : 'mid';
            const diffLabel = q.difficulty === 'senior' ? 'Senior SDE-2' : 'Mid SDE-2';

            card.innerHTML = `
                <div class="q-header">
                    <div class="q-tags">
                        <span class="q-tag round-tag">${q.round}</span>
                        <span class="q-tag category-tag">${q.category}</span>
                        <span class="q-tag difficulty-tag ${diffClass}">${diffLabel}</span>
                    </div>
                </div>
                <div class="q-body">
                    <h3>${escapeHTML(q.question)}</h3>
                    <button class="expandable-trigger" aria-expanded="false" data-target="details-${q.id}">Show Prep Details</button>
                    
                    <div class="expandable-content" id="details-${q.id}">
                        <div class="q-details">
                            <div class="qa-block">
                                <div class="qa-label answer">✓ Suggested Answer</div>
                                <div class="qa-text">${q.answer}</div>
                            </div>
                            <div class="qa-block">
                                <div class="qa-label followup">⚙ Senior Follow-Up Question</div>
                                <div class="qa-text">${q.followUp}</div>
                            </div>
                            <div class="qa-block">
                                <div class="qa-label mistake">✗ Common Candidate Mistake</div>
                                <div class="qa-text">${q.commonMistake}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Setup card expansion toggle
            const trigger = card.querySelector('.expandable-trigger');
            const content = card.querySelector('.expandable-content');

            trigger.addEventListener('click', () => {
                const isOpen = content.classList.contains('open');
                if (isOpen) {
                    content.classList.remove('open');
                    trigger.classList.remove('open');
                    trigger.innerText = 'Show Prep Details';
                    trigger.setAttribute('aria-expanded', 'false');
                } else {
                    content.classList.add('open');
                    trigger.classList.add('open');
                    trigger.innerText = 'Hide Prep Details';
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });

            grid.appendChild(card);
        });
    }

    // Helper functions
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
});
