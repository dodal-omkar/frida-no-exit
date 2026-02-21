# no-exit-please 🛑

A universal Frida script to **bypass application self-termination**
at both Java/ART and native levels on Android, and
Objective-C + native layers on iOS.

This neutralizes termination-based security mechanisms commonly used in:

Root / Jailbreak detection
Emulator detection
Tamper detection
Instrumentation detection
Debugger detection
etc...

Designed for penetration testing, reverse engineering, and mobile security research...

---

## The Problem

While testing Android apps, the same pattern appears again and again:

**Detect something suspicious → display warning → kill the process**

From a developer’s perspective, this is a defensive control.  
From a pentester’s perspective, it is a **fragile enforcement mechanism**.

Detection logic may vary.
The enforcement is usually the same: **terminate the app**.

Instead of patching dozens of detection functions,
this harness removes the enforcement mechanism itself.

**If the app cannot terminate, the protection loses impact**

That led to a simple idea:

**BYPASS EXIT DIRECTLLY**

---

## What This Script Does

`no-exit-please` **bypasses security mechanisms that rely on forced
application termination** as their final enforcement step.

Detection may still trigger — but it no longer achieves its goal.

**The app keeps running.**

---

## Why This Works

Many Android security implementations assume that:
> “If a risky condition is detected, the app can safely kill itself.”

That assumption creates a single choke point.

By intercepting termination paths:
 - Root/jailbreak detection loses enforcement
 - Instrumentation remains active
 - The application continues executing
 - Analysts can inspect full behavior post-detection

This shifts the attack surface away from bypassing dozens of individual
checks and toward a single, reliable outcome:

**normal application behavior on a protected app.**

It works because developers rely on termination final state as security.

---

## In Action

The screenshot below shows `no-exit-please` blocking repeated native
termination attempts (`_exit(-1)`) from an application running in a
rooted environment.

Despite continuous exit calls, the process remains alive and the app
continues running.
<img width="1895" height="704" alt="image" src="https://github.com/user-attachments/assets/6626da44-8148-4e21-8cbf-535b720d4eae" />

---

## Features

### Android Coverage
- **Java-Level Hooks**
  - `System.exit()`
  - `Runtime.exit()`
  - `android.os.Process.killProcess()`
  - `android.os.Process.sendSignal()`
  - `Activity.finish()` / `finishAffinity()`

- **Native-Level Hooks via `libc`**
  - `exit`
  - `_exit`
  - `abort`
  - `kill`

- **Execution tracing**
  - Logs Java stack traces on exit attempts to identify
    the exact detection logic and call sites

### iOS Coverage
 - **Native Hooks**
  - `exit`
  - `_exit`
  - `abort`
  - `kill`
  - `pthread_exit`
  - `__assert_rtn`

 - **Objective-C Hooks**
  - `UIApplication terminateWithSuccess`
  - `NSException raise`
  - `objc_exception_throw`

---

## Usage

## Android

### Spawn and hook (recommended)

```bash
frida -U -f com.target.app -l no_exit_please.js
```

### Or attach to a running process:
```bash
frida -U -N com.target.app -l no_exit_please.js
```

## iOS

### Spawn and hook (recommended)

```bash
frida -U -f com.target.app -l no_exit_please_ios.js
```

### Or attach to a running process:
```bash
frida -U -N com.target.app -l no_exit_please_ios.js
```
