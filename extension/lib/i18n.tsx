import * as React from 'react';

export type Language = 'id' | 'en';

export const SEARCH_GREETINGS: Record<Language, string[]> = {
  id: [
    'Apa yang ingin Anda cari hari ini?',
    'Mulai penelusuran Anda...',
    'Temukan hal menarik hari ini!',
    'Mau cari informasi apa hari ini?',
    'Ketik kata kunci untuk mulai mencari...',
    'Selamat datang kembali! Cari sesuatu?',
  ],
  en: [
    'What would you like to search today?',
    'Start your search...',
    'Discover something interesting today!',
    'What information are you looking for?',
    'Type a keyword to start searching...',
    'Welcome back! Looking for something?',
  ],
};

export const DICTIONARY = {
  id: {
    // Header & Sidebar Navigation
    navGroupMain: 'Utama',
    navGroupManage: 'Kelola',
    navDashboard: 'Dashboard',
    navBookmark: 'Bookmark',
    navOrganize: 'Manajemen',
    navTrash: 'Tong Sampah',
    navSettings: 'Pengaturan',
    headerBookmark: 'BOOKMARK',
    headerDashboard: 'DASHBOARD',
    headerOrganize: 'MANAJEMEN BOOKMARK',
    headerTrash: 'TONG SAMPAH',
    headerSupport: 'Support',
    githubRepoTooltip: 'Repositori GitHub (arnative/syntive)',
    editWidgetsTooltip: 'Sunting Widget',
    collapseSidebar: 'Ciutkan Sidebar',
    expandSidebar: 'Buka Sidebar',
    
    // Theme tooltips & modes
    themeTitle: 'Tema saat ini',
    themeLight: 'Terang',
    themeDark: 'Gelap',
    themeSystem: 'Sistem',

    // Sync box
    syncStatusNotSynced: 'Belum sinkron',
    syncStatusSyncedJustNow: 'Sinkron baru saja',
    syncStatusSyncedAgo: '{time} lalu',
    syncButton: 'Sinkron',
    syncingButton: 'Sinkron…',

    // Search Engine Bar
    searchWith: 'Cari dengan {provider}...',
    searchButton: 'Cari',
    customProvider: 'Provider Kustom...',
    customEngineTitle: 'Atur Search Engine Kustom',
    customEngineDesc: 'Masukkan URL pencarian search engine kustom Anda. Gunakan URL dengan parameter query di akhir (misalnya: https://duckduckgo.com/?q=).',
    cancel: 'Batal',
    save: 'Simpan',

    // Top & Favorite Sites
    topSitesTitle: 'SERING DIAKSES',
    topSitesBadge: 'Otomatis',
    noTopSites: 'Tidak ada situs untuk ditampilkan.',
    favoriteSitesTitle: 'SITUS FAVORIT',
    addFavoriteBtn: 'Tambah ({count}/10)',
    addFavoriteTooltip: 'Tambah Situs Favorit',
    removeFavoriteTooltip: 'Hapus dari Favorit',
    addFavoriteModalTitle: 'Sematkan Situs Favorit',
    titlePlaceholder: 'Judul (misal: GitHub)',
    urlPlaceholder: 'URL (misal: https://github.com)',

    // Widgets
    widgetSectionLabel: 'WIDGET',
    manageWidgets: 'Kelola Widget',
    allWidgetsDisabled: 'Semua widget dinonaktifkan. Klik "Kelola Widget" untuk mengaktifkan widget.',
    widgetSettingsModalTitle: 'Pengaturan Widget',
    widgetSettingsModalDesc: 'Pilih widget yang ingin ditampilkan pada Dashboard:',
    done: 'Selesai',
    dragWidgetTooltip: 'Geser posisi widget',
    searchWidgetsPlaceholder: 'Cari widget...',
    noWidgetsFound: 'Tidak ada widget yang cocok',
    catTimeProductivity: 'WAKTU & PRODUKTIVITAS',
    catSitesNavigation: 'SITUS & NAVIGASI',
    catIslamicInspiration: 'ISLAMI & INSPIRASI',

    // Widget Titles
    widgetTopSitesTitle: 'SERING DIAKSES',
    widgetFavoriteSitesTitle: 'SITUS FAVORIT',
    widgetClockTitle: 'WAKTU',
    widgetNotesTitle: 'CATATAN CEPAT',
    widgetStatsTitle: 'STATISTIK BOOKMARK',
    widgetTodoTitle: 'DAFTAR TUGAS',
    widgetQuoteTitle: 'KUTIPAN MOTIVASI',
    widgetPomodoroTitle: 'TIMER FOKUS',
    widgetWorldClockTitle: 'JAM DUNIA',
    widgetIslamicQuoteTitle: 'MUTIARA ISLAM',
    widgetQuranRadioTitle: 'RADIO AL-QURAN',
    widgetNatureRadioTitle: 'RADIO NATURE',
    widgetHijriCalendarTitle: 'KALENDER HIJRIYAH',

    // Widget: Clock
    greetingMorning: 'Selamat Pagi 🌅',
    greetingNoon: 'Selamat Siang ☀️',
    greetingAfternoon: 'Selamat Sore 🌇',
    greetingNight: 'Selamat Malam 🌙',

    // Widget: Quick Notes
    autoSavedBadge: 'Otomatis tersimpan',
    notesPlaceholder: 'Tulis catatan atau pengingat di sini...',

    // Widget: Todo List
    addTaskPlaceholder: 'Tambah tugas baru…',
    noTasks: 'Belum ada tugas.',

    // Widget: Pomodoro
    focusMode: 'Fokus',
    breakMode: 'Istirahat',
    startTimer: 'Mulai',
    pauseTimer: 'Jeda',
    resetTimer: 'Reset',
    nextQuote: 'Kutipan Baru',
    focusCompletedTitle: 'Sesi Fokus Selesai! 🎉',
    focusCompletedBody: 'Hebat! Waktunya istirahat sejenak 5 menit ☕',
    breakCompletedTitle: 'Waktu Istirahat Selesai! 🚀',
    breakCompletedBody: 'Siap untuk sesi fokus berikutnya?',

    // Widget: World Clock
    editLocations: 'Atur Lokasi',
    selectCity: 'Pilih Kota / Zona Waktu',

    // Widget: Bookmark Stats
    totalLabel: 'Total',
    foldersLabel: 'Folder',
    directLinksLabel: 'Links',
    syncLabel: 'Sinkron',
    securityLabel: 'Keamanan',
    encryptedBadge: 'AES-256',
    syncNever: 'Belum',

    // Bookmark View
    searchBookmarkPlaceholder: 'Cari folder atau bookmark…',
    filterAll: 'Semua',
    filterFolders: 'Folder',
    filterLinks: 'Link',
    back: 'Kembali',
    rootFolder: 'Utama',
    sectionFolder: 'FOLDER',
    sectionLinks: 'LINKS',
    noFoldersFound: 'Tidak ada folder yang ditemukan.',
    noLinksFound: 'Tidak ada link.',
    noBookmarksToolbar: 'Belum ada bookmark di toolbar.',
    untitled: '(tanpa judul)',
    untitledFolder: 'Tanpa nama',

    // Folder Card
    dragHere: 'Pindahkan ke sini',
    dragDropToFolder: 'Lepas untuk masuk ke "{title}"',
    dragSwapGrid: 'Tukar Posisi Grid',
    dragHoldShiftInfo: 'Tahan Shift untuk masuk ke folder',
    renameFolder: 'Ganti nama',
    deleteFolder: 'Hapus folder',
    dragFolderTooltip: 'Geser posisi folder',
    emptyFolder: 'Folder kosong',
    deleteFolderConfirm: 'Apakah Anda yakin ingin menghapus folder "{title}"?\n\nTindakan ini tidak bisa dibatalkan.',
    dragBookmarkTooltip: 'Seret',
    deleteBookmarkTooltip: 'Hapus',

    // Trash View
    trashNoticeTitle: 'Pembersihan Otomatis 30 Hari',
    trashNoticeDesc: 'Item di Tong Sampah akan dihapus secara permanen setelah 30 hari. Tersinkronisasi dengan database di semua perangkat.',
    trashEmptyTitle: 'Tong Sampah Kosong',
    trashEmptyDesc: 'Tidak ada bookmark atau folder yang terhapus.',
    searchTrashPlaceholder: 'Cari item di tong sampah…',
    restoreBtn: 'Pulihkan',
    deletePermanentBtn: 'Hapus Permanen',
    emptyTrashBtn: 'Kosongkan Tong Sampah',
    emptyTrashConfirm: 'Apakah Anda yakin ingin menghapus semua item di Tong Sampah secara permanen?\n\nTindakan ini tidak bisa dibatalkan.',
    deletePermanentConfirm: 'Apakah Anda yakin ingin menghapus "{title}" secara permanen?\n\nTindakan ini tidak bisa dibatalkan.',
    daysLeft: '{days} hari lagi',
    deletedAgo: 'Dihapus {time} lalu',
    itemRestored: 'Item berhasil dipulihkan',
    restoreSelected: 'Pulihkan Terpilih ({count})',
    deletePermanentSelected: 'Hapus Permanen ({count})',
    deleteSelectedPermanentConfirm: 'Apakah Anda yakin ingin menghapus {count} item terpilih secara permanen?\n\nTindakan ini tidak bisa dibatalkan.',
    restoreSuccessNotice: 'Berhasil memulihkan {count} item dari Tong Sampah.',
    deletePermanentSuccessNotice: 'Berhasil menghapus {count} item secara permanen.',
    showingTrashPageText: 'Menampilkan halaman {page} dari {pageCount} ({totalItems} item)',
    colItemType: 'Tipe',

    // Settings Modal
    settingsModalTitle: 'Pengaturan',
    tabGeneral: 'Umum',
    tabSecurity: 'Keamanan',
    tabSessions: 'Sesi',
    tabStorage: 'Penyimpanan',
    tabCredits: 'Kredit',
    tabAbout: 'Tentang',
    deviceNameLabel: 'Nama Perangkat',
    deviceNameDesc: 'Nama ini digunakan untuk membedakan riwayat sinkronisasi perangkat ini dengan perangkat lain.',
    deviceNamePlaceholder: 'Contoh: Brave - Laptop Utama',
    syncIntervalLabel: 'Interval Sinkronisasi',
    syncIntervalDesc: 'Pilih seberapa sering bookmarks Anda disinkronkan ke server secara berkala.',
    interval5m: '5 Menit',
    interval15m: '15 Menit',
    interval30m: '30 Menit',
    interval60m: '60 Menit',
    intervalManual: 'Manual',
    themeSectionTitle: 'Tema & Warna Aksen',
    themeModeLabel: 'Mode Tampilan',
    themePresetLabel: 'Skema Warna',
    customAccentTitle: 'Pilih Warna Aksen (HEX)',
    githubImportTitle: 'Import Skema Warna dari GitHub',
    githubImportBtn: 'Import',
    githubLoading: 'Memuat…',
    githubImportError: 'Format JSON GitHub tidak valid (butuh "accentHex", "accent", atau "primary").',
    githubFetchError: 'Gagal mengambil data dari URL GitHub.',
    secretKeyLabel: 'Kunci Rahasia',
    secretKeyDesc: 'Gunakan untuk enkripsi end-to-end. Jangan pernah membagikannya kepada siapa pun.',
    onboardingPlaceholder: 'Secret Key Anda',
    onboardingCreateBtn: 'Buat Secret Key',
    onboardingLoginBtn: 'Masuk',
    onboardingSubtext: 'Masukkan 12 kata Secret Key Anda untuk memulihkan dan menyinkronkan bookmark.',
    onboardingTitleCreate: 'Secret Key (12 Kata)',
    onboardingRegenerate: 'Buat Ulang',
    onboardingDownloadTxt: 'Unduh .txt',
    onboardingCopy: 'Salin',
    onboardingCopied: 'Tersalin',
    onboardingDownloadedMsg: 'File backup telah diunduh. Simpan file ini dengan baik.',
    onboardingBack: 'Kembali',
    onboardingContinue: 'Saya Sudah Menyimpan, Lanjut',
    onboardingSecurityNote: 'Secret Key tidak pernah dikirim ke server. Terenkripsi end-to-end (E2E) ke Cloudflare.',
    onboardingEmptyError: 'Masukkan 12 kata Secret Key Anda terlebih dahulu.',
    onboardingProcessing: 'Memproses…',
    hide: 'Sembunyikan',
    show: 'Tampilkan',
    copyKey: 'Salin Kunci',
    importantAlertTitle: 'PENTING & RAHASIA',
    importantAlertDesc: 'Simpan Secret Key ini di tempat yang aman dan tersembunyi. Siapa pun yang memiliki akses ke kunci ini dapat memulihkan, membaca, dan mengubah semua data bookmark Anda. Kami tidak menyimpan kunci Anda di server kami, sehingga kunci yang hilang tidak dapat dipulihkan.',
    downloadKeyBtn: 'Unduh Secret Key (.txt)',
    downloadedKeyBtn: 'Secret Key Berhasil Diunduh!',
    deviceSessionsTitle: 'Sesi Perangkat',
    deviceSessionsSubtitle: 'Kelola perangkat yang terhubung ke akun Anda beserta sinkronisasi terakhirnya.',
    reload: 'Muat Ulang',
    loadingDevices: 'Memuat daftar perangkat…',
    noDevices: 'Tidak ada perangkat terdaftar.',
    thisDeviceBadge: 'Saat Ini',
    activeAgo: 'Aktif {time}',
    colLastSync: 'Sinkron Terakhir',
    terminateSessionTooltip: 'Hentikan Sesi',
    backupRecoveryLabel: 'Cadangan & Pemulihan Data',
    backupRecoveryDesc: 'Ekspor atau impor cadangan bookmark lokal dalam format JSON.',
    exportBookmarksTitle: 'Ekspor Bookmark',
    exportBookmarksDesc: 'Unduh salinan JSON cadangan semua bookmark lokal Anda.',
    exportJsonBtn: 'Ekspor JSON',
    importBookmarksTitle: 'Impor Bookmark',
    importBookmarksDesc: 'Pulihkan atau tambahkan bookmark dari file cadangan JSON.',
    importingBtn: 'Mengimpor…',
    importedSuccessBtn: 'Berhasil Diimpor!',
    importJsonBtn: 'Impor JSON',
    importError: 'Gagal mengimpor file bookmark. Pastikan format file JSON valid.',
    cacheCleanupLabel: 'Pembersihan Cache',
    cacheCleanupDesc: 'Bersihkan status cache sinkronisasi lokal jika Anda mengalami kendala data tidak sesuai.',
    clearLocalCacheBtn: 'Clear Local Cache',
    clearCacheConfirm: 'Apakah Anda yakin ingin membersihkan cache lokal Syntive?',
    clearCacheSuccess: 'Cache data lokal telah dibersihkan.',
    aboutAppDescTitle: 'Penjelasan Aplikasi',
    aboutAppDesc: 'Syntive adalah ekstensi peramban modern untuk menyinkronkan bookmark secara aman antar perangkat tanpa perantara server yang dapat membaca data Anda. Semua bookmark dienkripsi di sisi klien menggunakan enkripsi AES-GCM 256-bit berbasis Secret Key (12 Kata Mnemonic).',
    developerLabel: 'Pengembang:',
    databaseServerLabel: 'Server Database:',
    databaseServerValue: 'Cloudflare',
    licenseLabel: 'Lisensi:',
    repoLabel: 'Repositori:',
    logoutBtn: 'Keluar',
    saveChangesBtn: 'Simpan Perubahan',
    savingBtn: 'Menyimpan…',

    // Credits Tab
    creditsTitle: 'Kredit & Atribusi',
    creditsSubtitle: 'Apresiasi dan atribusi atas penyedia API, audio stream, dan layanan data publik yang digunakan oleh Syntive:',
    creditsQuranRadioTitle: 'Radio Qur\'an 24/7',
    creditsQuranRadioDesc: 'Audio stream Tilawah Al-Qur\'an dari Syaikh Mishary Al-Afasy, Al-Sudais, Al-Ghamdi, Al-Muaiqly, Al-Dosari, & Radio Utama.',
    creditsQuranRadioSource: 'Qurango Radio Network',
    creditsNatureRadioTitle: 'Radio Nature & Suasana',
    creditsNatureRadioDesc: 'Audio suasana alam (Hujan, Badai, Ombak, Kicau Burung, Kereta Api, Gua, Kafe, dll.).',
    creditsNatureRadioSource: 'Noisekun Ambient Sound CDN',
    creditsMotivationalQuotesTitle: 'Kutipan Motivasi',
    creditsMotivationalQuotesDesc: 'Koleksi kata mutiara dan inspirasi harian.',
    creditsMotivationalQuotesSource: 'Liu Purnomo Quotes API',
    creditsIslamicQuotesTitle: 'Mutiara Islam & Hadits',
    creditsIslamicQuotesDesc: 'Petikan hadits shahih dan hikmah Islami.',
    creditsIslamicQuotesSource: 'MyQuran Hadits API',
    creditsIconsTitle: 'Set Ikon Antarmuka',
    creditsIconsDesc: 'Ikonografi antarmuka modern.',
    creditsIconsSource: 'Reicon Icons',

    // Support Modal
    supportModalTitle: 'Dukungan & Donasi',
    supportModalDesc: 'Terima kasih telah menggunakan Syntive! Jika aplikasi ini bermanfaat untuk Anda, dukung pengembangan proyek ini melalui pilihan donasi di bawah:',
    indonesiaQris: 'Indonesia (QRIS)',
    indonesiaBadge: 'Indonesia',
    qrisDesc: 'Scan QRIS donasi menggunakan GoPay, OVO, DANA, ShopeePay, LinkAja, BCA, Mandiri, atau aplikasi m-Banking Indonesia lainnya.',
    qrisFooter: 'Dukungan QRIS / e-Wallet Bisma',
    globalPaypal: 'Dukungan via PayPal',
    globalBadge: 'Internasional',
    paypalDesc: 'Dukung pengembangan Syntive melalui halaman PayPal kami.',
    openPaypalBtn: 'Buka halaman PayPal',
    copyPaypalTooltip: 'Salin alamat PayPal',

    // Tools & Scan Duplikat
    toolsTitle: 'Tools & Utilitas',
    toolsDesc: 'Peralatan dan pemeliharaan pintar untuk mengoptimalkan koleksi bookmark Anda.',
    duplicateToolTitle: 'Pindai & Cari Bookmark Duplikat',
    duplicateToolDesc: 'Temukan dan bersihkan link bookmark duplikat agar folder bookmark Anda rapi.',
    scanButton: 'Mulai Pindai',
    rescanButton: 'Pindai Ulang',
    scanningText: 'Memindai bookmark Anda...',
    scanReadyText: 'Siap memindai duplikat bookmark',
    duplicatesSummaryText: '{groups} grup ({totalItems} duplikat)',
    matchStrategyLabel: 'Metode Pencocokan:',
    matchStrict: 'Persis (URL Identik)',
    matchNormalized: 'Toleran (Normalisasi URL)',
    noDuplicatesFound: 'Selamat! Tidak ditemukan bookmark duplikat.',
    duplicatesFoundSummary: 'Ditemukan {groups} grup URL duplikat ({totalItems} link duplikat).',
    autoSelectDuplicates: 'Pilih Otomatis (Simpan Terlama)',
    autoSelectShort: 'Pilih Otomatis',
    selectAll: 'Pilih Semua',
    deselectAll: 'Batal Pilih',
    deleteSelected: 'Hapus Terpilih ({count})',
    deletingText: 'Menghapus...',
    keepOriginalTag: 'Utama',
    duplicateTag: 'Duplikat',
    deleteSuccessNotice: 'Berhasil memindahkan {count} duplikat ke Tong Sampah.',
    colTitleUrl: 'Judul & Link',
    colFolderLocation: 'Folder',
    colStatus: 'Status',
    colDateAdded: 'Tanggal',
    colAction: 'Aksi',
    noScanDataTitle: 'Belum Ada Data Pemindaian',
    noScanDataDesc: 'Klik tombol "Mulai Pindai" di atas untuk mendeteksi link duplikat.',
    groupLabel: 'Grup #{index}:',
    duplicateCountBadge: '{count} link duplikat',
    showingPageText: 'Menampilkan halaman {page} dari {pageCount} ({totalGroups} grup duplikat)',
  },
  en: {
    // Header & Sidebar Navigation
    navGroupMain: 'Main',
    navGroupManage: 'Manage',
    navDashboard: 'Dashboard',
    navBookmark: 'Bookmark',
    navOrganize: 'Management',
    navTrash: 'Trash Bin',
    navSettings: 'Settings',
    headerBookmark: 'BOOKMARK',
    headerDashboard: 'DASHBOARD',
    headerOrganize: 'BOOKMARK MANAGEMENT',
    headerTrash: 'TRASH BIN',
    headerSupport: 'Support',
    githubRepoTooltip: 'GitHub Repository (arnative/syntive)',
    editWidgetsTooltip: 'Edit Widgets',
    collapseSidebar: 'Collapse Sidebar',
    expandSidebar: 'Expand Sidebar',

    // Theme tooltips & modes
    themeTitle: 'Current theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',

    // Sync box
    syncStatusNotSynced: 'Not synced',
    syncStatusSyncedJustNow: 'Synced just now',
    syncStatusSyncedAgo: 'Synced {time} ago',
    syncButton: 'Sync',
    syncingButton: 'Syncing…',

    // Search Engine Bar
    searchWith: 'Search with {provider}...',
    searchButton: 'Search',
    customProvider: 'Custom Provider...',
    customEngineTitle: 'Configure Custom Search Engine',
    customEngineDesc: 'Enter your custom search engine URL. Use a URL ending with a query parameter (e.g. https://duckduckgo.com/?q=).',
    cancel: 'Cancel',
    save: 'Save',

    // Top & Favorite Sites
    topSitesTitle: 'MOST VISITED',
    topSitesBadge: 'Automatic',
    noTopSites: 'No sites to display.',
    favoriteSitesTitle: 'FAVORITE SITES',
    addFavoriteBtn: 'Add ({count}/10)',
    addFavoriteTooltip: 'Add Favorite Site',
    removeFavoriteTooltip: 'Remove from Favorites',
    addFavoriteModalTitle: 'Pin Favorite Site',
    titlePlaceholder: 'Title (e.g. GitHub)',
    urlPlaceholder: 'URL (e.g. https://github.com)',

    // Widgets
    widgetSectionLabel: 'WIDGET',
    manageWidgets: 'Manage Widgets',
    allWidgetsDisabled: 'All widgets are disabled. Click "Manage Widgets" to enable widgets.',
    widgetSettingsModalTitle: 'Widget Settings',
    widgetSettingsModalDesc: 'Select widgets to display on the Dashboard:',
    done: 'Done',
    dragWidgetTooltip: 'Drag widget position',
    searchWidgetsPlaceholder: 'Search widgets...',
    noWidgetsFound: 'No matching widgets found',
    catTimeProductivity: 'TIME & PRODUCTIVITY',
    catSitesNavigation: 'SITES & NAVIGATION',
    catIslamicInspiration: 'ISLAMIC & INSPIRATION',

    // Widget Titles
    widgetTopSitesTitle: 'MOST VISITED',
    widgetFavoriteSitesTitle: 'FAVORITE SITES',
    widgetClockTitle: 'TIME',
    widgetNotesTitle: 'QUICK NOTES',
    widgetStatsTitle: 'BOOKMARK STATS',
    widgetTodoTitle: 'TODO LIST',
    widgetQuoteTitle: 'MOTIVATIONAL QUOTE',
    widgetPomodoroTitle: 'FOCUS TIMER',
    widgetWorldClockTitle: 'WORLD CLOCK',
    widgetIslamicQuoteTitle: 'ISLAMIC WISDOM',
    widgetQuranRadioTitle: 'QURAN RADIO',
    widgetNatureRadioTitle: 'NATURE SOUNDS',
    widgetHijriCalendarTitle: 'HIJRI CALENDAR',

    // Widget: Clock
    greetingMorning: 'Good Morning 🌅',
    greetingNoon: 'Good Afternoon ☀️',
    greetingAfternoon: 'Good Afternoon 🌇',
    greetingNight: 'Good Evening 🌙',

    // Widget: Quick Notes
    autoSavedBadge: 'Auto saved',
    notesPlaceholder: 'Type your notes or reminders here...',

    // Widget: Todo List
    addTaskPlaceholder: 'Add a new task…',
    noTasks: 'No tasks yet.',

    // Widget: Pomodoro
    focusMode: 'Focus',
    breakMode: 'Break',
    startTimer: 'Start',
    pauseTimer: 'Pause',
    resetTimer: 'Reset',
    nextQuote: 'New Quote',
    focusCompletedTitle: 'Focus Session Completed! 🎉',
    focusCompletedBody: 'Great job! Time for a 5 minute break ☕',
    breakCompletedTitle: 'Break Time Ended! 🚀',
    breakCompletedBody: 'Ready for the next focus session?',

    // Widget: World Clock
    editLocations: 'Edit Locations',
    selectCity: 'Select City / Timezone',

    // Widget: Bookmark Stats
    totalLabel: 'Total',
    foldersLabel: 'Folders',
    directLinksLabel: 'Links',
    syncLabel: 'Sync',
    securityLabel: 'Security',
    encryptedBadge: 'AES-256',
    syncNever: 'Never',

    // Bookmark View
    searchBookmarkPlaceholder: 'Search folder or bookmark…',
    filterAll: 'All',
    filterFolders: 'Folders',
    filterLinks: 'Links',
    back: 'Back',
    rootFolder: 'Main',
    sectionFolder: 'FOLDERS',
    sectionLinks: 'LINKS',
    noFoldersFound: 'No folders found.',
    noBookmarksToolbar: 'No bookmarks in toolbar yet.',
    untitled: '(untitled)',
    untitledFolder: 'Untitled',

    // Folder Card
    dragHere: 'Move here',
    dragDropToFolder: 'Drop to enter "{title}"',
    dragSwapGrid: 'Swap Grid Position',
    dragHoldShiftInfo: 'Hold Shift to move into folder',
    renameFolder: 'Rename',
    deleteFolder: 'Delete folder',
    dragFolderTooltip: 'Drag folder position',
    emptyFolder: 'Folder is empty',
    deleteFolderConfirm: 'Are you sure you want to delete folder "{title}"?\n\nThis action cannot be undone.',
    dragBookmarkTooltip: 'Drag',
    deleteBookmarkTooltip: 'Delete',

    // Trash View
    trashNoticeTitle: '30-Day Auto Cleanup',
    trashNoticeDesc: 'Items in Trash Bin will be permanently deleted after 30 days. Synchronized with database across all devices.',
    trashEmptyTitle: 'Trash Bin is Empty',
    trashEmptyDesc: 'No deleted bookmarks or folders found.',
    searchTrashPlaceholder: 'Search items in trash…',
    restoreBtn: 'Restore',
    deletePermanentBtn: 'Delete Permanently',
    emptyTrashBtn: 'Empty Trash',
    emptyTrashConfirm: 'Are you sure you want to permanently delete all items in the Trash Bin?\n\nThis action cannot be undone.',
    deletePermanentConfirm: 'Are you sure you want to permanently delete "{title}"?\n\nThis action cannot be undone.',
    daysLeft: '{days} days left',
    deletedAgo: 'Deleted {time} ago',
    itemRestored: 'Item successfully restored',
    restoreSelected: 'Restore Selected ({count})',
    deletePermanentSelected: 'Delete Permanently ({count})',
    deleteSelectedPermanentConfirm: 'Are you sure you want to permanently delete {count} selected items?\n\nThis action cannot be undone.',
    restoreSuccessNotice: 'Successfully restored {count} items from Trash Bin.',
    deletePermanentSuccessNotice: 'Successfully deleted {count} items permanently.',
    showingTrashPageText: 'Showing page {page} of {pageCount} ({totalItems} items)',
    colItemType: 'Type',

    // Settings Modal
    settingsModalTitle: 'Settings',
    tabGeneral: 'General',
    tabSecurity: 'Security',
    tabSessions: 'Sessions',
    tabStorage: 'Storage',
    tabCredits: 'Credits',
    tabAbout: 'About',
    deviceNameLabel: 'Device Name',
    deviceNameDesc: 'This name is used to identify sync history between your devices.',
    deviceNamePlaceholder: 'E.g., Brave - Main Laptop',
    syncIntervalLabel: 'Sync Interval',
    syncIntervalDesc: 'Choose how frequently your bookmarks are automatically synced to the server.',
    interval5m: '5 Minutes',
    interval15m: '15 Minutes',
    interval30m: '30 Minutes',
    interval60m: '60 Minutes',
    intervalManual: 'Manual',
    themeSectionTitle: 'Theme & Accent Color',
    themeModeLabel: 'Display Mode',
    themePresetLabel: 'Color Scheme',
    customAccentTitle: 'Select Accent Color (HEX)',
    githubImportTitle: 'Import Color Scheme from GitHub',
    githubImportBtn: 'Import',
    githubLoading: 'Loading…',
    githubImportError: 'Invalid GitHub JSON format (requires "accentHex", "accent", or "primary").',
    githubFetchError: 'Failed to fetch data from GitHub URL.',
    secretKeyLabel: 'Secret Key',
    secretKeyDesc: 'Used for end-to-end encryption. Never share it with anyone.',
    onboardingPlaceholder: 'Your secret key',
    onboardingCreateBtn: 'Create Secret Key',
    onboardingLoginBtn: 'Log In',
    onboardingSubtext: 'Enter your 12-word Secret Key to restore and synchronize bookmarks.',
    onboardingTitleCreate: 'Secret Key (12 Words)',
    onboardingRegenerate: 'Regenerate',
    onboardingDownloadTxt: 'Download .txt',
    onboardingCopy: 'Copy',
    onboardingCopied: 'Copied',
    onboardingDownloadedMsg: 'Backup file downloaded. Keep this file safe.',
    onboardingBack: 'Back',
    onboardingContinue: 'I Saved It, Continue',
    onboardingSecurityNote: 'Secret Key is never sent to the server. Encrypted end-to-end (E2E) to Cloudflare.',
    onboardingEmptyError: 'Please enter your 12-word Secret Key first.',
    onboardingProcessing: 'Processing…',
    hide: 'Hide',
    show: 'Show',
    copyKey: 'Copy Key',
    importantAlertTitle: 'IMPORTANT & SECRET',
    importantAlertDesc: 'Store this Secret Key in a safe and private place. Anyone with access to this key can restore, read, and modify all your bookmark data. We do not store your key on our servers, so lost keys cannot be recovered.',
    downloadKeyBtn: 'Download Secret Key (.txt)',
    downloadedKeyBtn: 'Secret Key Downloaded!',
    deviceSessionsTitle: 'Device Sessions',
    deviceSessionsSubtitle: 'Manage devices connected to your account and their last sync.',
    reload: 'Reload',
    loadingDevices: 'Loading devices list…',
    noDevices: 'No registered devices found.',
    thisDeviceBadge: 'Current',
    activeAgo: 'Active {time}',
    colLastSync: 'Last Sync',
    terminateSessionTooltip: 'Terminate Session',
    backupRecoveryLabel: 'Backup & Data Recovery',
    backupRecoveryDesc: 'Export or import your local bookmarks backup in JSON format.',
    exportBookmarksTitle: 'Export Bookmarks',
    exportBookmarksDesc: 'Download a JSON backup copy of all your local bookmarks.',
    exportJsonBtn: 'Export JSON',
    importBookmarksTitle: 'Import Bookmarks',
    importBookmarksDesc: 'Restore or add bookmarks from a JSON backup file.',
    importingBtn: 'Importing…',
    importedSuccessBtn: 'Successfully Imported!',
    importJsonBtn: 'Import JSON',
    importError: 'Failed to import bookmarks file. Make sure the JSON file format is valid.',
    cacheCleanupLabel: 'Cache Cleanup',
    cacheCleanupDesc: 'Clear local sync cache if you encounter data discrepancy issues.',
    clearLocalCacheBtn: 'Clear Local Cache',
    clearCacheConfirm: 'Are you sure you want to clear Syntive local cache?',
    clearCacheSuccess: 'Local data cache has been cleared.',
    aboutAppDescTitle: 'About Application',
    aboutAppDesc: 'Syntive is a modern browser extension designed to securely synchronize bookmarks across your devices without server intermediaries reading your data. All bookmarks are encrypted client-side using 256-bit AES-GCM encryption based on your Secret Key (12 Mnemonic Words).',
    developerLabel: 'Developer:',
    databaseServerLabel: 'Database Server:',
    databaseServerValue: 'Cloudflare',
    licenseLabel: 'License:',
    repoLabel: 'Repository:',
    logoutBtn: 'Log out',
    saveChangesBtn: 'Save Changes',
    savingBtn: 'Saving…',

    // Credits Tab
    creditsTitle: 'Credits & Attribution',
    creditsSubtitle: 'Appreciation and attribution for public APIs, audio streams, and data services powering Syntive:',
    creditsQuranRadioTitle: '24/7 Quran Radio',
    creditsQuranRadioDesc: 'Quran recitation audio streams from Sheikh Mishary Al-Afasy, Al-Sudais, Al-Ghamdi, Al-Muaiqly, Al-Dosari, & Main Radio.',
    creditsQuranRadioSource: 'Qurango Radio Network',
    creditsNatureRadioTitle: 'Nature Radio & Ambience',
    creditsNatureRadioDesc: 'Natural ambient soundscapes (Rain, Storm, Waves, Birds, Train, Cave, Cafe, etc.).',
    creditsNatureRadioSource: 'Noisekun Ambient Sound CDN',
    creditsMotivationalQuotesTitle: 'Motivational Quotes',
    creditsMotivationalQuotesDesc: 'Daily inspirational quotes and wisdom.',
    creditsMotivationalQuotesSource: 'Liu Purnomo Quotes API',
    creditsIslamicQuotesTitle: 'Islamic Wisdom & Hadith',
    creditsIslamicQuotesDesc: 'Authentic Hadith extracts and Islamic wisdom.',
    creditsIslamicQuotesSource: 'MyQuran Hadith API',
    creditsIconsTitle: 'UI Icon Set',
    creditsIconsDesc: 'Modern interface iconography.',
    creditsIconsSource: 'Reicon Icons',

    // Support Modal
    supportModalTitle: 'Support & Donate',
    supportModalDesc: 'Thank you for using Syntive! If you find this app helpful, please consider supporting its development via the donation options below:',
    indonesiaQris: 'Indonesia (QRIS)',
    indonesiaBadge: 'Indonesia',
    qrisDesc: 'Scan QRIS donation using GoPay, OVO, DANA, ShopeePay, LinkAja, BCA, Mandiri, or other Indonesian m-Banking apps.',
    qrisFooter: 'Bisma QRIS / e-Wallet Support',
    globalPaypal: 'Support via PayPal',
    globalBadge: 'International',
    paypalDesc: 'Support Syntive development through our PayPal page.',
    openPaypalBtn: 'Open PayPal page',
    copyPaypalTooltip: 'Copy PayPal address',

    // Tools & Utilities
    toolsTitle: 'Tools & Utilities',
    toolsDesc: 'Smart utility tools and maintenance to optimize your bookmark collection.',
    duplicateToolTitle: 'Scan & Find Duplicate Bookmarks',
    duplicateToolDesc: 'Discover and cleanup duplicate bookmark links to keep your folders organized.',
    scanButton: 'Start Scan',
    rescanButton: 'Scan Again',
    scanningText: 'Scanning your bookmarks...',
    scanReadyText: 'Ready to scan duplicate bookmarks',
    duplicatesSummaryText: '{groups} groups ({totalItems} duplicates)',
    matchStrategyLabel: 'Matching Strategy:',
    matchStrict: 'Strict (Identical URL)',
    matchNormalized: 'Normalized (URL Normalization)',
    noDuplicatesFound: 'Awesome! No duplicate bookmarks found.',
    duplicatesFoundSummary: 'Found {groups} duplicate URL groups ({totalItems} duplicate links).',
    autoSelectDuplicates: 'Auto-Select (Keep Oldest)',
    autoSelectShort: 'Auto Select',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    deleteSelected: 'Delete Selected ({count})',
    deletingText: 'Deleting...',
    keepOriginalTag: 'Primary',
    duplicateTag: 'Duplicate',
    deleteSuccessNotice: 'Successfully moved {count} duplicates to Trash.',
    colTitleUrl: 'Title & Link',
    colFolderLocation: 'Folder',
    colStatus: 'Status',
    colDateAdded: 'Date',
    colAction: 'Action',
    noScanDataTitle: 'No Scan Data Yet',
    noScanDataDesc: 'Click "Start Scan" button above to detect duplicate links.',
    groupLabel: 'Group #{index}:',
    duplicateCountBadge: '{count} duplicate links',
    showingPageText: 'Showing page {page} of {pageCount} ({totalGroups} duplicate groups)',
  },
} as const;

export type TranslationKey = keyof typeof DICTIONARY['id'];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  getRandomGreeting: () => string;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>('id');

  React.useEffect(() => {
    browser.storage.local.get('syntive.language').then((data) => {
      if (data['syntive.language'] === 'en' || data['syntive.language'] === 'id') {
        setLanguageState(data['syntive.language']);
      }
    }).catch(() => {});
  }, []);

  const setLanguage = React.useCallback((lang: Language) => {
    setLanguageState(lang);
    browser.storage.local.set({ 'syntive.language': lang }).catch(() => {});
  }, []);

  const t = React.useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dict = (DICTIONARY[language] || DICTIONARY.id) as Record<string, string>;
      let text: string = dict[key] || (DICTIONARY.id as Record<string, string>)[key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return text;
    },
    [language]
  );

  const getRandomGreeting = React.useCallback(() => {
    const list = SEARCH_GREETINGS[language] || SEARCH_GREETINGS.id;
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getRandomGreeting }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
