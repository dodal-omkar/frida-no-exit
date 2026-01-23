# no-exit-please 🛑

A universal Frida script to **bypass application self-termination**
at both Java and native levels on Android.

This effectively bypasses **termination-based security mechanisms**
commonly used in root detection, emulator detection, tamper detection,
and instrumentation checks.

Designed for **penetration testing, ethical hacking, reverse engineering,
and security research** on Android applications that intentionally shut
themselves down when defensive checks are triggered.

---

## The Problem

While testing Android apps, the same pattern appears again and again:

Root / tamper detection → warning screen → app exits.

From a developer’s perspective, this is a defensive control.  
From a pentester’s perspective, it is a **fragile enforcement mechanism**.

In many real-world apps, detection logic is shallow — but the response
is aggressive: *terminate the process*.

Every new target meant rewriting the same Frida hooks just to keep the
process alive long enough to analyze what was actually happening.

That led to a simple idea:

**If the app cannot exit, the protection fails.**

---

## What This Script Does

`no-exit-please` **bypasses security mechanisms that rely on forced
application termination** as their final enforcement step.

It does **not** hide root, patch checks, or neutralize detection logic.
Instead, it **bypasses the impact of those checks** by preventing the
application from terminating itself.

Detection may still trigger — but it no longer achieves its goal.

**The app keeps running.**

---

## Why This Works

Many Android security implementations assume that:
> “If a risky condition is detected, the app can safely kill itself.”

That assumption is wrong.

By intercepting exit paths:
- root and emulator detections lose their enforcement power
- instrumentation remains active
- the application stays usable even on hostile environments

This shifts the attack surface away from bypassing dozens of individual
checks and toward a single, reliable outcome:

**normal application behavior on a protected app.**

This is not theoretical — it works because developers rely on termination
as security.

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

- **Bypasses Java-level termination paths**
  - `System.exit()`
  - `Runtime.exit()`
  - `android.os.Process.killProcess()`
  - `android.os.Process.sendSignal()`
  - `Activity.finish()` / `finishAffinity()`

- **Bypasses native termination via `libc`**
  - `exit`
  - `_exit`
  - `abort`
  - `kill`

- **Execution tracing**
  - Logs Java stack traces on exit attempts to identify
    the exact detection logic and call sites

---

## Usage

### Spawn and hook (recommended)

```bash
frida -U -f com.target.app -l no_exit_please.js
```

### Or attach to a running process:
```bash
frida -U -n com.target.app -l no_exit_please.js
```
