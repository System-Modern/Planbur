/* =====================================================
   APP.JS
   NAVIGASI + DASHBOARD + CHART
===================================================== */


/* =====================================================
   NAVIGASI
===================================================== */

function showPage(pageId, button = null) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active-page");
    });

    const page = document.getElementById(pageId);

    if (page) {
        page.classList.add("active-page");
    }

    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    } else {

        const menu = document.querySelector(
            `.menu-item[onclick*="'${pageId}'"]`
        );

        if (menu) {
            menu.classList.add("active");
        }
    }


    /* =================================================
       JUDUL HALAMAN
    ================================================= */

    const titles = {

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


    const title = document.getElementById("pageTitle");
    const subtitle = document.getElementById("pageSubtitle");

    if (titles[pageId]) {

        if (title) {
            title.textContent = titles[pageId][0];
        }

        if (subtitle) {
            subtitle.textContent = titles[pageId][1];
        }

    }


    /* =================================================
       LOAD HALAMAN
    ================================================= */

    if (pageId === "dashboard") {

        updateDashboard();

    }


    if (pageId === "karyawan") {

        if (typeof renderKaryawan === "function") {
            renderKaryawan();
        }

    }


    if (pageId === "planning") {

        if (typeof updateKaryawanDropdown === "function") {
            updateKaryawanDropdown();
        }

        if (typeof renderPlanningKaryawan === "function") {

            const modal =
                document.getElementById("planningModal");

            if (
                modal &&
                (
                    modal.classList.contains("active") ||
                    modal.style.display === "flex"
                )
            ) {

                renderPlanningKaryawan();

            }

        }

        if (typeof renderPlanning === "function") {
            renderPlanning();
        }

    }

}


/* =====================================================
   CHART INSTANCE
===================================================== */

let planningChartInstance = null;
let durasiChartInstance = null;
let karyawanChartInstance = null;


/* =====================================================
   UPDATE DASHBOARD
===================================================== */

function updateDashboard() {

    updateDashboardStats();
    updateDashboardCharts();
    renderDashboardPlanning();

}


/* =====================================================
   UPDATE STATISTIK DASHBOARD
===================================================== */

function updateDashboardStats() {

    const dataPlanning =
        Array.isArray(window.planning)
            ? window.planning
            : [];


    /* =================================================
       TOTAL KARYAWAN
    ================================================= */

    let totalKaryawan = 0;

    if (typeof getKaryawanAktif === "function") {

        totalKaryawan =
            getKaryawanAktif().length;

    } else if (Array.isArray(window.karyawan)) {

        totalKaryawan =
            window.karyawan.length;

    }


    const elTotalKaryawan =
        document.getElementById("totalKaryawan");

    if (elTotalKaryawan) {
        elTotalKaryawan.textContent =
            totalKaryawan;
    }


    /* =================================================
       TOTAL PLANNING
    ================================================= */

    const totalPlanning =
        dataPlanning.length;

    const elTotalPlanning =
        document.getElementById("totalPlanning");

    if (elTotalPlanning) {
        elTotalPlanning.textContent =
            totalPlanning;
    }


    /* =================================================
       TOTAL JAM
       DURASI × JUMLAH KARYAWAN
    ================================================= */

    let totalJam = 0;

    dataPlanning.forEach(item => {

        const durasiMenit =
            Number(item.durasiMenit || 0);

        const jumlahKaryawan =
            Array.isArray(item.karyawan)
                ? item.karyawan.length
                : Number(item.jumlahKaryawan || 0);

        totalJam +=
            (
                durasiMenit *
                jumlahKaryawan
            ) / 60;

    });


    const elTotalJam =
        document.getElementById("totalJam");

    if (elTotalJam) {

        elTotalJam.textContent =
            Number.isInteger(totalJam)
                ? `${totalJam} Jam`
                : `${totalJam.toFixed(1)} Jam`;

    }


    /* =================================================
       PLANNING HARI INI
    ================================================= */

    const now = new Date();

    const today =
        new Date(
            now.getTime() -
            now.getTimezoneOffset() * 60000
        )
        .toISOString()
        .split("T")[0];


    const planningHariIni =
        dataPlanning.filter(item => {

            return String(item.tanggal || "") === today;

        }).length;


    const elHariIni =
        document.getElementById("planningHariIni");

    if (elHariIni) {
        elHariIni.textContent =
            planningHariIni;
    }


    /* =================================================
       DURASI 4 / 8 / 12 JAM
    ================================================= */

    let count4 = 0;
    let count8 = 0;
    let count12 = 0;


    dataPlanning.forEach(item => {

        const jumlah =
            Array.isArray(item.karyawan)
                ? item.karyawan.length
                : Number(item.jumlahKaryawan || 0);

        const menit =
            Number(item.durasiMenit || 0);


        if (menit === 240) {

            count4 += jumlah;

        } else if (menit === 480) {

            count8 += jumlah;

        } else if (menit === 720) {

            count12 += jumlah;

        }

    });


    const el4 =
        document.getElementById("count4Jam");

    const el8 =
        document.getElementById("count8Jam");

    const el12 =
        document.getElementById("count12Jam");


    if (el4) {
        el4.textContent = count4;
    }

    if (el8) {
        el8.textContent = count8;
    }

    if (el12) {
        el12.textContent = count12;
    }

}


