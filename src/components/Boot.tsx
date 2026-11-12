import { useEffect, useRef, useState } from "react";
import '../index.css'
import type { Lang } from "./Glossary";

const SKIP_TEXT: Record<Lang, string> = {
	en: "Skip",
	fr: "Passer",
};

const LINES = [
    // ---------- GRUB ----------
    'GNU GRUB  version 2.12',
    'device or file completions.',
    'Loading Linux 6.8.0-45-generic ...',
    'Loading initial ramdisk ...',

    // ---------- dmesg (kernel) ----------
    '[    0.000000] Linux version 6.8.0-45-generic (buildd@lcy02-amd64-032) (x86_64-linux-gnu-gcc-13 (Ubuntu 13.2.0-23ubuntu4) 13.2.0, GNU ld (GNU Binutils for Ubuntu) 2.42) #45-Ubuntu SMP PREEMPT_DYNAMIC',
    '[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-6.8.0-45-generic root=UUID=6f1c2b7e-9a3d-4e55-8b21-0c7d5e9a41aa ro quiet splash vt.handoff=7',
    '[    0.000000] KERNEL supported cpus:',
    '[    0.000000]   Intel GenuineIntel',
    '[    0.000000]   AMD AuthenticAMD',
    '[    0.000000]   Hygon HygonGenuine',
    '[    0.000000]   Centaur CentaurHauls',
    '[    0.000000]   zhaoxin   Shanghai',
    '[    0.000000] BIOS-provided physical RAM map:',
    '[    0.000000] BIOS-e820: [mem 0x0000000000000000-0x000000000009efff] usable',
    '[    0.000000] BIOS-e820: [mem 0x000000000009f000-0x00000000000fffff] reserved',
    '[    0.000000] BIOS-e820: [mem 0x0000000000100000-0x00000000bffdffff] usable',
    '[    0.000000] BIOS-e820: [mem 0x00000000bffe0000-0x00000000bfffffff] reserved',
    '[    0.000000] BIOS-e820: [mem 0x0000000100000000-0x000000043fffffff] usable',
    '[    0.000000] NX (Execute Disable) protection: active',
    '[    0.000000] APIC: Static calls initialized',
    '[    0.000000] SMBIOS 3.3.0 present.',
    '[    0.000000] DMI: LENOVO 20XW00ABUS/20XW00ABUS, BIOS N32ET82W (1.58 ) 03/14/2024',
    '[    0.000000] tsc: Detected 2995.200 MHz processor',
    '[    0.000000] x86/PAT: Configuration [0-7]: WB  WC  UC- UC  WB  WP  UC- WT',
    '[    0.000000] Using GB pages for direct mapping',
    '[    0.000000] ACPI: Early table checksum verification disabled',
    '[    0.000000] ACPI: RSDP 0x00000000BFFE0014 000024 (v02 LENOVO)',
    '[    0.000000] ACPI: XSDT 0x00000000BFFE00E8 0000F4 (v01 LENOVO TP-N32   00001580 PTEC 00000002)',
    '[    0.000000] ACPI: FACP 0x00000000BFFE0400 000114 (v06 LENOVO TP-N32   00001580 PTEC 00000002)',
    '[    0.000000] ACPI: DSDT 0x00000000BFFE0700 0143A1 (v02 LENOVO TP-N32   00001580 INTL 20230628)',
    '[    0.000000] Zone ranges:',
    '[    0.000000]   DMA      [mem 0x0000000000001000-0x0000000000ffffff]',
    '[    0.000000]   DMA32    [mem 0x0000000001000000-0x00000000ffffffff]',
    '[    0.000000]   Normal   [mem 0x0000000100000000-0x000000043fffffff]',
    '[    0.000000] Booting paravirtualized kernel on bare hardware',
    '[    0.000000] clocksource: refined-jiffies: mask: 0xffffffff max_cycles: 0xffffffff, max_idle_ns: 1910969940391419 ns',
    '[    0.000000] percpu: Embedded 66 pages/cpu s233472 r8192 d28672 u524288',
    '[    0.000000] Built 1 zonelists, mobility grouping on.  Total pages: 4131742',
    '[    0.000000] mem auto-init: stack:off, heap alloc:on, heap free:off',
    '[    0.000000] Memory: 16106340K/16787144K available (22528K kernel code, 4423K rwdata, 14424K rodata, 4536K init, 17720K bss, 680544K reserved, 0K cma-reserved)',
    '[    0.000000] SLUB: HWalign=64, Order=0-3, MinObjects=0, CPUs=8, Nodes=1',
    '[    0.000000] rcu: Preemptible hierarchical RCU implementation.',
    '[    0.000000] rcu: \tRCU restricting CPUs from NR_CPUS=8192 to nr_cpu_ids=8.',
    '[    0.000000] NR_IRQS: 524544, nr_irqs: 1096, preallocated irqs: 16',
    '[    0.000000] Console: colour dummy device 80x25',
    '[    0.000000] printk: legacy console [tty0] enabled',
    '[    0.000000] ACPI: Core revision 20230628',
    '[    0.000000] clocksource: hpet: mask: 0xffffffff max_cycles: 0xffffffff, max_idle_ns: 133484873504 ns',
    '[    0.000000] APIC: Switch to symmetric I/O mode setup',
    '[    0.004000] tsc: Marking TSC unstable due to TSC halts in idle',
    '[    0.040000] Calibrating delay loop (skipped), value calculated using timer frequency.. 5990.40 BogoMIPS (lpj=11980800)',
    '[    0.040000] CPU0: Thermal monitoring enabled (TM1)',
    '[    0.040000] process: using mwait in idle threads',
    '[    0.040000] Spectre V1 : Mitigation: usercopy/swapgs barriers and __user pointer sanitization',
    '[    0.040000] Spectre V2 : Mitigation: Enhanced / Automatic IBRS; IBPB: conditional; RSB filling; PBRSB-eIBRS: SW sequence',
    '[    0.040000] Speculative Store Bypass: Mitigation: Speculative Store Bypass disabled via prctl',
    '[    0.060000] smpboot: CPU0: 11th Gen Intel(R) Core(TM) i7-1185G7 @ 3.00GHz (family: 0x6, model: 0x8c, stepping: 0x1)',
    '[    0.060000] Performance Events: PEBS fmt4+-baseline,  AnyThread deprecated, Icelake events, 32-deep LBR, full-width counters, Intel PMU driver.',
    '[    0.070000] smp: Bringing up secondary CPUs ...',
    '[    0.070000] smpboot: x86: Booting SMP configuration:',
    '[    0.070000] .... node  #0, CPUs:      #1 #2 #3 #4 #5 #6 #7',
    '[    0.090000] smp: Brought up 1 node, 8 CPUs',
    '[    0.090000] smpboot: Max logical packages: 1',
    '[    0.090000] smpboot: Total of 8 processors activated (47923.20 BogoMIPS)',
    '[    0.100000] devtmpfs: initialized',
    '[    0.100000] clocksource: jiffies: mask: 0xffffffff max_cycles: 0xffffffff, max_idle_ns: 1911260446275000 ns',
    '[    0.100000] NET: Registered PF_NETLINK/PF_ROUTE protocol family',
    '[    0.100000] audit: initializing netlink subsys (disabled)',
    '[    0.100000] thermal_sys: Registered thermal governor step_wise',
    '[    0.110000] cpuidle: using governor menu',
    '[    0.110000] PCI: MMCONFIG for domain 0000 [bus 00-ff] at [mem 0xc0000000-0xcfffffff] (base 0xc0000000)',
    '[    0.120000] ACPI: Added _OSI(Linux-Dell-Video)',
    '[    0.130000] ACPI: 12 ACPI AML tables successfully acquired and loaded',
    '[    0.150000] ACPI: Interpreter enabled',
    '[    0.150000] ACPI: PM: (supports S0 S3 S4 S5)',
    '[    0.150000] ACPI: Using IOAPIC for interrupt routing',
    '[    0.160000] PCI: Using host bridge windows from ACPI; if necessary, use "pci=nocrs" and report a bug',
    '[    0.170000] ACPI: PCI Root Bridge [PCI0] (domain 0000 [bus 00-fe])',
    '[    0.180000] pci 0000:00:02.0: [8086:9a49] type 00 class 0x030000',
    '[    0.180000] pci 0000:00:14.0: [8086:a0ed] type 00 class 0x0c0330',
    '[    0.180000] pci 0000:00:1f.3: [8086:a0c8] type 00 class 0x040380',
    '[    0.190000] iommu: Default domain type: Translated',
    '[    0.190000] SCSI subsystem initialized',
    '[    0.190000] libata version 3.00 loaded.',
    '[    0.190000] usbcore: registered new interface driver usbfs',
    '[    0.190000] usbcore: registered new interface driver hub',
    '[    0.190000] usbcore: registered new device driver usb',
    '[    0.200000] pps_core: LinuxPPS API ver. 1 registered',
    '[    0.200000] PTP clock support registered',
    '[    0.200000] EDAC MC: Ver: 3.0.0',
    '[    0.200000] NetLabel: Initializing',
    '[    0.200000] PCI: Using ACPI for IRQ routing',
    '[    0.210000] clocksource: Switched to clocksource tsc-early',
    '[    0.220000] VFS: Disk quotas dquot_6.6.0',
    '[    0.220000] AppArmor: AppArmor Filesystem Enabled',
    '[    0.230000] pnp: PnP ACPI init',
    '[    0.240000] NET: Registered PF_INET protocol family',
    '[    0.240000] IP idents hash table entries: 262144 (order: 9, 2097152 bytes, linear)',
    '[    0.240000] tcp_listen_portaddr_hash hash table entries: 8192 (order: 5, 131072 bytes, linear)',
    '[    0.250000] TCP established hash table entries: 131072 (order: 8, 1048576 bytes, linear)',
    '[    0.250000] TCP: Hash tables configured (established 131072 bind 65536)',
    '[    0.250000] UDP hash table entries: 8192 (order: 6, 262144 bytes, linear)',
    '[    0.250000] NET: Registered PF_UNIX/PF_LOCAL protocol family',
    '[    0.260000] PCI: CLS 64 bytes, default 64',
    '[    0.270000] Initialise system trusted keyrings',
    '[    0.270000] Key type blacklist registered',
    '[    0.280000] zbud: loaded',
    '[    0.280000] Key type asymmetric registered',
    '[    0.280000] Asymmetric key parser x509 registered',
    '[    0.290000] Block layer SCSI generic (bsg) driver version 0.4 loaded (major 243)',
    '[    0.290000] io scheduler mq-deadline registered',
    '[    0.300000] input: Power Button as /devices/LNXSYSTM:00/LNXPWRBN:00/input/input0',
    '[    0.300000] ACPI: button: Power Button [PWRF]',
    '[    0.310000] Serial: 8250/16550 driver, 32 ports, IRQ sharing enabled',
    '[    0.320000] Linux agpgart interface v0.103',
    '[    0.330000] loop: module loaded',
    '[    0.330000] tun: Universal TUN/TAP device driver, 1.6',
    '[    0.330000] PPP generic driver version 2.4.2',
    '[    0.340000] xhci_hcd 0000:00:14.0: xHCI Host Controller',
    '[    0.340000] xhci_hcd 0000:00:14.0: new USB bus registered, assigned bus number 1',
    '[    0.340000] xhci_hcd 0000:00:14.0: hcc params 0x20007fc1 hci version 0x120 quirks 0x0000000200009810',
    '[    0.340000] usb usb1: New USB device found, idVendor=1d6b, idProduct=0002, bcdDevice= 6.08',
    '[    0.340000] usb usb1: Product: xHCI Host Controller',
    '[    0.340000] hub 1-0:1.0: USB hub found',
    '[    0.340000] hub 1-0:1.0: 12 ports detected',
    '[    0.350000] i8042: PNP: PS/2 Controller [PNP0303:KBD,PNP0f13:MOU] at 0x60,0x64 irq 1,12',
    '[    0.360000] serio: i8042 KBD port at 0x60,0x64 irq 1',
    '[    0.360000] mousedev: PS/2 mouse device common for all mice',
    '[    0.370000] rtc_cmos 00:02: registered as rtc0',
    '[    0.370000] rtc_cmos 00:02: setting system clock to 2026-10-04T08:12:31 UTC (1791101551)',
    '[    0.370000] device-mapper: uevent: version 1.0.3',
    '[    0.380000] intel_pstate: Intel P-state driver initializing',
    '[    0.380000] intel_pstate: HWP enabled',
    '[    0.390000] efifb: probing for efifb',
    '[    0.390000] efifb: framebuffer at 0xa0000000, using 8100k, total 8100k',
    '[    0.390000] efifb: mode is 1920x1080x32, linelength=7680, pages=1',
    '[    0.400000] NET: Registered PF_INET6 protocol family',
    '[    0.400000] Segment Routing with IPv6',
    '[    0.410000] IPI shorthand broadcast: enabled',
    '[    0.420000] registered taskstats version 1',
    '[    0.420000] Loading compiled-in X.509 certificates',
    '[    0.430000] Loaded X.509 cert Canonical Ltd. Live Patch Signing',
    '[    0.440000] Freeing unused decrypted memory: 2036K',
    '[    0.440000] Freeing unused kernel image (initmem) memory: 4536K',
    '[    0.450000] Write protecting the kernel read-only data: 38912k',
    '[    0.520000] nvme nvme0: pci function 0000:01:00.0',
    '[    0.530000] nvme nvme0: 8/0/0 default/read/poll queues',
    '[    0.530000]  nvme0n1: p1 p2 p3',
    '[    0.610000] i915 0000:00:02.0: [drm] VT-d active for gfx access',
    '[    0.620000] i915 0000:00:02.0: [drm] Finished loading DMC firmware i915/tgl_dmc_ver2_12.bin (v2.12)',
    '[    0.740000] [drm] Initialized i915 1.6.0 20230929 for 0000:00:02.0 on minor 0',
    '[    0.760000] fbcon: i915drmfb (fb0) is primary device',
    '[    0.900000] Console: switching to colour frame buffer device 240x67',
    '[    1.020000] r8169 0000:02:00.0 eth0: RTL8168h/8111h, 3c:52:82:aa:bb:cc, XID 54a, IRQ 140',
    '[    1.080000] iwlwifi 0000:00:14.3: Detected Intel(R) Wi-Fi 6 AX201 160MHz, REV=0x351',
    '[    1.140000] usb 1-3: new high-speed USB device number 2 using xhci_hcd',
    '[    1.290000] usb 1-3: New USB device found, idVendor=04f2, idProduct=b6d0, bcdDevice=11.10',
    '[    1.290000] usb 1-3: Product: Integrated Camera',
    '[    1.480000] input: AT Translated Set 2 keyboard as /devices/platform/i8042/serio0/input/input3',
    '[    1.620000] EXT4-fs (nvme0n1p2): mounted filesystem 6f1c2b7e-9a3d-4e55-8b21-0c7d5e9a41aa ro with ordered data mode. Quota mode: none.',
    '[    1.750000] Not activating Mandatory Access Control as /sbin/tomoyo-init does not exist.',

    // ---------- systemd ----------
    'Detected architecture x86-64.',
    'Hostname set to clavel.sh.',
    'Queued start job for default target graphical.target.',
    '[  OK  ] Created slice system-modprobe.slice - Slice /system/modprobe.',
    '[  OK  ] Created slice system-systemd\\x2dfsck.slice - Slice /system/systemd-fsck.',
    '[  OK  ] Created slice user.slice - User and Session Slice.',
    '[  OK  ] Started systemd-ask-password-wall.path - Forward Password Requests to Wall Directory Watch.',
    '[  OK  ] Set up automount proc-sys-fs-binfmt_misc.automount - Arbitrary Executable File Formats File System Automount Point.',
    '[  OK  ] Reached target cryptsetup.target - Local Encrypted Volumes.',
    '[  OK  ] Reached target integritysetup.target - Local Integrity Protected Volumes.',
    '[  OK  ] Reached target paths.target - Path Units.',
    '[  OK  ] Reached target slices.target - Slice Units.',
    '[  OK  ] Reached target swap.target - Swaps.',
    '[  OK  ] Listening on dm-event.socket - Device-mapper event daemon FIFOs.',
    '[  OK  ] Listening on systemd-initctl.socket - initctl Compatibility Named Pipe.',
    '[  OK  ] Listening on systemd-journald-dev-log.socket - Journal Socket (/dev/log).',
    '[  OK  ] Listening on systemd-journald.socket - Journal Socket.',
    '[  OK  ] Listening on systemd-udevd-control.socket - udev Control Socket.',
    '[  OK  ] Listening on systemd-udevd-kernel.socket - udev Kernel Socket.',
    '         Mounting dev-hugepages.mount - Huge Pages File System...',
    '         Mounting dev-mqueue.mount - POSIX Message Queue File System...',
    '         Mounting sys-kernel-debug.mount - Kernel Debug File System...',
    '         Mounting sys-kernel-tracing.mount - Kernel Trace File System...',
    '         Starting systemd-journald.service - Journal Service...',
    '         Starting systemd-modules-load.service - Load Kernel Modules...',
    '         Starting systemd-remount-fs.service - Remount Root and Kernel File Systems...',
    '[  OK  ] Mounted dev-hugepages.mount - Huge Pages File System.',
    '[  OK  ] Mounted dev-mqueue.mount - POSIX Message Queue File System.',
    '[  OK  ] Mounted sys-kernel-debug.mount - Kernel Debug File System.',
    '[  OK  ] Mounted sys-kernel-tracing.mount - Kernel Trace File System.',
    '[  OK  ] Finished systemd-modules-load.service - Load Kernel Modules.',
    '[  OK  ] Finished systemd-remount-fs.service - Remount Root and Kernel File Systems.',
    '[  OK  ] Started systemd-journald.service - Journal Service.',
    '         Starting systemd-random-seed.service - Load/Save OS Random Seed...',
    '         Starting systemd-sysctl.service - Apply Kernel Variables...',
    '         Starting systemd-udev-trigger.service - Coldplug All udev Devices...',
    '[  OK  ] Finished systemd-random-seed.service - Load/Save OS Random Seed.',
    '[  OK  ] Finished systemd-sysctl.service - Apply Kernel Variables.',
    '[  OK  ] Finished systemd-udev-trigger.service - Coldplug All udev Devices.',
    '         Starting systemd-udevd.service - Rule-based Manager for Device Events and Files...',
    '[  OK  ] Started systemd-udevd.service - Rule-based Manager for Device Events and Files.',
    '[  OK  ] Reached target local-fs-pre.target - Preparation for Local File Systems.',
    '         Mounting boot-efi.mount - /boot/efi...',
    '         Starting systemd-fsck@dev-disk-by\\x2duuid-A1B2\\x2dC3D4.service - File System Check on /dev/disk/by-uuid/A1B2-C3D4...',
    '[  OK  ] Finished systemd-fsck@dev-disk-by\\x2duuid-A1B2\\x2dC3D4.service - File System Check on /dev/disk/by-uuid/A1B2-C3D4.',
    '[  OK  ] Mounted boot-efi.mount - /boot/efi.',
    '[  OK  ] Reached target local-fs.target - Local File Systems.',
    '         Starting apparmor.service - Load AppArmor profiles...',
    '         Starting systemd-tmpfiles-setup.service - Create Volatile Files and Directories...',
    '[  OK  ] Finished apparmor.service - Load AppArmor profiles.',
    '[  OK  ] Finished systemd-tmpfiles-setup.service - Create Volatile Files and Directories.',
    '         Starting systemd-resolved.service - Network Name Resolution...',
    '         Starting systemd-timesyncd.service - Network Time Synchronization...',
    '         Starting systemd-update-utmp.service - Record System Boot/Shutdown in UTMP...',
    '[  OK  ] Finished systemd-update-utmp.service - Record System Boot/Shutdown in UTMP.',
    '[  OK  ] Started systemd-resolved.service - Network Name Resolution.',
    '[  OK  ] Started systemd-timesyncd.service - Network Time Synchronization.',
    '[  OK  ] Reached target time-sync.target - System Time Synchronized.',
    '[  OK  ] Reached target nss-lookup.target - Host and Network Name Lookups.',
    '[  OK  ] Reached target sysinit.target - System Initialization.',
    '[  OK  ] Started apt-daily.timer - Daily apt download activities.',
    '[  OK  ] Started apt-daily-upgrade.timer - Daily apt upgrade and clean activities.',
    '[  OK  ] Started fstrim.timer - Discard unused filesystem blocks once a week.',
    '[  OK  ] Started logrotate.timer - Daily rotation of log files.',
    '[  OK  ] Started systemd-tmpfiles-clean.timer - Daily Cleanup of Temporary Directories.',
    '[  OK  ] Reached target timers.target - Timer Units.',
    '[  OK  ] Listening on dbus.socket - D-Bus System Message Bus Socket.',
    '[  OK  ] Listening on snapd.socket - Socket activation for snappy daemon.',
    '[  OK  ] Listening on cups.socket - CUPS Scheduler.',
    '[  OK  ] Reached target sockets.target - Socket Units.',
    '[  OK  ] Reached target basic.target - Basic System.',
    '[  OK  ] Started cron.service - Regular background program processing daemon.',
    '[  OK  ] Started dbus.service - D-Bus System Message Bus.',
    '         Starting NetworkManager.service - Network Manager...',
    '         Starting systemd-logind.service - User Login Management...',
    '         Starting ssh.service - OpenBSD Secure Shell server...',
    '         Starting wpa_supplicant.service - WPA supplicant...',
    '         Starting bluetooth.service - Bluetooth service...',
    '[  OK  ] Started NetworkManager.service - Network Manager.',
    '[  OK  ] Started systemd-logind.service - User Login Management.',
    '[  OK  ] Started wpa_supplicant.service - WPA supplicant.',
    '[  OK  ] Started bluetooth.service - Bluetooth service.',
    '[  OK  ] Started ssh.service - OpenBSD Secure Shell server.',
    '[  OK  ] Reached target network.target - Network.',
    '         Starting NetworkManager-wait-online.service - Network Manager Wait Online...',
    '[  OK  ] Finished NetworkManager-wait-online.service - Network Manager Wait Online.',
    '[  OK  ] Reached target network-online.target - Network is Online.',
    '         Starting docker.service - Docker Application Container Engine...',
    '[  OK  ] Started docker.service - Docker Application Container Engine.',
    '[  OK  ] Started cups.service - CUPS Scheduler.',
    '[  OK  ] Started avahi-daemon.service - Avahi mDNS/DNS-SD Stack.',
    '[  OK  ] Started power-profiles-daemon.service - Power Profiles daemon.',
    '[  OK  ] Started thermald.service - Thermal Daemon Service.',
    '[  OK  ] Started accounts-daemon.service - Accounts Service.',
    '[  OK  ] Started polkit.service - Authorization Manager.',
    '[  OK  ] Started udisks2.service - Disk Manager.',
    '[  OK  ] Reached target multi-user.target - Multi-User System.',
    '         Starting gdm.service - GNOME Display Manager...',
    '[  OK  ] Started gdm.service - GNOME Display Manager.',
    '         Starting systemd-update-utmp-runlevel.service - Record Runlevel Change in UTMP...',
    '[  OK  ] Finished systemd-update-utmp-runlevel.service - Record Runlevel Change in UTMP.',
    '[  OK  ] Reached target graphical.target - Graphical Interface.',
];

