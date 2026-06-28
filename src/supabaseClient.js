import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fpjfoqvokidcvcmirqml.supabase.co'
const supabaseKey = 'sb_publishable_KG8PUrrQaQ108318cV7IQQ_C71fyDNy'

export const supabase = createClient(supabaseUrl, supabaseKey)