/* =====================================================
   UPDATE SEMUA CHART
===================================================== */

function updateDashboardCharts() {

    if (typeof Chart === "undefined") {

        console.warn(
            "Chart.js belum termuat."
        );

        return;
    }


    if (!Array.isArray(window.planning)) {
        return;
    }


    renderPlanningChart();
    renderDurasiChart();
    renderKaryawanChart();

}


/* =====================================================
   GRAFIK TREND MAND POWER
===================================================== */

function renderPlanningChart() {

    const canvas =
        document.getElementById("planningChart");

    if (!canvas) {
        return;
    }

    if (typeof Chart === "undefined") {
        return;
    }


    const dataTanggal = {};


    window.planning.forEach(item => {

        const tanggal =
            String(item.tanggal || "");

        if (!tanggal) {
            return;
        }


        const jumlah =
            Array.isArray(item.karyawan)
                ? item.karyawan.length
                : Number(item.jumlahKaryawan || 0);


        dataTanggal[tanggal] =
            (dataTanggal[tanggal] || 0) +
            jumlah;

    });


    const tanggalList =
        Object.keys(dataTanggal).sort();


    const labelTanggal =
        tanggalList.map(tanggal => {

            if (
                typeof formatTanggalPlanning ===
                "function"
            ) {

                return formatTanggalPlanning(tanggal);

            }

            return tanggal;

        });


    const dataJumlah =
        tanggalList.map(tanggal => {
            return dataTanggal[tanggal];
        });


    if (planningChartInstance) {

        planningChartInstance.destroy();
        planningChartInstance = null;

    }


    planningChartInstance =
        new Chart(canvas, {

            type: "line",

            data: {

                labels: labelTanggal,

                datasets: [

                    {

                        label: "Mand Power",

                        data: dataJumlah,

                        borderColor: "#d71920",

                        backgroundColor:
                            "rgba(215,25,32,0.10)",

                        borderWidth: 2.5,

                        tension: 0.35,

                        fill: true,

                        pointRadius: 4,

                        pointHoverRadius: 6

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                interaction: {

                    intersect: false,

                    mode: "index"

                },


                plugins: {

                    legend: {

                        display: true

                    },


                    tooltip: {

                        callbacks: {

                            label: function(context) {

                                return (
                                    " " +
                                    context.parsed.y +
                                    " Mand Power"
                                );

                            }

                        }

                    }

                },


                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            precision: 0

                        },

                        title: {

                            display: true,

                            text: "Jumlah Karyawan"

                        }

                    },


                    x: {

                        grid: {

                            display: false

                        },

                        title: {

                            display: true,

                            text: "Tanggal"

                        }

                    }

                }

            }

        });

}


/* =====================================================
   GRAFIK DISTRIBUSI DURASI
===================================================== */

