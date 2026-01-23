# no-exit-please 🛑

A universal Frida script to **block application termination** at both
Java and native levels on Android — effectively bypassing
termination-based security mechanisms such as root, emulator,
and tamper detection.

Designed for security testing, reverse engineering, and debugging
applications that intentionally shut down when security checks
are triggered.

---

While testing Android apps, the same pattern kept showing up again and again.

Developers add root/tamper detection → show a warning → kill the app.

From a developer’s perspective, that makes sense.  
From a security tester’s perspective? **It’s an opportunity.**

Every new app meant rewriting the same Frida hooks just to keep the
process alive long enough to understand what was actually happening.

That led to a simple idea: **a universal “No-Die” harness.**

---

This script does **not** target or bypass root checks, emulator detection,
or tamper logic directly by hooking into detection code.

Instead, it focuses on the **end goal**:
Instead, it targets the **response**, not the detection.

It simply hooks the exit points-because apps closing before you can
even do anything gets old fast.

**It simply refuses to die.**

In other words, the detection may still trigger - but it no longer
achieves its goal.

The result:
→ The process stays alive
→ The application remains usable
→ Further exploitation becomes possible

The goal is simple:  
Save time, kill the boilerplate, and make reverse engineering less repetitive.

---

## Why This Works

Many Android security implementations rely on **forced termination**
as the final enforcement step.

If the app cannot exit:
- security checks lose their impact
- root/emulator environments remain usable
- instrumentation can continue uninterrupted

This shifts the focus from fighting individual checks to achieving the
end goal: **keeping the application running normally**.

---


## In Action

The screenshot below shows `no-exit-please` actively blocking repeated
termination attempts from an application that detects a rooted
environment.

Despite multiple native `_exit(-1)` calls, the process remains alive
and the application continues running.
<img width="1895" height="704" alt="image" src="https://github.com/user-attachments/assets/6626da44-8148-4e21-8cbf-535b720d4eae" />




## Features

- **Blocks Java-level exits:**
  - `System.exit()`
  - `Runtime.exit()`
  - `android.os.Process.killProcess()`
  - `android.os.Process.sendSignal()`
  - `Activity.finish()` / `finishAffinity()` 
- **Blocks native exits via `libc`:**
  - `exit`
  - `_exit`
  - `abort`
  - `kill`
- **Tracing:** Logs Java stack traces when exit attempts occur so you can trace the caller.

## Usage

**Spawn and hook (Recommended):**
```bash
frida -U -f com.target.app -l /PATH/TO/no_exit_please.js
```

**Or attach to a running process:**
```bash
frida -U -n com.target.app -l no_exit_please.js
```
