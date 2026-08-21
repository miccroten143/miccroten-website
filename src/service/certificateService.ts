import { supabase } from "../Admin/lib/supabase";
import type { Certificate, InternCertificate, InternCertificateInput } from "../ecommerce/types";

export async function getCertificate(certificateNo: string): Promise<Certificate | null> {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("certificate_no", certificateNo)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function getInternCertificate(
  certificateNumber: string
): Promise<InternCertificate | null> {
  const { data, error } = await supabase
    .from("intern_certificates")
    .select("*")
    .eq("certificate_number", certificateNumber.trim())
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function fetchInternCertificates(): Promise<InternCertificate[]> {
  const { data, error } = await supabase
    .from("intern_certificates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createInternCertificate(
  input: InternCertificateInput
): Promise<InternCertificate> {
  const { data, error } = await supabase
    .from("intern_certificates")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateInternCertificate(
  id: string,
  updates: Partial<InternCertificateInput>
): Promise<InternCertificate> {
  const { data, error } = await supabase
    .from("intern_certificates")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteInternCertificate(id: string): Promise<void> {
  const { error } = await supabase.from("intern_certificates").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadCertificateImage(
  file: File,
  folder: "intern-photos" | "certificates"
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const { error } = await supabase.storage
    .from("certificate-images")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("certificate-images").getPublicUrl(fileName);
  return data.publicUrl;
}