function renderDurasiChart() {

    const canvas =
        document.getElementById("durasiChart");

    if (!canvas) {
        return;
    }

    if (typeof Chart === "undefined") {
        return;
    }


    let count4 = 0;
    let count8 = 0;
    let count12 = 0;


    window.planning.forEach(item => {

        const durasi =
            Number(item.durasiMenit || 0);

        const jumlah =
            Array.isArray(item.karyawan)
                ? item.karyawan.length
                : Number(item.jumlahKaryawan || 0);


        if (durasi === 240) {

            count4 += jumlah;

        } else if (durasi === 480) {

            count8 += jumlah;

        } else if (durasi === 720) {

            count12 += jumlah;

        }

    });


    if (durasiChartInstance) {

        durasiChartInstance.destroy();
        durasiChartInstance = null;

    }


    durasiChartInstance =
        new Chart(canvas, {

            type: "doughnut",


            data: {

                labels: [
                    "4 Jam",
                    "8 Jam",
                    "12 Jam"
                ],


                datasets: [

                    {

                        data: [
                            count4,
                            count8,
                            count12
                        ],

                        backgroundColor: [
                            "#d71920",
                            "#f59e0b",
                            "#374151"
                        ],

                        borderWidth: 0

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "68%",


                plugins: {

                    legend: {

                        position: "bottom"

                    },


                    tooltip: {

                        callbacks: {

                            label: function(context) {

                                const total =
                                    context.dataset.data.reduce(
                                        (a, b) =>
                                            a + b,
                                        0
                                    );

                                const value =
                                    context.parsed;

                                const percentage =
                                    total > 0
                                        ? (
                                            value /
                                            total *
                                            100
                                        ).toFixed(1)
                                        : 0;


                                return (
                                    " " +
                                    context.label +
                                    ": " +
                                    value +
                                    " (" +
                                    percentage +
                                    "%)"
                                );

                            }

                        }

                    }

                }

            }

        });

}


/* =====================================================
   TOP KARYAWAN LEMBUR
===================================================== */

function renderKaryawanChart() {

    const canvas =
        document.getElementById("karyawanChart");

    if (!canvas) {
        return;
    }

    if (typeof Chart === "undefined") {
        return;
    }


    const jumlahKaryawan = {};


    window.planning.forEach(item => {

        if (!Array.isArray(item.karyawan)) {
            return;
        }


        item.karyawan.forEach(dataKaryawan => {

            const id =
                String(
                    dataKaryawan.id ||
                    dataKaryawan.idKaryawan ||
                    dataKaryawan.nik ||
                    dataKaryawan.NIK ||
                    dataKaryawan.NIB ||
                    ""
                ).trim();


            const nama =
                String(
                    dataKaryawan.nama ||
                    dataKaryawan.namaKaryawan ||
                    dataKaryawan.Nama ||
                    id
                ).trim();


            if (!id) {
                return;
            }


            if (!jumlahKaryawan[id]) {

                jumlahKaryawan[id] = {

                    nama: nama,

                    jumlah: 0

                };

            }


            jumlahKaryawan[id].jumlah++;

        });

    });


    const ranking =
        Object.values(jumlahKaryawan)
            .sort(
                (a, b) =>
                    b.jumlah -
                    a.jumlah
            )
            .slice(0, 10);


    const labels =
        ranking.map(item => item.nama);


    const values =
        ranking.map(item => item.jumlah);


    if (karyawanChartInstance) {

        karyawanChartInstance.destroy();
        karyawanChartInstance = null;

    }


    karyawanChartInstance =
        new Chart(canvas, {

            type: "bar",


            data: {

                labels: labels,


                datasets: [

                    {

                        label: "Jumlah Planning",

                        data: values,

                        backgroundColor: "#d71920",

                        borderRadius: 6,

                        borderSkipped: false

                    }

                ]

            },


            options: {

                indexAxis: "y",

                responsive: true,

                maintainAspectRatio: false,


                plugins: {

                    legend: {

                        display: false

                    },


                    tooltip: {

                        callbacks: {

                            label: function(context) {

                                return (
                                    " " +
                                    context.parsed.x +
                                    " planning"
                                );

                            }

                        }

                    }

                },


                scales: {

                    x: {

                        beginAtZero: true,

                        ticks: {

                            precision: 0

                        },

                        title: {

                            display: true,

                            text: "Jumlah Planning"

                        }

                    },


                    y: {

                        grid: {

                            display: false

                        }

                    }

                }

            }

        });

}


/* =====================================================
   TANGGAL SEKARANG
===================================================== */

function tampilkanTanggal() {

    const element =
        document.getElementById(
            "tanggalSekarang"
        );

    if (!element) {
        return;
    }


    element.textContent =
        new Date().toLocaleDateString(
            "id-ID",
            {

                weekday: "long",

                day: "numeric",

                month: "long",

                year: "numeric"

            }
        );

}


/* =====================================================
   CLOSE SEMUA MODAL
===================================================== */

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

}


/* =====================================================
   PLANNING TERBARU DI DASHBOARD
===================================================== */

function renderDashboardPlanning() {

    const tbody =
        document.getElementById(
            "dashboardPlanning"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    const dataPlanning =
        Array.isArray(window.planning)
            ? window.planning
            : [];


    if (dataPlanning.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;"
                >
                    Belum ada planning
                </td>

            </tr>

        `;

        return;

    }


    const data =
        [...dataPlanning]
            .sort((a, b) => {

                const dateA =
                    new Date(
                        a.createdAt ||
                        a.tanggal ||
                        0
                    );

                const dateB =
                    new Date(
                        b.createdAt ||
                        b.tanggal ||
                        0
                    );

                return dateB - dateA;

            })
            .slice(0, 5);


    data.forEach(item => {

        const jumlah =
            Array.isArray(item.karyawan)
                ? item.karyawan.length
                : Number(item.jumlahKaryawan || 0);


        const tanggal =
            typeof formatTanggalPlanning ===
            "function"

                ? formatTanggalPlanning(
                    item.tanggal
                )

                : item.tanggal || "-";


        const durasi =
            item.durasi ||

            (
                typeof formatDurasiPlanning ===
                "function"

                    ? formatDurasiPlanning(
                        item.durasiMenit
                    )

                    : "-"
            );


        const idPlanning =
            item.idPlanning ||
            item.id ||
            "-";


        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td>
                ${escapePlanningHTML(tanggal)}
            </td>

            <td>
                ${escapePlanningHTML(idPlanning)}
            </td>

            <td>
                ${jumlah}
            </td>

            <td>
                ${escapePlanningHTML(
                    `${item.jamMulai || "-"} - ${item.jamSelesai || "-"}`
                )}
            </td>

            <td>
                ${escapePlanningHTML(durasi)}
            </td>

        `;


        tbody.appendChild(tr);

    });

}


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        /* ==============================================
           FORM KARYAWAN
        ============================================== */

        const formKaryawan =
            document.getElementById(
                "formKaryawan"
            );


        if (
            formKaryawan &&
            !formKaryawan.dataset.appListener
        ) {

            formKaryawan.addEventListener(
                "submit",
                function(event) {

                    event.preventDefault();


                    if (
                        typeof tambahKaryawan ===
                        "function"
                    ) {

                        tambahKaryawan();

                    }

                }
            );


            formKaryawan.dataset.appListener =
                "true";

        }


        /* ==============================================
           INITIAL DATA
        ============================================== */

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

        tampilkanTanggal();


        /* ==============================================
           BACKDROP PLANNING
        ============================================== */

        const planningModal =
            document.getElementById(
                "planningModal"
            );


        if (
            planningModal &&
            !planningModal.dataset.backdropListener
        ) {

            planningModal.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target ===
                        planningModal
                    ) {

                        if (
                            typeof closePlanningModal ===
                            "function"
                        ) {

                            closePlanningModal();

                        }

                    }

                }
            );


            planningModal.dataset.backdropListener =
                "true";

        }


        /* ==============================================
           BACKDROP PENALTI
        ============================================== */

        const penaltyModal =
            document.getElementById(
                "penaltyModal"
            );


        if (
            penaltyModal &&
            !penaltyModal.dataset.backdropListener
        ) {

            penaltyModal.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target ===
                        penaltyModal
                    ) {

                        if (
                            typeof closePenaltyModal ===
                            "function"
                        ) {

                            closePenaltyModal();

                        }

                    }

                }
            );


            penaltyModal.dataset.backdropListener =
                "true";

        }


        /* ==============================================
           ESC = CLOSE MODAL
        ============================================== */

        if (
            !document.body.dataset.escapeListener
        ) {

            document.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key ===
                        "Escape"
                    ) {

                        closeAllModals();

                    }

                }
            );


            document.body.dataset.escapeListener =
                "true";

        }

    }
);


/* =====================================================
   DATABASE READY
===================================================== */

document.addEventListener(
    "databaseReady",
    function() {

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
);