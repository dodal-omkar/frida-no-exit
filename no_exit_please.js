/*
═══════════════════════════════════════════════════════════════
   no_exit_please.js
   Universal Frida No-Exit Harness (Java + Native)

   Purpose : Block application termination to enable
             reverse engineering and security analysis
   Author  : Slayer
   Version : 1.3.0
═══════════════════════════════════════════════════════════════
*/

'use strict';

/* =========================
 * Java-level hooks
 * ========================= */

function installJavaHooks() {
  if (!Java.available) {
    console.log('[-] Java VM not available');
    return;
  }

  Java.perform(function () {
    const Log = Java.use('android.util.Log');
    const Exception = Java.use('java.lang.Exception');

    function logStack(tag) {
      try {
        const ex = Exception.$new('stack');
        const st = ex.getStackTrace();
        let out = [];
        for (let i = 0; i < Math.min(st.length, 25); i++) {
          out.push(st[i].toString());
        }
        Log.i(tag, 'Java stack:\n' + out.join('\n'));
      } catch (_) {}
    }

    // System.exit
    try {
      Java.use('java.lang.System')
        .exit.overload('int')
        .implementation = function (code) {
          Log.w('frida.noexit', '[BLOCKED][Slayer] System.exit(' + code + ')');
          logStack('frida.noexit');
        };
      console.log('[+] Hooked System.exit');
    } catch (_) {}

    // Runtime.exit
    try {
      Java.use('java.lang.Runtime')
        .exit.overload('int')
        .implementation = function (code) {
          Log.w('frida.noexit', '[BLOCKED][Slayer] Runtime.exit(' + code + ')');
          logStack('frida.noexit');
        };
      console.log('[+] Hooked Runtime.exit');
    } catch (_) {}

    // Process
    try {
      const Process = Java.use('android.os.Process');

      Process.killProcess.overload('int').implementation = function (pid) {
        Log.w('frida.noexit', '[BLOCKED][Slayer] killProcess(' + pid + ')');
        logStack('frida.noexit');
      };

      if (Process.sendSignal) {
        Process.sendSignal.overload('int', 'int').implementation = function (pid, sig) {
          Log.w('frida.noexit', '[BLOCKED][Slayer] sendSignal(' + pid + ',' + sig + ')');
          logStack('frida.noexit');
        };
      }

      console.log('[+] Hooked android.os.Process');
    } catch (_) {}

    // Activity
    try {
      const Activity = Java.use('android.app.Activity');

      Activity.finish.implementation = function () {
        Log.w('frida.noexit', '[BLOCKED][Slayer] Activity.finish()');
        logStack('frida.noexit');
      };

      if (Activity.finishAffinity) {
        Activity.finishAffinity.implementation = function () {
          Log.w('frida.noexit', '[BLOCKED][Slayer] finishAffinity()');
          logStack('frida.noexit');
        };
      }

      console.log('[+] Hooked Activity exits');
    } catch (_) {}

    console.log('[*] Java no-exit hooks installed (Slayer)');
  });
}

/* =========================
 * Native-level hooks
 * ========================= */

function installNativeHooks() {
  function safeReplace(symbol, ret, args, impl) {
    const addr = Module.findExportByName('libc.so', symbol);
    if (!addr) {
      console.log('[i] Native symbol not found:', symbol);
      return;
    }

    Interceptor.replace(addr, new NativeCallback(impl, ret, args));
    console.log('[+] Replaced native', symbol);
  }

  try {
    safeReplace('exit', 'void', ['int'], function (code) {
      console.log('[BLOCKED][Slayer] exit(' + code + ')');
    });

    safeReplace('_exit', 'void', ['int'], function (code) {
      console.log('[BLOCKED][Slayer] _exit(' + code + ')');
    });

    safeReplace('abort', 'void', [], function () {
      console.log('[BLOCKED][Slayer] abort()');
    });

    safeReplace('kill', 'int', ['int', 'int'], function (pid, sig) {
      console.log('[BLOCKED][Slayer] kill(' + pid + ',' + sig + ')');
      return 0;
    });

  } catch (e) {
    console.log('[-] Native hook error:', e);
  }
}

/* =========================
 * Deferred install (CRITICAL)
 * ========================= */

setImmediate(function () {
  if (typeof NativeCallback === 'function') {
    installNativeHooks();
  } else {
    console.log('[i] NativeCallback not ready, skipping native hooks');
  }

  installJavaHooks();
  console.log('[*] no_exit_please.js fully loaded — Slayer');
});
