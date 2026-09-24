import { createClient } from '@supabase/supabase-js'

function getEnv(key) {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        return import.meta.env[key]
    }
    if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
        return window.__ENV__[key]
    }
    return ''
}

const supabaseUrl = getEnv('VITE_SUPABASE_URL')
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY')

let supabase = null
if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: true }
    })
}

export { supabase }
export default supabase
