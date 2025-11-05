// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::utils::config::BackgroundThrottlingPolicy;
use tauri::{ Emitter, WebviewUrl, WebviewWindowBuilder};

#[cfg(desktop)]
use std::path::PathBuf;

#[cfg(desktop)]
use tauri::{AppHandle, Listener, Manager, Url};

#[cfg(desktop)]
use tauri_plugin_fs::FsExt;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg(desktop)]
fn allow_dir_in_scopes(app: &AppHandle, dir: &PathBuf) {
    let fs_scope = app.fs_scope();
    let asset_protocol_scope = app.asset_protocol_scope();
    if let Err(e) = fs_scope.allow_directory(dir, true) {
        eprintln!("Failed to allow directory in fs_scope: {e}");
    } else {
        println!("Allowed directory in fs_scope: {dir:?}");
    }
    if let Err(e) = asset_protocol_scope.allow_directory(dir, true) {
        eprintln!("Failed to allow directory in asset_protocol_scope: {e}");
    } else {
        println!("Allowed directory in asset_protocol_scope: {dir:?}");
    }
}

//工具函数，它解决了命令行文件参数解析的复杂性，
//使应用能够以统一的方式处理不同格式的文件路径输入。
#[cfg(desktop)]
fn get_files_from_argv(argv: Vec<String>) -> Vec<PathBuf> {
    let mut files = Vec::new();
    // NOTICE: `args` may include URL protocol (`your-app-protocol://`)
    // or arguments (`--`) if your app supports them.
    // files may also be passed as `file://path/to/file`
    for (_, maybe_file) in argv.iter().enumerate().skip(1) {
        // skip flags like -f or --flag
        if maybe_file.starts_with("-") {
            continue;
        }
        // handle `file://` path urls and skip other urls
        if let Ok(url) = Url::parse(maybe_file) {
            if let Ok(path) = url.to_file_path() {
                files.push(path);
            } else {
                files.push(PathBuf::from(maybe_file))
            }
        } else {
            files.push(PathBuf::from(maybe_file))
        }
    }
    files
}

#[cfg(desktop)]
fn allow_file_in_scopes(app: &AppHandle, files: Vec<PathBuf>) {
    let fs_scope = app.fs_scope();
    let asset_protocol_scope = app.asset_protocol_scope();
    for file in &files {
        if let Err(e) = fs_scope.allow_file(file) {
            eprintln!("Failed to allow file in fs_scope: {e}");
        } else {
            println!("Allowed file in fs_scope: {file:?}");
        }
        if let Err(e) = asset_protocol_scope.allow_file(file) {
            eprintln!("Failed to allow file in asset_protocol_scope: {e}");
        } else {
            println!("Allowed file in asset_protocol_scope: {file:?}");
        }
    }
}

#[cfg(desktop)]
fn set_window_open_with_files(app: &AppHandle, files: Vec<PathBuf>) {
    let files = files
        .into_iter()
        .map(|f| {
            let file = f
                .to_string_lossy()
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
            format!("\"{file}\"",)
        })
        .collect::<Vec<_>>()
        .join(",");
    let window = app.get_webview_window("main").unwrap();
    let script = format!("window.OPEN_WITH_FILES = [{files}];");
    if let Err(e) = window.eval(&script) {
        eprintln!("Failed to set open files variable: {e}");
    }
}

#[tauri::command]
fn get_executable_dir() -> String {
    std::env::current_exe()
        .ok()
        .and_then(|path| path.parent().map(|p| p.to_path_buf()))
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_default()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .plugin(tauri_plugin_fs::init())        
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init());

    #[cfg(desktop)]
    let builder = builder.plugin(tauri_plugin_window_state::Builder::default().build());

    builder.setup(|#[allow(unused_variables)]app| {
       //设置默认应用打开文件
       #[cfg(desktop)]
       {
            let files = get_files_from_argv(std::env::args().collect());
            if !files.is_empty() {
                let app_handle = app.handle().clone();
                allow_file_in_scopes(&app_handle, files.clone());
                app.listen("window-ready",move |_| {
                    println!("Window is ready, proceeding to handle files.");
                    set_window_open_with_files(&app_handle, files.clone());
                });
            }
       }

        #[cfg(desktop)]
        {
            allow_dir_in_scopes(app.handle(), &PathBuf::from(get_executable_dir()));
        }

        #[cfg(desktop)]
        {
            app.handle().plugin(tauri_plugin_cli::init())?;
            let app_handle = app.handle().clone();
            app.listen("window-ready", move |_| {
            let webview = app_handle.get_webview_window("main").unwrap();
            webview
                .eval("window.__READEST_CLI_ACCESS = true;")
                .expect("Failed to set cli access config");
         });
        }

        let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
            .background_throttling(BackgroundThrottlingPolicy::Disabled)
            .background_color(tauri::window::Color(50, 49, 48, 255));

        #[cfg(desktop)]
        let win_builder = win_builder.inner_size(800.0, 600.0).resizable(true);

        #[cfg(all(not(target_os = "macos"), desktop))]
        let win_builder = {
            let mut builder = win_builder
                .decorations(false)
                .visible(false)
                .shadow(true)
                .title("rest");

            #[cfg(target_os = "windows")]
            {
                builder = builder.transparent(false);
            }

            builder
        };

        win_builder.build().unwrap();
        app.handle().emit("window-ready", ()).unwrap();

        Ok(())
    })
    .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
