/* =========================================================
   APP.JS - OPTIMIZED + MODERN COLOR SYSTEM
   ---------------------------------------------------------
   NAVIGASI + DASHBOARD + CHART
   TOTAL JAM LEMBUR = DURASI × JUMLAH KARYAWAN

   TEMA:
   - Primary   : Merah LINFOX
   - Secondary : Navy / Slate
   - Accent    : Amber
   - Background: Soft Gray
   ---------------------------------------------------------
   TIDAK MENGUBAH LOGIKA DATABASE / KARYAWAN / PLANNING
========================================================= */


/* =========================================================
   CHART INSTANCE
========================================================= */

let planningChartInstance = null;
let durasiChartInstance = null;
let karyawanChartInstance = null;


/* =========================================================
   STATE
========================================================= */

const AppState = {
    initialized: false,
    databaseReady: false,
    dashboardInitialized: false
};


/* =========================================================
   COLOR SYSTEM
========================================================= */

const APP_COLORS = {

    primary: "#D71920",
    primaryDark: "#B51218",
    primarySoft: "#FDEBEC",

    navy: "#172033",
    navyLight: "#24324A",

    slate: "#64748B",
    slateLight: "#94A3B8",

    amber: "#F59E0B",
    amberSoft: "#FFF7E6",

    green: "#16A34A",
    greenSoft: "#EAF8EF",

    blue: "#2563EB",
    blueSoft: "#EFF6FF",

    purple: "#7C3AED",
    purpleSoft: "#F5F3FF",

    background: "#F6F7F9",
    surface: "#FFFFFF",

    border: "#E5E7EB",
    text: "#172033",
    textSoft: "#64748B",

    danger: "#DC2626"

};


/* =========================================================
   CONSTANT
========================================================= */

const PAGE_INFO = {

    dashboard: [
        "Dashboard",
        "Ringkasan planning lembur karyawan"
    ],

    karyawan: [
        "Database Karyawan",
        "Kelola data karyawan"
    ],

    planning: [
        "Planning Lembur",
        "Atur jadwal lembur karyawan"
    ]

};


/* =========================================================
   DOM HELPER
========================================================= */

function appEl(id) {

    return document.getElementById(id);

}


function setText(id, value) {

    const el = appEl(id);

    if (el) {
        el.textContent = value;
    }

}


/* =========================================================
   DATA HELPER
========================================================= */

function getPlanningData() {

    if (Array.isArray(window.planning)) {
        return window.planning;
    }

    return [];

}


function getKaryawanData() {

    if (Array.isArray(window.karyawan)) {
        return window.karyawan;
    }

    return [];

}


/* =========================================================
   DEBUG
========================================================= */

function debugAppData() {

    console.log(
        "[APP] Karyawan:",
        getKaryawanData().length
    );

    console.log(
        "[APP] Planning:",
        getPlanningData().length
    );

}


/* =========================================================
   JUMLAH KARYAWAN DALAM PLANNING
========================================================= */

function getJumlahKaryawanPlanning(item) {

    if (!item) {
        return 0;
    }


    /* ---------------------------------------------
       FORMAT ARRAY
    --------------------------------------------- */

    if (Array.isArray(item.karyawan)) {
        return item.karyawan.length;
    }


    if (Array.isArray(item.karyawanList)) {
        return item.karyawanList.length;
    }


    if (Array.isArray(item.karyawan_ids)) {
        return item.karyawan_ids.length;
    }


    if (Array.isArray(item.kodeKaryawanList)) {
        return item.kodeKaryawanList.length;
    }


    if (Array.isArray(item.kode_karyawan_list)) {
        return item.kode_karyawan_list.length;
    }


    /* ---------------------------------------------
       FORMAT JUMLAH LANGSUNG
    --------------------------------------------- */

    if (
        item.jumlahKaryawan !== undefined &&
        item.jumlahKaryawan !== null
    ) {

        return Number(item.jumlahKaryawan) || 0;

    }


    if (
        item.jumlah_karyawan !== undefined &&
        item.jumlah_karyawan !== null
    ) {

        return Number(item.jumlah_karyawan) || 0;

    }


    return 0;

}


/* =========================================================
   HITUNG DURASI MENIT
========================================================= */

