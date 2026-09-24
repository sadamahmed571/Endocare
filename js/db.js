// js/db.js - Cloud Database (Supabase Only)
// All methods are asynchronous and interact directly with Supabase

function mapToTable(row) {
    if (!row) return row;
    var obj = {};
    for (var k in row) {
        var camel = k.replace(/_([a-z])/g, function(g) { return g[1].toUpperCase(); });
        obj[camel] = row[k];
    }
    return obj;
}

function mapFromTable(obj) {
    var row = {};
    for (var k in obj) {
        var snake = k.replace(/[A-Z]/g, function(c) { return '_' + c.toLowerCase(); });
        row[snake] = obj[k];
    }
    return row;
}

function mapArrayToTable(rows) {
    if (!rows) return [];
    return rows.map(mapToTable);
}

function getSupabase() {
    return window.__supabase || null;
}

var _supabaseReady = false;
var _pendingInitCallbacks = [];

function initSupabase() {
    if (_supabaseReady) return;
    var sb = getSupabase();
    if (!sb) {
        document.addEventListener('DOMContentLoaded', function() {
            if (window.__supabase) {
                _supabaseReady = true;
                _notifyInitCallbacks();
            }
        });
    } else {
        _supabaseReady = true;
        _notifyInitCallbacks();
    }
}

function _notifyInitCallbacks() {
    for (var i = 0; i < _pendingInitCallbacks.length; i++) {
        _pendingInitCallbacks[i]();
    }
    _pendingInitCallbacks = [];
}

function onSupabaseReady(cb) {
    if (_supabaseReady) { cb(); return; }
    _pendingInitCallbacks.push(cb);
}

var _refreshListeners = {};
function _triggerRefresh(type) {
    var list = _refreshListeners[type];
    if (list) {
        for (var i = 0; i < list.length; i++) { list[i](); }
    }
}
function onRefresh(type, cb) {
    if (!_refreshListeners[type]) _refreshListeners[type] = [];
    _refreshListeners[type].push(cb);
}

