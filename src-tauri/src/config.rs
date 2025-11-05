pub enum BackgroundThrottlingPolicy {
  /// A policy where background throttling is disabled
  Disabled,
  /// A policy where a web view that's not in a window fully suspends tasks. This is usually the default behavior in case no policy is set.
  Suspend,
  /// A policy where a web view that's not in a window limits processing, but does not fully suspend tasks.
  Throttle,
}