function getDurasiMenitPlanning(item) {

    if (!item) {
        return 0;
    }


    /* ---------------------------------------------
       1. DURASI MENIT LANGSUNG
    --------------------------------------------- */

    if (
        item.durasiMenit !== undefined &&
        item.durasiMenit !== null
    ) {

        const menit =
            Number(item.durasiMenit);

        if (
            Number.isFinite(menit) &&
            menit > 0
        ) {

            return menit;

        }

    }


    /* ---------------------------------------------
       2. FORMAT SUPABASE
    --------------------------------------------- */

    if (
        item.durasi_menit !== undefined &&
        item.durasi_menit !== null
    ) {

        const menit =
            Number(item.durasi_menit);

        if (
            Number.isFinite(menit) &&
            menit > 0
        ) {

            return menit;

        }

    }


    /* ---------------------------------------------
       3. DARI JAM MULAI & SELESAI
    --------------------------------------------- */

    const jamMulai =
        item.jamMulai ||
        item.jam_mulai;

    const jamSelesai =
        item.jamSelesai ||
        item.jam_selesai;


    if (
        jamMulai &&
        jamSelesai
    ) {

        const mulai =
            parseTimeToMinutes(jamMulai);

        const selesai =
            parseTimeToMinutes(jamSelesai);


        if (
            mulai !== null &&
            selesai !== null
        ) {

            let selisih =
                selesai - mulai;


            /*
             * Kalau lewat tengah malam
             */

            if (selisih < 0) {
                selisih += 24 * 60;
            }


            return selisih;

        }

    }


    return 0;

}


/* =========================================================
   PARSE JAM
========================================================= */

function parseTimeToMinutes(time) {

    if (!time) {
        return null;
    }


    const value =
        String(time).trim();


    const match =
        value.match(
            /^(\d{1,2}):(\d{2})/
        );


    if (!match) {
        return null;
    }


    const jam =
        Number(match[1]);

    const menit =
        Number(match[2]);


    if (
        jam < 0 ||
        jam > 23 ||
        menit < 0 ||
        menit > 59
    ) {

        return null;

    }


    return (
        jam * 60 +
        menit
    );

}


/* =========================================================
   TOTAL JAM PER PLANNING
========================================================= */

function getTotalJamPlanning(item) {

    const durasiMenit =
        getDurasiMenitPlanning(item);

    if (!durasiMenit) {
        return 0;
    }

    return durasiMenit / 60;

}


/* =========================================================
   TOTAL SEMUA JAM
========================================================= */

function getTotalJamLembur(planning) {

    if (!Array.isArray(planning)) {
        return 0;
    }


    let totalJam = 0;


    for (
        const item of planning
    ) {

        totalJam +=
            getTotalJamPlanning(item);

    }


    return totalJam;

}


/* =========================================================
   FORMAT TOTAL JAM
========================================================= */

function formatTotalJam(jam) {

    const value =
        Number(jam) || 0;


    if (
        Number.isInteger(value)
    ) {

        return `${value} Jam`;

    }


    return `${value.toFixed(1)} Jam`;

}


/* =========================================================
   HTML HELPER
========================================================= */

function escapePlanningHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   TANGGAL
========================================================= */

function getToday() {

    const now =
        new Date();


    return [

        now.getFullYear(),

        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        ),

        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        )

    ].join("-");

}


function formatPlanningDate(tanggal) {

    if (
        typeof formatTanggalPlanning ===
        "function"
    ) {

        return formatTanggalPlanning(
            tanggal
        );

    }


    return tanggal || "-";

}


/* =========================================================
   FORMAT DURASI
========================================================= */

function formatPlanningDuration(item) {

    const menit =
        getDurasiMenitPlanning(item);


    if (!menit) {
        return "-";
    }


    if (
        typeof formatDurasiPlanning ===
        "function"
    ) {

        return formatDurasiPlanning(
            menit
        );

    }


    const jam =
        menit / 60;


    if (
        Number.isInteger(jam)
    ) {

        return `${jam} Jam`;

    }


    return `${jam.toFixed(1)} Jam`;

}


/* =========================================================
   NAVIGASI
========================================================= */

