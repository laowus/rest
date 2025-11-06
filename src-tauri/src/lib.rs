// 导入必要的 Tauri 库和工具
use tauri::utils::config::BackgroundThrottlingPolicy;
use tauri::{Emitter, WebviewUrl, WebviewWindowBuilder};

// 在桌面环境下导入额外的库
#[cfg(desktop)]
use std::path::PathBuf;

#[cfg(desktop)]
use tauri::{AppHandle, Listener, Manager, Url};

#[cfg(desktop)]
use tauri_plugin_fs::FsExt;

// 桌面环境下的函数，用于在文件系统和资源协议的作用域中允许访问指定目录
#[cfg(desktop)]
fn allow_dir_in_scopes(app: &AppHandle, dir: &PathBuf) {
    let fs_scope = app.fs_scope();
    let asset_protocol_scope = app.asset_protocol_scope();

    // 尝试在文件系统作用域中允许访问该目录
    if let Err(e) = fs_scope.allow_directory(dir, true) {
        eprintln!("Failed to allow directory in fs_scope: {e}");
    } else {
        println!("Allowed directory in fs_scope: {dir:?}");
    }

    // 尝试在资源协议作用域中允许访问该目录
    if let Err(e) = asset_protocol_scope.allow_directory(dir, true) {
        eprintln!("Failed to allow directory in asset_protocol_scope: {e}");
    } else {
        println!("Allowed directory in asset_protocol_scope: {dir:?}");
    }
}

// 工具函数，它解决了命令行文件参数解析的复杂性，
// 使应用能够以统一的方式处理不同格式的文件路径输入。
#[cfg(desktop)]
fn get_files_from_argv(argv: Vec<String>) -> Vec<PathBuf> {
    let mut files = Vec::new();

    // 注意：args 可能包含 URL 协议（如 your-app-protocol://）或参数标记（如 --）
    // 文件也可能以 file://path/to/file 的形式传递
    for (_, maybe_file) in argv.iter().enumerate().skip(1) {
        // 跳过像 -f 或 --flag 这样的标志参数
        if maybe_file.starts_with("-") {
            continue;
        }

        // 处理 file:// 路径 URL，并跳过其他类型的 URL
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

// 桌面环境下的函数，用于在文件系统和资源协议的作用域中允许访问指定文件列表
#[cfg(desktop)]
fn allow_file_in_scopes(app: &AppHandle, files: Vec<PathBuf>) {
    let fs_scope = app.fs_scope();
    let asset_protocol_scope = app.asset_protocol_scope();

    // 为每个文件设置访问权限
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

// 桌面环境下的函数，用于设置窗口打开时的文件参数
#[cfg(desktop)]
fn set_window_open_with_files(app: &AppHandle, files: Vec<PathBuf>) {
    // 将文件路径转换为 JavaScript 可处理的格式
    let files = files
        .into_iter()
        .map(|f| {
            let file = f
                .to_string_lossy()
                .replace("\\", "\\\\") // 转义反斜杠
                .replace("\"", "\\\""); // 转义引号
            format!("\"{file}\"",)
        })
        .collect::<Vec<_>>()
        .join(",");

    // 获取主窗口并执行 JavaScript 设置文件变量
    let window = app.get_webview_window("main").unwrap();
    let script = format!("window.OPEN_WITH_FILES = [{files}];");
    if let Err(e) = window.eval(&script) {
        eprintln!("Failed to set open files variable: {e}");
    }
}

// Tauri 命令，获取可执行文件所在目录
#[tauri::command]
fn get_executable_dir() -> String {
    std::env::current_exe()
        .ok()
        .and_then(|path| path.parent().map(|p| p.to_path_buf()))
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_default()
}

// 移动平台的入口点宏
#[cfg_attr(mobile, tauri::mobile_entry_point)]
// 应用程序的主入口函数
pub fn run() {
    // 创建 Tauri 应用构建器并配置插件
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init()) // 打开器插件，用于打开外部文件
        .invoke_handler(tauri::generate_handler![]) // 注册可从 JS 调用的命令
        .plugin(tauri_plugin_fs::init()) // 文件系统插件
        .plugin(tauri_plugin_shell::init()) // Shell 插件，用于执行系统命令
        .plugin(tauri_plugin_opener::init()) // 再次初始化打开器插件（可能是重复代码）
        .plugin(tauri_plugin_dialog::init()); // 对话框插件

    // 桌面环境下添加窗口状态插件
    #[cfg(desktop)]
    let builder = builder.plugin(tauri_plugin_window_state::Builder::default().build());

    // 设置并运行应用程序
    builder
        .setup(|#[allow(unused_variables)] app| {
            // 桌面环境下设置默认应用打开文件
            #[cfg(desktop)]
            {
                // 从命令行参数获取文件列表
                let files = get_files_from_argv(std::env::args().collect());
                if !files.is_empty() {
                    let app_handle = app.handle().clone();
                    // 允许访问这些文件
                    allow_file_in_scopes(&app_handle, files.clone());
                    // 监听窗口就绪事件，然后设置打开的文件
                    app.listen("window-ready", move |_| {
                        println!("Window is ready, proceeding to handle files.");
                        set_window_open_with_files(&app_handle, files.clone());
                    });
                }
            }

            // 桌面环境下允许访问可执行文件目录
            #[cfg(desktop)]
            {
                allow_dir_in_scopes(app.handle(), &PathBuf::from(get_executable_dir()));
            }

            // 桌面环境下初始化 CLI 插件并设置相关配置
            #[cfg(desktop)]
            {
                app.handle().plugin(tauri_plugin_cli::init())?;
                let app_handle = app.handle().clone();
                app.listen("window-ready", move |_| {
                    let webview = app_handle.get_webview_window("main").unwrap();
                    // 设置 CLI 访问配置
                    webview
                        .eval("window.__READEST_CLI_ACCESS = true;")
                        .expect("Failed to set cli access config");
                });
            }

            // 创建主窗口构建器
            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .background_throttling(BackgroundThrottlingPolicy::Disabled) // 禁用后台节流
                .background_color(tauri::window::Color(50, 49, 48, 255)); // 设置背景色为深灰色

            // 桌面环境下设置窗口初始大小和可调整性
            #[cfg(desktop)]
            let win_builder = win_builder.inner_size(800.0, 600.0).resizable(true);

            // 非 macOS 的桌面环境下设置窗口装饰和透明度
            #[cfg(all(not(target_os = "macos"), desktop))]
            let win_builder = {
                let mut builder = win_builder
                    .decorations(false) // 禁用窗口装饰
                    .visible(false) // 初始时不可见
                    .shadow(true) // 启用窗口阴影
                    .title("rest"); // 设置窗口标题

                #[cfg(target_os = "windows")]
                {
                    builder = builder.transparent(false); // Windows 下禁用窗口透明度
                }

                builder
            };

            // 构建并显示窗口
            win_builder.build().unwrap();
            // 注释掉的代码，用于打开开发者工具
            // let win = win_builder.build().unwrap();
            // win.open_devtools();

            // 发送窗口就绪事件
            app.handle().emit("window-ready", ()).unwrap();

            Ok(())
        })
        .run(tauri::generate_context!()) // 运行应用程序并生成上下文
        .expect("error while running tauri application"); // 处理可能的错误
}
