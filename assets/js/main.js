/**
 * GitHub Profile Data Fetcher
 */

const GITHUB_USER = 'wl102';
const API_BASE = 'https://api.github.com';

// Language colors (GitHub-like)
const LANG_COLORS = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Vue: '#41b883',
    React: '#61dafb',
    Svelte: '#ff3e00',
    default: '#8b949e'
};

function getLangColor(lang) {
    return LANG_COLORS[lang] || LANG_COLORS.default;
}

function formatNumber(n) {
    if (n >= 1000) {
        return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return String(n);
}

async function fetchUser() {
    try {
        const res = await fetch(`${API_BASE}/users/${GITHUB_USER}`);
        if (!res.ok) throw new Error('Failed to fetch user');
        return await res.json();
    } catch (e) {
        console.error('Fetch user error:', e);
        return null;
    }
}

async function fetchRepos() {
    try {
        const res = await fetch(`${API_BASE}/users/${GITHUB_USER}/repos?sort=updated&per_page=6`);
        if (!res.ok) throw new Error('Failed to fetch repos');
        return await res.json();
    } catch (e) {
        console.error('Fetch repos error:', e);
        return [];
    }
}

function renderRepos(repos) {
    const grid = document.getElementById('projects-grid');
    if (!repos.length) {
        grid.innerHTML = '<div class="project-skeleton">暂无公开项目</div>';
        return;
    }

    grid.innerHTML = repos.map(repo => `
        <a href="${repo.html_url}" target="_blank" rel="noopener" class="project-card">
            <div class="project-info">
                <div class="project-name">${escapeHtml(repo.name)}</div>
                <div class="project-desc">${escapeHtml(repo.description || '无描述')}</div>
            </div>
            <div class="project-meta">
                ${repo.language ? `
                    <span class="project-lang">
                        <span class="lang-dot" style="background:${getLangColor(repo.language)}"></span>
                        ${escapeHtml(repo.language)}
                    </span>
                ` : ''}
                <span class="project-stars">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                    ${formatNumber(repo.stargazers_count)}
                </span>
            </div>
        </a>
    `).join('');
}

function renderStats(repos) {
    const repoCount = repos.length;
    const starCount = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

    const repoEl = document.getElementById('repo-count');
    const starEl = document.getElementById('star-count');
    if (repoEl) repoEl.textContent = formatNumber(repoCount);
    if (starEl) starEl.textContent = formatNumber(starCount);
}

function renderUser(user) {
    if (!user) return;

    const bioEl = document.getElementById('bio');
    const avatarEl = document.getElementById('avatar');

    if (bioEl && user.bio) {
        bioEl.textContent = user.bio;
    }
    if (avatarEl && user.avatar_url) {
        avatarEl.src = user.avatar_url;
        avatarEl.alt = user.login || 'avatar';
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

// Initialize
(async function init() {
    const [user, repos] = await Promise.all([
        fetchUser(),
        fetchRepos()
    ]);

    renderUser(user);
    renderRepos(repos);
    renderStats(repos);
})();
