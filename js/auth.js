// js/auth.js - Native Supabase Authentication

// ---- Supabase helpers ----
function getSb() {
    return window.__supabase;
}

// ---- Session management ----
let _session = null;

async function fetchSession() {
    var sb = getSb();
    if (!sb) return null;
    const { data, error } = await sb.auth.getSession();
    if (error) {
        console.error('Error fetching session:', error);
        return null;
    }
    _session = data.session;
    return _session;
}

function getSessionUser() {
    // Supabase auth user object structure
    if (!_session || !_session.user) return null;
    
    // Map it slightly to match what admin.html expects
    return {
        id: _session.user.id,
        email: _session.user.email,
        username: _session.user.email.split('@')[0],
        role: 'admin' // By default since only admins have logins in this project
    };
}

function isLoggedIn() {
    return !!_session;
}

function setRememberedLogin(email, rememberMe) {
    if (rememberMe) {
        localStorage.setItem('novacare_admin_remember_email', email || '');
        localStorage.setItem('novacare_admin_remember_me', 'true');
    } else {
        localStorage.removeItem('novacare_admin_remember_email');
        localStorage.removeItem('novacare_admin_remember_me');
    }
}

// ---- Login / Logout ----
async function login(email, password) {
    var sb = getSb();
    if (!sb) return { error: 'قاعدة البيانات غير متصلة' };
    
    var { data, error } = await sb.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) {
        let msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        if (error.message.includes('Invalid login credentials')) {
            msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        } else {
            msg = error.message;
        }
        return { error: msg };
    }
    
    _session = data.session;
    return { user: getSessionUser() };
}

async function logout() {
    var sb = getSb();
    if (sb) {
        await sb.auth.signOut();
        _session = null;
    }
}

// Remove the old CRUD so admin.html doesn't call them successfully
window.auth = {
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    getSessionUser: getSessionUser,
    setRememberedLogin: setRememberedLogin,
    fetchSession: fetchSession
};

// Initialize auth state as soon as Supabase is ready
document.addEventListener('DOMContentLoaded', () => {
    const checkSb = setInterval(async () => {
        var sb = getSb();
        if (sb) {
            clearInterval(checkSb);
            await fetchSession();
            
            // Listen to changes
            sb.auth.onAuthStateChange((event, session) => {
                _session = session;
                if (event === 'SIGNED_OUT') {
                    window.location.reload();
                }
            });
            
            // Trigger a custom event so admin.html knows it can proceed checking auth
            window.dispatchEvent(new Event('supabase_auth_ready'));
        }
    }, 50);
});
