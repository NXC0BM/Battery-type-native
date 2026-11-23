#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
    tauri::Builder::default()
        .on_page_load(|webview, _| {
            // Earlier releases registered a web PWA worker on tauri.localhost.
            // Remove that app-owned cache even when it served an older index.html.
            let _ = webview.eval(r#"
                (async () => {
                    if (location.hostname !== 'tauri.localhost' || window.__batteryNativeCacheMigration) return;
                    window.__batteryNativeCacheMigration = true;
                    if (!('serviceWorker' in navigator)) return;
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    const owned = registrations.filter(r => new URL(r.scope).origin === location.origin);
                    if (!owned.length) return;
                    await Promise.all(owned.map(r => r.unregister()));
                    const keys = await caches.keys();
                    await Promise.all(keys.filter(k => k.startsWith('workbox-')).map(k => caches.delete(k)));
                    location.reload();
                })().catch(console.error);
            "#);
        })
        .run(tauri::generate_context!())
        .expect("battery_type native failed");
}
