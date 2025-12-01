import { supabase } from './supabaseClient'

export async function syncUser() {
  const { data } = await supabase.auth.getUser()
  const user = data?.user
  if (!user) return

  await supabase.from('users').upsert({
    auth_id: user.id,
    email: user.email,
    display_name: user.user_metadata?.full_name ?? null
  }, { onConflict: 'auth_id' })
}
