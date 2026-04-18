import { supabase } from './supabaseClient';

const BUCKET = 'resources';

/**
 * Uploads a resource image to Supabase Storage.
 * Returns the public URL of the uploaded file.
 * @param {File} file
 * @returns {Promise<string>} public URL
 */
export const uploadResourceImage = async (file) => {
    const ext      = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path     = `resources/${fileName}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
};

/**
 * Deletes an image from Supabase Storage given its full public URL.
 * @param {string} publicUrl
 */
export const deleteResourceImage = async (publicUrl) => {
    try {
        const marker = `/object/public/${BUCKET}/`;
        const idx    = publicUrl.indexOf(marker);
        if (idx === -1) return;
        const path = publicUrl.slice(idx + marker.length);
        await supabase.storage.from(BUCKET).remove([path]);
    } catch (_) { /* best-effort */ }
};

/**
 * Uploads multiple ticket attachment files to Supabase Storage.
 * Returns an array of public URLs.
 * @param {File[]} files
 * @returns {Promise<string[]>} public URLs
 */
export const uploadTicketAttachments = async (files) => {
    const urls = [];
    for (const file of files) {
        const ext      = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const path     = `tickets/${fileName}`;

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, { cacheControl: '3600', upsert: false });

        if (error) throw new Error(`Upload failed: ${error.message}`);

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        urls.push(data.publicUrl);
    }
    return urls;
};

