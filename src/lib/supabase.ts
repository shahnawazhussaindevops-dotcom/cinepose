import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signInWithOAuth(provider: 'google' | 'apple') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

export async function uploadPhoto(file: File, userId: string) {
  const filePath = `${userId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return data;
}

export async function getPhotos(userId: string) {
  const { data, error } = await supabase.storage
    .from('photos')
    .list(userId, {
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) throw error;
  return data;
}

export async function deletePhoto(path: string) {
  const { data, error } = await supabase.storage
    .from('photos')
    .remove([path]);

  if (error) throw error;
  return data;
}

export async function deleteUserData(userId: string) {
  const { data: files } = await supabase.storage
    .from('photos')
    .list(userId);

  if (files && files.length > 0) {
    const paths = files.map(f => `${userId}/${f.name}`);
    await supabase.storage.from('photos').remove(paths);
  }

  const { error } = await supabase.rpc('delete_user_data', {
    user_id: userId,
  });

  if (error) throw error;
}
