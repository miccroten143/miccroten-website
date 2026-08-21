import { supabase } from '../Admin/lib/supabase';

export interface IgnitionUid {
  id: number;
  uid: string;
  status: 'available' | 'registered';
  created_at: string;
  registered_at: string | null;
}

export type UidVerificationResult =
  | { valid: true; uid: string }
  | { valid: false; reason: 'not_found' | 'already_registered' };

export async function verifyUid(uid: string): Promise<UidVerificationResult> {
  const { data, error } = await supabase
    .from('ignition_uids')
    .select('uid, status')
    .eq('uid', uid.trim())
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    return { valid: false, reason: 'not_found' };
  }

  if (data.status === 'registered') {
    return { valid: false, reason: 'already_registered' };
  }

  return { valid: true, uid: data.uid };
}

export interface RegistrationParams {
  uid: string;
  full_name: string;
  project_name: string;
  email: string;
  phone: string;
  role: string;
  college_company: string;
  department?: string;
  source: string;
}

export async function registerParticipant(
  params: RegistrationParams
): Promise<{ success: boolean; registrationId?: string; error?: string }> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ignition-register`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    return { success: false, error: data.error || 'Registration failed' };
  }

  return { success: true, registrationId: data.registration_id };
}

function generateUidString(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 10; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MT${suffix}`;
}

export async function generateUniqueUid(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const uid = generateUidString();
    const { data, error } = await supabase
      .from('ignition_uids')
      .select('uid')
      .eq('uid', uid)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const { error: insertErr } = await supabase
        .from('ignition_uids')
        .insert({ uid, status: 'available' });

      if (insertErr) {
        continue;
      }

      return uid;
    }
  }

  throw new Error('Failed to generate a unique UID after 20 attempts');
}

export async function fetchAllUids(): Promise<IgnitionUid[]> {
  const { data, error } = await supabase
    .from('ignition_uids')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchIgnitionStats(): Promise<{
  total: number;
  available: number;
  registered: number;
}> {
  const { data, error } = await supabase
    .from('ignition_uids')
    .select('status');

  if (error) throw error;

  const rows = data ?? [];
  return {
    total: rows.length,
    available: rows.filter((r) => r.status === 'available').length,
    registered: rows.filter((r) => r.status === 'registered').length,
  };
}