function showPage(
    pageId,
    button = null
) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.toggle(
                "active-page",
                page.id === pageId
            );

        });


    document
        .querySelectorAll(".menu-item")
        .forEach(item => {

            item.classList.remove(
                "active"
            );

        });


    if (button) {

        button.classList.add(
            "active"
        );

    }


    const info =
        PAGE_INFO[pageId];


    if (info) {

        setText(
            "pageTitle",
            info[0]
        );

        setText(
            "pageSubtitle",
            info[1]
        );

    }


    switch (pageId) {

        case "dashboard":

            updateDashboard();

            break;


        case "karyawan":

            if (
                typeof renderKaryawan ===
                "function"
            ) {

                renderKaryawan();

            }

            break;


        case "planning":

            if (
                typeof updateKaryawanDropdown ===
                "function"
            ) {

                updateKaryawanDropdown();

            }


            if (
                typeof renderPlanning ===
                "function"
            ) {

                renderPlanning();

            }

            break;

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    updateDashboardStats();

    updateDashboardCharts();

    renderDashboardPlanning();

    AppState.dashboardInitialized =
        true;

}


/* =========================================================
   DASHBOARD STATISTICS
========================================================= */

function updateDashboardStats() {

    const planning =
        getPlanningData();


    /* ---------------------------------------------
       TOTAL KARYAWAN
    --------------------------------------------- */

    let totalKaryawan = 0;


    if (
        typeof getKaryawanAktif ===
        "function"
    ) {

        const aktif =
            getKaryawanAktif();

        totalKaryawan =
            Array.isArray(aktif)
                ? aktif.length
                : 0;

    } else {

        totalKaryawan =
            getKaryawanData().length;

    }


    /* ---------------------------------------------
       TOTAL JAM
       DURASI × JUMLAH KARYAWAN
    --------------------------------------------- */

    let totalJam = 0;

    for (const item of planning) {

        const durasi =
            getTotalJamPlanning(item);

        const jumlah =
            getJumlahKaryawanPlanning(item);

        totalJam +=
            durasi * jumlah;

    }


    /* ---------------------------------------------
       PLANNING HARI INI
    --------------------------------------------- */

    let karyawanLemburHariIni = 0;

    const today = getToday();


    /* ---------------------------------------------
       DURASI
    --------------------------------------------- */

    const durasi = {

        240: 0,

        480: 0,

        720: 0

    };


    for (
        const item of planning
    ) {

        const jumlah =
            getJumlahKaryawanPlanning(
                item
            );


        const menit =
            getDurasiMenitPlanning(
                item
            );


        if (
            String(
                item.tanggal || ""
            ) === today
        ) {

            karyawanLemburHariIni +=
                jumlah;

        }


        if (
            durasi[menit] !==
            undefined
        ) {

            durasi[menit] +=
                jumlah;

        }

    }


    /* ---------------------------------------------
       TAMPILKAN
    --------------------------------------------- */

    setText(
        "totalKaryawan",
        totalKaryawan
    );


    setText(
        "totalPlanning",
        planning.length
    );


    setText(
        "totalJam",
        formatTotalJam(
            totalJam
        )
    );


    setText(
        "planningHariIni",
        karyawanLemburHariIni
    );


    setText(
        "count4Jam",
        durasi[240]
    );


    setText(
        "count8Jam",
        durasi[480]
    );


    setText(
        "count12Jam",
        durasi[720]
    );

}


/* =========================================================
   CHART UPDATE
========================================================= */

function updateDashboardCharts() {

    if (
        typeof Chart ===
        "undefined"
    ) {

        console.warn(
            "[APP] Chart.js belum tersedia."
        );

        return;

    }


    const planning =
        getPlanningData();


    renderPlanningChart(
        planning
    );


    renderDurasiChart(
        planning
    );


    renderKaryawanChart(
        planning
    );

}


/* =========================================================
   GRAFIK PLANNING
========================================================= */