const LINE_DELAY = 10;   // ms between lines
const CLEAR_DELAY = 300; // ms to keep the full log visible
const FADE_MS = 400;     // must match the CSS transition duration

type Phase = "typing" | "leaving" | "done";

export function Boot({ onDone, lang }: { onDone?: () => void; lang: Lang }) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const endRef = useRef<HTMLDivElement>(null);

  // Jumps straight to the fade-out, same as reaching the end of the log naturally.
  const skip = () => setPhase("leaving");

  // Hide the scrollbar's visual track while booting — the page still needs to
  // actually scroll (that's how the auto-scroll below keeps the latest line
  // visible), this only hides the bar itself; see .boot-hide-scrollbar in index.css.
  useEffect(() => {
    document.documentElement.classList.add("boot-hide-scrollbar");
    return () => document.documentElement.classList.remove("boot-hide-scrollbar");
  }, []);

  // typing phase: reveal lines, then start leaving
  useEffect(() => {
    if (phase !== "typing") return;

    if (count >= LINES.length) {
      const id = setTimeout(() => setPhase("leaving"), CLEAR_DELAY);
      return () => clearTimeout(id);
    }

    const id = setTimeout(() => setCount((c) => c + 1), LINE_DELAY);
    return () => clearTimeout(id);
  }, [count, phase]);

  // leaving phase: wait for the fade, then remove
  useEffect(() => {
    if (phase !== "leaving") return;
    const id = setTimeout(() => {
      setPhase("done");
      onDone?.();
    }, FADE_MS);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    endRef.current?.scrollIntoView();
  }, [count]);

  if (phase === "done") return null;

  return (
    <div className={`boot ${phase === "leaving" ? "boot--leaving" : ""}`}>
      <div className="boot_messages">
        {LINES.slice(0, count).map((line, i) => (
          <p key={i}>{line}</p>
        ))}
        <div ref={endRef} />
      </div>
      {phase === "typing" && (
        <button type="button" className="boot_skip" onClick={skip}>
          {SKIP_TEXT[lang]}
        </button>
      )}
    </div>
  );
}