var db = {
    _ready: false,
    init: function() {
        if (this._ready) return Promise.resolve();
        var self = this;
        return new Promise(function(resolve) {
            onSupabaseReady(function() {
                self._ready = true;
                resolve();
            });
            setTimeout(function() {
                if (!self._ready) {
                    self._ready = true;
                    resolve();
                }
            }, 5000);
        });
    },

    // ==================== ARTICLES ====================
    getArticles: async function() {
        var sb = getSupabase();
        if (!sb) return [];
        var res = await sb.from('articles').select('*');
        return mapArrayToTable(res.data || []);
    },
    getPublicArticles: async function() {
        var articles = await this.getArticles();
        return articles.filter(function(a) { return a.status === 'active'; });
    },
    getArticleById: async function(id) {
        var articles = await this.getArticles();
        return articles.find(function(a) { return a.id == id; });
    },
    addArticle: async function(article) {
        article.id = Date.now();
        var sb = getSupabase();
        if (sb) {
            await sb.from('articles').insert(mapFromTable(article));
            _triggerRefresh('articles');
        }
    },
    updateArticle: async function(id, updatedData) {
        var sb = getSupabase();
        if (sb) {
            await sb.from('articles').update(mapFromTable(updatedData)).eq('id', id);
            _triggerRefresh('articles');
        }
    },
    deleteArticle: async function(id) {
        var sb = getSupabase();
        if (sb) {
            await sb.from('articles').delete().eq('id', id);
            _triggerRefresh('articles');
        }
    },

    // ==================== PRODUCTS ====================
    getProducts: async function() {
        var sb = getSupabase();
        if (!sb) return [];
        var res = await sb.from('products').select('*');
        return mapArrayToTable(res.data || []);
    },
    getFeaturedProducts: async function() {
        var products = await this.getProducts();
        return products.filter(function(p) { return p.featured === 'yes' && p.status === 'نشط'; });
    },
    getProductById: async function(id) {
        var products = await this.getProducts();
        return products.find(function(p) { return p.id == id; });
    },
    addProduct: async function(product) {
        product.id = Date.now();
        var sb = getSupabase();
        if (sb) {
            await sb.from('products').insert(mapFromTable(product));
        }
    },
    updateProduct: async function(id, updatedData) {
        var sb = getSupabase();
        if (sb) {
            await sb.from('products').update(mapFromTable(updatedData)).eq('id', id);
        }
    },
    deleteProduct: async function(id) {
        var sb = getSupabase();
        if (sb) {
            await sb.from('products').delete().eq('id', id);
        }
    },

    // ==================== ORDERS ====================
    getOrders: async function() {
        var sb = getSupabase();
        if (!sb) return [];
        var res = await sb.from('orders').select('*');
        return mapArrayToTable(res.data || []);
    },
    addOrder: async function(order) {
        order.id = Date.now();
        var sb = getSupabase();
        if (sb) {
            await sb.from('orders').insert(mapFromTable(order));
        }
    },
    deleteOrder: async function(id) {
        var sb = getSupabase();
        if (sb) {
            await sb.from('orders').delete().eq('id', id);
        }
    },

    // ==================== INQUIRIES ====================
    getInquiries: async function() {
        var sb = getSupabase();
        if (!sb) return [];
        var res = await sb.from('inquiries').select('*');
        return mapArrayToTable(res.data || []);
    },
    addInquiry: async function(inquiry) {
        inquiry.id = Date.now();
        var sb = getSupabase();
        if (sb) {
            await sb.from('inquiries').insert(mapFromTable(inquiry));
        }
    },
    deleteInquiry: async function(id) {
        var sb = getSupabase();
        if (sb) {
            await sb.from('inquiries').delete().eq('id', id);
        }
    },

    // ==================== PV REPORTS ====================
    getPVReports: async function() {
        var sb = getSupabase();
        if (!sb) return [];
        var res = await sb.from('pv_reports').select('*');
        return mapArrayToTable(res.data || []);
    },
    addPVReport: async function(report) {
        report.id = Date.now();
        var sb = getSupabase();
        if (sb) {
            await sb.from('pv_reports').insert(mapFromTable(report));
        }
    },
    deletePVReport: async function(id) {
        var sb = getSupabase();
        if (sb) {
            await sb.from('pv_reports').delete().eq('id', id);
        }
    },

    // ==================== SITE SETTINGS ====================
    getSiteSettings: async function() {
        var isEnglish = window.location.pathname.includes('/en/');
        var defaultSettings = isEnglish ? {
            siteName: 'NovaCare Yemen',
            siteEmail: 'import@novacareplus.com',
            sitePhone: '+967-777967272',
            siteAddress: 'Hadda Street, Al-Barakah Commercial Building, Sana\'a',
            siteDesc: 'Your trusted partner for supplying certified medical vitamins and hormones in Yemen.',
            siteFb: 'https://facebook.com/novacare',
            siteWa: 'https://wa.me/967777967272',
            siteTg: 'https://telegram.me/novacare',
            siteLi: 'https://linkedin.com/company/novacare'
        } : {
            siteName: 'NovaCare اليمن',
            siteEmail: 'import@novacareplus.com',
            sitePhone: '+967-777967272',
            siteAddress: 'شارع حدة، مبنى البركة التجاري، صنعاء',
            siteDesc: 'شريكك الموثوق لتوريد الفيتامينات والهرمونات الطبية المعتمدة في اليمن.',
            siteFb: 'https://facebook.com/novacare',
            siteWa: 'https://wa.me/967777967272',
            siteTg: 'https://telegram.me/novacare',
            siteLi: 'https://linkedin.com/company/novacare'
        };
        var sb = getSupabase();
        if (!sb) return defaultSettings;
        var res = await sb.from('site_settings').select('*').eq('id', 1).single();
        if (!res.error && res.data) {
            return Object.assign({}, defaultSettings, mapToTable(res.data));
        }
        return defaultSettings;
    },
    saveSiteSettings: async function(settings) {
        var sb = getSupabase();
        if (sb) {
            await sb.from('site_settings').upsert(Object.assign({ id: 1 }, mapFromTable(settings)), { onConflict: 'id' });
        }
    },

    // ==================== BOT ALERTS ====================
    getBotAlerts: async function() {
        var sb = getSupabase();
        if (!sb) return [];
        var res = await sb.from('bot_alerts').select('*');
        return mapArrayToTable(res.data || []);
    },
    addBotAlert: async function(alert) {
        alert.id = Date.now();
        var sb = getSupabase();
        if (sb) {
            await sb.from('bot_alerts').insert(mapFromTable(alert));
        }
    },
    markBotAlertSeen: async function(id) {
        var sb = getSupabase();
        if (sb) {
            await sb.from('bot_alerts').update({ seen: true }).eq('id', id);
        }
    }
};

window.db = db;

initSupabase();