function renderPlanningChart(
    planning = getPlanningData()
) {

    const canvas =
        appEl(
            "planningChart"
        );


    if (
        !canvas ||
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    const tanggalMap =
        Object.create(null);


    for (
        const item of planning
    ) {

        const tanggal =
            String(
                item.tanggal || ""
            );


        if (!tanggal) {
            continue;
        }


        tanggalMap[tanggal] =
            (
                tanggalMap[tanggal] ||
                0
            ) +
            getJumlahKaryawanPlanning(
                item
            );

    }


    const tanggal =
        Object.keys(
            tanggalMap
        ).sort();


    const labels =
        tanggal.map(
            formatPlanningDate
        );


    const values =
        tanggal.map(
            key =>
                tanggalMap[key]
        );


    const data = {

        labels,

        datasets: [{

            label:
                "Mand Power",

            data:
                values,

            borderColor:
                APP_COLORS.primary,

            backgroundColor:
                "rgba(215, 25, 32, 0.10)",

            borderWidth:
                2.5,

            tension:
                0.35,

            fill:
                true,

            pointRadius:
                4,

            pointHoverRadius:
                6,

            pointBackgroundColor:
                APP_COLORS.surface,

            pointBorderColor:
                APP_COLORS.primary,

            pointBorderWidth:
                2

        }]

    };


    if (
        planningChartInstance
    ) {

        planningChartInstance.data =
            data;


        planningChartInstance.update(
            "none"
        );


        return;

    }


    planningChartInstance =
        new Chart(
            canvas,
            {

                type:
                    "line",

                data,

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    interaction: {

                        intersect:
                            false,

                        mode:
                            "index"

                    },

                    plugins: {

                        legend: {

                            labels: {

                                color:
                                    APP_COLORS.text,

                                font: {

                                    weight:
                                        "600"

                                }

                            }

                        }

                    },

                    scales: {

                        x: {

                            grid: {

                                color:
                                    "rgba(148,163,184,0.12)"

                            },

                            ticks: {

                                color:
                                    APP_COLORS.textSoft

                            }

                        },

                        y: {

                            beginAtZero:
                                true,

                            grid: {

                                color:
                                    "rgba(148,163,184,0.12)"

                            },

                            ticks: {

                                color:
                                    APP_COLORS.textSoft,

                                precision:
                                    0

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   GRAFIK DURASI
========================================================= */

function renderDurasiChart(
    planning = getPlanningData()
) {

    const canvas =
        appEl(
            "durasiChart"
        );


    if (
        !canvas ||
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    const count = {

        240: 0,

        480: 0,

        720: 0

    };


    for (
        const item of planning
    ) {

        const menit =
            getDurasiMenitPlanning(
                item
            );


        if (
            count[menit] !==
            undefined
        ) {

            count[menit] +=
                getJumlahKaryawanPlanning(
                    item
                );

        }

    }


    const data = {

        labels: [

            "4 Jam",

            "8 Jam",

            "12 Jam"

        ],

        datasets: [{

            data: [

                count[240],

                count[480],

                count[720]

            ],

            backgroundColor: [

                APP_COLORS.primary,

                APP_COLORS.amber,

                APP_COLORS.navyLight

            ],

            borderWidth:
                0,

            hoverOffset:
                6

        }]

    };


    if (
        durasiChartInstance
    ) {

        durasiChartInstance.data =
            data;


        durasiChartInstance.update(
            "none"
        );


        return;

    }


    durasiChartInstance =
        new Chart(
            canvas,
            {

                type:
                    "doughnut",

                data,

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    cutout:
                        "68%",

                    plugins: {

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                color:
                                    APP_COLORS.text,

                                padding:
                                    18,

                                usePointStyle:
                                    true,

                                pointStyle:
                                    "circle"

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   TOP KARYAWAN
========================================================= */

function renderKaryawanChart(
    planning = getPlanningData()
) {

    const canvas =
        appEl(
            "karyawanChart"
        );


    if (
        !canvas ||
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    const rankingMap =
        Object.create(null);


    for (
        const item of planning
    ) {

        if (
            !Array.isArray(
                item.karyawan
            )
        ) {

            continue;

        }


        for (
            const karyawan
            of item.karyawan
        ) {

            const id =
                String(

                    karyawan.id ||

                    karyawan.idKaryawan ||

                    karyawan.nik ||

                    karyawan.NIK ||

                    karyawan.kode_karyawan ||

                    karyawan.kodeKaryawan ||

                    ""

                ).trim();


            if (!id) {
                continue;
            }


            const nama =
                String(

                    karyawan.nama ||

                    karyawan.namaKaryawan ||

                    karyawan.Nama ||

                    karyawan.nama_karyawan ||

                    id

                ).trim();


            if (
                !rankingMap[id]
            ) {

                rankingMap[id] = {

                    nama,

                    jumlah:
                        0

                };

            }


            rankingMap[id].jumlah++;

        }

    }


    const ranking =
        Object.values(
            rankingMap
        )
            .sort(
                (a, b) =>
                    b.jumlah -
                    a.jumlah
            )
            .slice(
                0,
                10
            );


    const data = {

        labels:
            ranking.map(
                item =>
                    item.nama
            ),

        datasets: [{

            label:
                "Jumlah Planning",

            data:
                ranking.map(
                    item =>
                        item.jumlah
                ),

            backgroundColor:
                APP_COLORS.primary,

            borderRadius:
                7,

            borderSkipped:
                false,

            hoverBackgroundColor:
                APP_COLORS.primaryDark

        }]

    };


    if (
        karyawanChartInstance
    ) {

        karyawanChartInstance.data =
            data;


        karyawanChartInstance.update(
            "none"
        );


        return;

    }


    karyawanChartInstance =
        new Chart(
            canvas,
            {

                type:
                    "bar",

                data,

                options: {

                    indexAxis:
                        "y",

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display:
                                false

                        }

                    },

                    scales: {

                        x: {

                            beginAtZero:
                                true,

                            grid: {

                                color:
                                    "rgba(148,163,184,0.12)"

                            },

                            ticks: {

                                color:
                                    APP_COLORS.textSoft,

                                precision:
                                    0

                            }

                        },

                        y: {

                            grid: {

                                display:
                                    false

                            },

                            ticks: {

                                color:
                                    APP_COLORS.text,

                                font: {

                                    weight:
                                        "600"

                                }

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   TANGGAL SEKARANG
========================================================= */

function tampilkanTanggal() {

    const element =
        appEl(
            "tanggalSekarang"
        );


    if (!element) {
        return;
    }


    element.textContent =
        new Date()
            .toLocaleDateString(
                "id-ID",
                {

                    weekday:
                        "long",

                    day:
                        "numeric",

                    month:
                        "long",

                    year:
                        "numeric"

                }
            );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeAllModals() {

    if (
        typeof closePenaltyModal ===
        "function"
    ) {

        closePenaltyModal();

    }


    if (
        typeof closePlanningModal ===
        "function"
    ) {

        closePlanningModal();

    }


    if (
        typeof tutupRiwayatLembur ===
        "function"
    ) {

        tutupRiwayatLembur();

    }

}


/* =========================================================
   PLANNING TERBARU
========================================================= */

function renderDashboardPlanning() {

    const tbody =
        appEl(
            "dashboardPlanning"
        );


    if (!tbody) {
        return;
    }


    const planning =
        getPlanningData();


    if (!planning.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="
                        text-align:center;
                        color:${APP_COLORS.textSoft};
                        padding:28px;
                    "
                >

                    Belum ada planning

                </td>

            </tr>

        `;

        return;

    }


    const data =
        planning
            .slice()
            .sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.createdAt ||
                            a.created_at ||
                            a.tanggal ||
                            0
                        ).getTime();


                    const dateB =
                        new Date(
                            b.createdAt ||
                            b.created_at ||
                            b.tanggal ||
                            0
                        ).getTime();


                    return dateB - dateA;

                }
            )
            .slice(
                0,
                5
            );


    const fragment =
        document.createDocumentFragment();


    for (
        const item of data
    ) {

        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

            <td>
                ${escapePlanningHTML(
                    formatPlanningDate(
                        item.tanggal
                    )
                )}
            </td>

            <td>
                ${escapePlanningHTML(
                    item.idPlanning ||
                    item.id ||
                    "-"
                )}
            </td>

            <td>
                ${getJumlahKaryawanPlanning(
                    item
                )}
            </td>

            <td>
                ${escapePlanningHTML(
                    `${
                        item.jamMulai ||
                        item.jam_mulai ||
                        "-"
                    } - ${
                        item.jamSelesai ||
                        item.jam_selesai ||
                        "-"
                    }`
                )}
            </td>

            <td>
                ${escapePlanningHTML(
                    formatPlanningDuration(
                        item
                    )
                )}
            </td>

        `;


        fragment.appendChild(
            tr
        );

    }


    tbody.replaceChildren(
        fragment
    );

}


/* =========================================================
   MODAL BACKDROP
========================================================= */

function setupModalBackdrop(
    modalId,
    closeFunction
) {

    const modal =
        appEl(
            modalId
        );


    if (
        !modal ||
        modal.dataset.backdropListener
    ) {

        return;

    }


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target !==
                modal
            ) {

                return;

            }


            if (
                typeof closeFunction ===
                "function"
            ) {

                closeFunction();

            }

        }
    );


    modal.dataset.backdropListener =
        "true";

}


/* =========================================================
   REFRESH APP
========================================================= */

function refreshApp() {

    console.log(
        "[APP] Refresh dashboard"
    );


    debugAppData();


    if (
        typeof updateKaryawanDropdown ===
        "function"
    ) {

        updateKaryawanDropdown();

    }


    if (
        typeof renderKaryawan ===
        "function"
    ) {

        renderKaryawan();

    }


    if (
        typeof renderPlanning ===
        "function"
    ) {

        renderPlanning();

    }


    updateDashboard();

}


/* =========================================================
   INITIAL DATA
========================================================= */

function loadInitialData() {

    console.log(
        "[APP] DOM loaded"
    );


    refreshApp();


    tampilkanTanggal();


    AppState.initialized =
        true;

}


/* =========================================================
   DATABASE READY
========================================================= */

function handleDatabaseReady() {

    console.log(
        "[APP] databaseReady diterima"
    );


    AppState.databaseReady =
        true;


    requestAnimationFrame(
        () => {

            refreshApp();

        }
    );

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadInitialData();


        setupModalBackdrop(
            "planningModal",
            typeof closePlanningModal ===
                "function"
                ? closePlanningModal
                : null
        );


        setupModalBackdrop(
            "penaltyModal",
            typeof closePenaltyModal ===
                "function"
                ? closePenaltyModal
                : null
        );


        setupModalBackdrop(
            "historyKaryawanModal",
            typeof tutupRiwayatLembur ===
                "function"
                ? tutupRiwayatLembur
                : null
        );


        if (
            !document.body.dataset
                .escapeListener
        ) {

            document.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Escape"
                    ) {

                        closeAllModals();

                    }

                }
            );


            document.body.dataset
                .escapeListener =
                "true";

        }

    }
);


/* =========================================================
   DATABASE READY EVENT
========================================================= */

document.addEventListener(
    "databaseReady",
    handleDatabaseReady
);


/* =========================================================
   GLOBAL EXPORT
========================================================= */

window.getPlanningData =
    getPlanningData;

window.getKaryawanData =
    getKaryawanData;

window.getJumlahKaryawanPlanning =
    getJumlahKaryawanPlanning;

window.getDurasiMenitPlanning =
    getDurasiMenitPlanning;

window.getTotalJamPlanning =
    getTotalJamPlanning;

window.getTotalJamLembur =
    getTotalJamLembur;

window.showPage =
    showPage;

window.updateDashboard =
    updateDashboard;

window.updateDashboardStats =
    updateDashboardStats;

window.updateDashboardCharts =
    updateDashboardCharts;

window.renderPlanningChart =
    renderPlanningChart;

window.renderDurasiChart =
    renderDurasiChart;

window.renderKaryawanChart =
    renderKaryawanChart;

window.renderDashboardPlanning =
    renderDashboardPlanning;

window.tampilkanTanggal =
    tampilkanTanggal;

window.closeAllModals =
    closeAllModals;

window.escapePlanningHTML =
    escapePlanningHTML;

window.refreshApp =
    refreshApp;


/* =========================================================
   GLOBAL COLOR SYSTEM
========================================================= */

window.APP_COLORS =
    APP_COLORS;


/* =========================================================
   LOAD MESSAGE
========================================================= */

console.log(
    "app.js optimized + modern color system loaded"
);
