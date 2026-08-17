/* =====================================================
   LEMBUR / PLANNING
   Terhubung dengan database.js
   ===================================================== */


/* =====================================================
   DATA HELPER
===================================================== */

function getKaryawanAktif() {

    if (!Array.isArray(karyawan)) {
        return [];
    }

    return karyawan.filter(function (item) {

        const status = String(
            item.status || "Aktif"
        )
            .trim()
            .toLowerCase();

        return (
            status !== "penalti" &&
            status !== "nonaktif" &&
            status !== "resign"
        );

    });

}


/* =====================================================
   AMBIL ID KARYAWAN
===================================================== */

function getPlanningKaryawanId(item) {

    return String(
        item.id ??
        item.idKaryawan ??
        item.ID ??
        item.nik ??
        item.NIK ??
        item.NIB ??
        ""
    ).trim();

}


/* =====================================================
   AMBIL NAMA KARYAWAN
===================================================== */

function getPlanningKaryawanNama(item) {

    return String(
        item.nama ??
        item.namaKaryawan ??
        item.Nama ??
        ""
    ).trim();

}


/* =====================================================
   OPEN MODAL PLANNING
===================================================== */

function openPlanningModal() {

    const modal = document.getElementById(
        "planningModal"
    );

    if (!modal) {

        console.error(
            "planningModal tidak ditemukan."
        );

        return;
    }

    const form = document.getElementById(
        "formPlanning"
    );

    if (form) {
        form.reset();
    }


    const tanggal = document.getElementById(
        "tanggal"
    );

    const durasi = document.getElementById(
        "durasiPlanning"
    );

    const jamMulai = document.getElementById(
        "jamMulai"
    );

    const jamSelesai = document.getElementById(
        "jamSelesai"
    );


    /* DEFAULT TANGGAL */

    if (tanggal) {

        const now = new Date();

        const localDate = new Date(
            now.getTime() -
            now.getTimezoneOffset() * 60000
        )
            .toISOString()
            .split("T")[0];

        tanggal.value = localDate;

    }


    /* DEFAULT DURASI */

    if (durasi) {
        durasi.value = "4 Jam";
    }


    /* DEFAULT JAM */

    if (jamMulai) {
        jamMulai.value = "17:00";
    }

    if (jamSelesai) {
        jamSelesai.value = "21:00";
    }


    /* RENDER KARYAWAN */

    renderPlanningKaryawan();


    /* TAMPILKAN MODAL */

    modal.classList.add("active");
    modal.style.display = "flex";


    updateJumlahKaryawanPlanning();

}


/* =====================================================
   CLOSE MODAL PLANNING
===================================================== */

function closePlanningModal() {

    const modal = document.getElementById(
        "planningModal"
    );

    if (!modal) {
        return;
    }

    modal.classList.remove("active");
    modal.style.display = "none";


    const list = document.getElementById(
        "planningKaryawanList"
    );

    if (list) {

        list
            .querySelectorAll(
                "input[type='checkbox']"
            )
            .forEach(function (checkbox) {

                checkbox.checked = false;

            });

    }


    updateJumlahKaryawanPlanning();

}


/* =====================================================
   RENDER DAFTAR KARYAWAN
===================================================== */

function renderPlanningKaryawan() {

    const container = document.getElementById(
        "planningKaryawanList"
    );

    if (!container) {
        return;
    }

    container.innerHTML = "";


    const daftar = getKaryawanAktif();


    if (daftar.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                Tidak ada karyawan yang dapat dipilih.
            </div>
        `;

        updateJumlahKaryawanPlanning();

        return;
    }


    daftar.forEach(function (item, index) {

        const id = getPlanningKaryawanId(item);

        const nama = getPlanningKaryawanNama(item);


        if (!id && !nama) {
            return;
        }


        const safeId =
            `planning-karyawan-${index}`;


        const div =
            document.createElement("label");

        div.className =
            "planning-karyawan-item";

        div.setAttribute(
            "for",
            safeId
        );


        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.id = safeId;

        checkbox.className =
            "planning-karyawan-checkbox";

        checkbox.value = id;


        checkbox.dataset.id = id;

        checkbox.dataset.nama = nama;


        const info =
            document.createElement("div");

        info.className =
            "planning-karyawan-info";


        const strong =
            document.createElement("strong");

        strong.textContent =
            nama;


        const span =
            document.createElement("span");

        span.textContent =
            id;


        info.appendChild(strong);

        info.appendChild(span);


        div.appendChild(checkbox);

        div.appendChild(info);


        container.appendChild(div);


        checkbox.addEventListener(
            "change",
            updateJumlahKaryawanPlanning
        );

    });


    updateJumlahKaryawanPlanning();

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapePlanningHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   UPDATE JUMLAH KARYAWAN
===================================================== */

function updateJumlahKaryawanPlanning() {

    const container =
        document.getElementById(
            "planningKaryawanList"
        );

    const counter =
        document.getElementById(
            "jumlahKaryawanPlanning"
        );


    if (!container) {
        return;
    }


    const checked =
        container.querySelectorAll(
            ".planning-karyawan-checkbox:checked"
        );


    if (counter) {

        counter.textContent =
            `${checked.length} karyawan dipilih`;

    }

}


/* =====================================================
   PILIH SEMUA KARYAWAN
===================================================== */

function pilihSemuaKaryawanPlanning() {

    const container =
        document.getElementById(
            "planningKaryawanList"
        );

    if (!container) {
        return;
    }


    container
        .querySelectorAll(
            ".planning-karyawan-checkbox"
        )
        .forEach(function (checkbox) {

            checkbox.checked = true;

        });


    updateJumlahKaryawanPlanning();

}


/* =====================================================
   BATAL SEMUA KARYAWAN
===================================================== */

function batalSemuaKaryawanPlanning() {

    const container =
        document.getElementById(
            "planningKaryawanList"
        );

    if (!container) {
        return;
    }


    container
        .querySelectorAll(
            ".planning-karyawan-checkbox"
        )
        .forEach(function (checkbox) {

            checkbox.checked = false;

        });


    updateJumlahKaryawanPlanning();

}


/* =====================================================
   AMBIL KARYAWAN YANG DIPILIH
===================================================== */

function getSelectedPlanningKaryawan() {

    const container =
        document.getElementById(
            "planningKaryawanList"
        );

    if (!container) {
        return [];
    }


    const selected = [];


    container
        .querySelectorAll(
            ".planning-karyawan-checkbox:checked"
        )
        .forEach(function (checkbox) {

            selected.push({

                id:
                    checkbox.dataset.id ||
                    checkbox.value ||
                    "",

                nama:
                    checkbox.dataset.nama ||
                    ""

            });

        });


    return selected;

}


/* =====================================================
   HITUNG DURASI
===================================================== */

function hitungDurasiPlanning() {

    const jamMulai =
        document.getElementById(
            "jamMulai"
        );

    const jamSelesai =
        document.getElementById(
            "jamSelesai"
        );

    const durasi =
        document.getElementById(
            "durasiPlanning"
        );


    if (
        !jamMulai ||
        !jamSelesai ||
        !durasi
    ) {
        return;
    }


    if (
        !jamMulai.value ||
        !jamSelesai.value
    ) {

        durasi.value =
            "0 Jam";

        return;
    }


    const mulaiParts =
        jamMulai.value
            .split(":")
            .map(Number);


    const selesaiParts =
        jamSelesai.value
            .split(":")
            .map(Number);


    let mulai =
        mulaiParts[0] * 60 +
        mulaiParts[1];


    let selesai =
        selesaiParts[0] * 60 +
        selesaiParts[1];


    if (selesai <= mulai) {
        selesai += 24 * 60;
    }


    const totalMenit =
        selesai - mulai;


    const totalJam =
        totalMenit / 60;


    durasi.value =
        `${Number.isInteger(totalJam)
            ? totalJam
            : totalJam.toFixed(1)
        } Jam`;

}


/* =====================================================
   GET DURASI MENIT
===================================================== */

function getDurasiMenitPlanning() {

    const jamMulai =
        document.getElementById(
            "jamMulai"
        );

    const jamSelesai =
        document.getElementById(
            "jamSelesai"
        );


    if (
        !jamMulai ||
        !jamSelesai ||
        !jamMulai.value ||
        !jamSelesai.value
    ) {
        return 0;
    }


    const mulaiParts =
        jamMulai.value
            .split(":")
            .map(Number);


    const selesaiParts =
        jamSelesai.value
            .split(":")
            .map(Number);


    let mulai =
        mulaiParts[0] * 60 +
        mulaiParts[1];


    let selesai =
        selesaiParts[0] * 60 +
        selesaiParts[1];


    if (selesai <= mulai) {
        selesai += 24 * 60;
    }


    return selesai - mulai;

}


/* =====================================================
   GENERATE ID PLANNING
===================================================== */

function generatePlanningId() {

    const prefix = "PLN";

    const now = new Date();


    const tahun =
        now.getFullYear();


    const bulan =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const tanggal =
        String(
            now.getDate()
        ).padStart(2, "0");


    const waktu =
        String(
            Date.now()
        ).slice(-6);


    return `${prefix}-${tahun}${bulan}${tanggal}-${waktu}`;

}


/* =====================================================
   BUAT PLANNING
===================================================== */

async function buatPlanning() {

    const tanggal =
        document.getElementById(
            "tanggal"
        );

    const jamMulai =
        document.getElementById(
            "jamMulai"
        );

    const jamSelesai =
        document.getElementById(
            "jamSelesai"
        );

    const keterangan =
        document.getElementById(
            "keterangan"
        );


    if (
        !tanggal ||
        !jamMulai ||
        !jamSelesai
    ) {

        alert(
            "Form planning tidak ditemukan."
        );

        return;
    }


    if (!tanggal.value) {

        alert(
            "Tanggal wajib diisi."
        );

        tanggal.focus();

        return;
    }


    if (!jamMulai.value) {

        alert(
            "Jam mulai wajib diisi."
        );

        jamMulai.focus();

        return;
    }


    if (!jamSelesai.value) {

        alert(
            "Jam selesai wajib diisi."
        );

        jamSelesai.focus();

        return;
    }


    const selected =
        getSelectedPlanningKaryawan();


    if (selected.length === 0) {

        alert(
            "Pilih minimal satu karyawan."
        );

        return;
    }


    const durasiMenit =
        getDurasiMenitPlanning();


    if (durasiMenit <= 0) {

        alert(
            "Durasi lembur tidak valid."
        );

        return;
    }


    const idPlanning =
        generatePlanningId();


    if (!Array.isArray(planning)) {
        planning = [];
    }


    const dataPlanning = {

        id: idPlanning,

        idPlanning: idPlanning,

        tanggal:
            tanggal.value,

        jamMulai:
            jamMulai.value,

        jamSelesai:
            jamSelesai.value,

        durasi:
            `${durasiMenit / 60} Jam`,

        durasiMenit:
            durasiMenit,

        keterangan:
            keterangan
                ? keterangan.value.trim()
                : "",

        karyawan:
            selected,

        createdAt:
            new Date().toISOString()

    };


    planning.push(
        dataPlanning
    );


    let berhasil = true;


    if (
        typeof simpanData ===
        "function"
    ) {

        try {

            const result =
                await simpanData();

            if (result === false) {
                berhasil = false;
            }

        } catch (error) {

            console.error(
                "Gagal menyimpan planning:",
                error
            );

            berhasil = false;

        }

    } else {

        console.warn(
            "Fungsi simpanData() tidak ditemukan."
        );

    }


    if (!berhasil) {

        planning.pop();

        alert(
            "Planning gagal disimpan ke database."
        );

        return;
    }


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


    if (
        typeof updateDashboard ===
        "function"
    ) {

        updateDashboard();

    }


    closePlanningModal();


    alert(
        `Planning berhasil dibuat.\n${selected.length} karyawan dipilih.`
    );

}


/* =====================================================
   RENDER PLANNING
===================================================== */

function renderPlanning() {

    const tbody =
        document.getElementById(
            "planningTable"
        );

    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (!Array.isArray(planning)) {
        return;
    }


    let data = [...planning];


    /* FILTER TANGGAL */

    const filterTanggal =
        document.getElementById(
            "filterTanggal"
        );


    if (
        filterTanggal &&
        filterTanggal.value
    ) {

        data = data.filter(
            function (item) {

                return item.tanggal ===
                    filterTanggal.value;

            }
        );

    }


    /* FILTER KARYAWAN */

    const filterKaryawan =
        document.getElementById(
            "filterKaryawan"
        );


    if (
        filterKaryawan &&
        filterKaryawan.value
    ) {

        const value =
            filterKaryawan.value;


        data = data.filter(
            function (item) {

                if (
                    !Array.isArray(
                        item.karyawan
                    )
                ) {
                    return false;
                }


                return item.karyawan.some(
                    function (k) {

                        return String(
                            k.id || ""
                        ) ===
                        String(value);

                    }
                );

            }
        );

    }


    /* TERBARU */

    data.reverse();


    /* RENDER */

    data.forEach(
        function (item, index) {

            const tr =
                document.createElement(
                    "tr"
                );


            const daftarKaryawan =
                Array.isArray(
                    item.karyawan
                )
                    ? item.karyawan
                    : [];


            const namaKaryawan =
                daftarKaryawan
                    .map(
                        function (k) {

                            return k.nama || "";

                        }
                    )
                    .filter(Boolean)
                    .join(", ");


            const idPlanning =
                item.idPlanning ||
                item.id ||
                "-";


            const durasi =
                item.durasi ||
                formatDurasiPlanning(
                    item.durasiMenit
                );


            const tanggal =
                formatTanggalPlanning(
                    item.tanggal
                );


            const jam =
                `${item.jamMulai || "-"} - ${item.jamSelesai || "-"}`;


            const tdNo =
                document.createElement(
                    "td"
                );

            tdNo.textContent =
                index + 1;


            const tdId =
                document.createElement(
                    "td"
                );

            tdId.textContent =
                idPlanning;


            const tdTanggal =
                document.createElement(
                    "td"
                );

            tdTanggal.textContent =
                tanggal;


            const tdKaryawan =
                document.createElement(
                    "td"
                );

            tdKaryawan.textContent =
                namaKaryawan || "-";


            const tdJam =
                document.createElement(
                    "td"
                );

            tdJam.textContent =
                jam;


            const tdDurasi =
                document.createElement(
                    "td"
                );

            tdDurasi.textContent =
                durasi;


            const tdKeterangan =
                document.createElement(
                    "td"
                );

            tdKeterangan.textContent =
                item.keterangan || "-";


            const tdAction =
                document.createElement(
                    "td"
                );

            tdAction.className =
                "planning-action";


            /* PREVIEW */

            const btnPreview =
                document.createElement(
                    "button"
                );

            btnPreview.type =
                "button";

            btnPreview.className =
                "btn-preview-planning";

            btnPreview.textContent =
                "Preview";

            btnPreview.title =
                "Preview Planning";

            btnPreview.onclick =
                function () {

                    previewPlanning(
                        idPlanning
                    );

                };


            /* CETAK */

            const btnCetak =
                document.createElement(
                    "button"
                );

            btnCetak.type =
                "button";

            btnCetak.className =
                "btn-cetak-spl";

            btnCetak.textContent =
                "Cetak";

            btnCetak.title =
                "Cetak SPL";

            btnCetak.onclick =
                function () {

                    cetakPlanningPDF(
                        idPlanning
                    );

                };


            /* HAPUS */

            const btnHapus =
                document.createElement(
                    "button"
                );

            btnHapus.type =
                "button";

            btnHapus.className =
                "btn-secondary";

            btnHapus.textContent =
                "Hapus";

            btnHapus.title =
                "Hapus Planning";

            btnHapus.onclick =
                function () {

                    hapusPlanning(
                        idPlanning
                    );

                };


            tdAction.appendChild(
                btnPreview
            );

            tdAction.appendChild(
                btnCetak
            );

            tdAction.appendChild(
                btnHapus
            );


            tr.appendChild(tdNo);

            tr.appendChild(tdId);

            tr.appendChild(tdTanggal);

            tr.appendChild(tdKaryawan);

            tr.appendChild(tdJam);

            tr.appendChild(tdDurasi);

            tr.appendChild(tdKeterangan);

            tr.appendChild(tdAction);


            tbody.appendChild(tr);

        }
    );


    const jumlah =
        document.getElementById(
            "jumlahPlanningText"
        );


    if (jumlah) {

        jumlah.textContent =
            `${data.length} planning`;

    }

}


/* =====================================================
   FORMAT TANGGAL
===================================================== */

function formatTanggalPlanning(tanggal) {

    if (!tanggal) {
        return "-";
    }


    const parts =
        String(tanggal)
            .split("-");


    if (parts.length !== 3) {
        return tanggal;
    }


    return `${parts[2]}-${parts[1]}-${parts[0]}`;

}


/* =====================================================
   FORMAT DURASI
===================================================== */

function formatDurasiPlanning(menit) {

    const value =
        Number(menit || 0);


    if (value <= 0) {
        return "-";
    }


    const jam =
        value / 60;


    return `${Number.isInteger(jam)
        ? jam
        : jam.toFixed(1)
    } Jam`;

}


/* =====================================================
   =====================================================
   PREVIEW PLANNING
   =====================================================
===================================================== */

function previewPlanning(idPlanning) {

    if (!Array.isArray(planning)) {

        alert(
            "Data planning tidak tersedia."
        );

        return;
    }


    const item =
        planning.find(
            function (data) {

                return String(
                    data.idPlanning ||
                    data.id ||
                    ""
                ) ===
                String(idPlanning);

            }
        );


    if (!item) {

        alert(
            "Data planning tidak ditemukan."
        );

        return;
    }


    buatModalPreviewPlanning();


    const modal =
        document.getElementById(
            "planningPreviewModal"
        );


    if (!modal) {
        return;
    }


    const id =
        item.idPlanning ||
        item.id ||
        "-";


    const daftarKaryawan =
        Array.isArray(item.karyawan)
            ? item.karyawan
            : [];


    modal.dataset.idPlanning =
        id;


    const tanggal =
        item.tanggal || "";


    const jamMulai =
        item.jamMulai || "";


    const jamSelesai =
        item.jamSelesai || "";


    const durasi =
        item.durasi ||
        formatDurasiPlanning(
            item.durasiMenit
        );


    const keterangan =
        item.keterangan || "";


    const content =
        document.getElementById(
            "planningPreviewContent"
        );


    if (!content) {
        return;
    }


    content.innerHTML = `

        <div class="planning-preview-header">

            <div>

                <div class="planning-preview-label">
                    ID PLANNING
                </div>

                <div class="planning-preview-id">
                    ${escapePlanningHTML(id)}
                </div>

            </div>

            <button
                type="button"
                class="planning-preview-close"
                onclick="closePreviewPlanning()"
            >
                ×
            </button>

        </div>


        <div class="planning-preview-form">

            <div class="planning-preview-field">

                <label>
                    Tanggal
                </label>

                <input
                    type="date"
                    id="previewTanggal"
                    value="${escapePlanningHTML(tanggal)}"
                >

            </div>


            <div class="planning-preview-field">

                <label>
                    Jam Mulai
                </label>

                <input
                    type="time"
                    id="previewJamMulai"
                    value="${escapePlanningHTML(jamMulai)}"
                >

            </div>


            <div class="planning-preview-field">

                <label>
                    Jam Selesai
                </label>

                <input
                    type="time"
                    id="previewJamSelesai"
                    value="${escapePlanningHTML(jamSelesai)}"
                >

            </div>


            <div class="planning-preview-field">

                <label>
                    Durasi
                </label>

                <input
                    type="text"
                    id="previewDurasi"
                    value="${escapePlanningHTML(durasi)}"
                    readonly
                >

            </div>


            <div class="planning-preview-field planning-preview-full">

                <label>
                    Keterangan
                </label>

                <textarea
                    id="previewKeterangan"
                    rows="3"
                >${escapePlanningHTML(keterangan)}</textarea>

            </div>

        </div>


        <div class="planning-preview-section">

            <div class="planning-preview-section-header">

                <div>

                    <h3>
                        Karyawan Lembur
                    </h3>

                    <span id="previewJumlahKaryawan">
                        ${daftarKaryawan.length} karyawan
                    </span>

                </div>

                <button
                    type="button"
                    class="planning-btn-add"
                    onclick="tambahKaryawanPreview()"
                >
                    + Tambah Karyawan
                </button>

            </div>


            <div
                id="previewKaryawanList"
                class="planning-preview-karyawan-list"
            ></div>

        </div>


        <div class="planning-preview-actions">

            <button
                type="button"
                class="planning-btn-cancel"
                onclick="closePreviewPlanning()"
            >
                Batal
            </button>

            <button
                type="button"
                class="planning-btn-save"
                onclick="simpanEditPlanning()"
            >
                Simpan Perubahan
            </button>

        </div>

    `;


    renderPreviewKaryawan(
        daftarKaryawan
    );


    hitungDurasiPreview();


    modal.classList.add("active");

    modal.style.display =
        "flex";

}


/* =====================================================
   BUAT MODAL PREVIEW OTOMATIS
===================================================== */

function buatModalPreviewPlanning() {

    let modal =
        document.getElementById(
            "planningPreviewModal"
        );


    if (modal) {
        return;
    }


    modal =
        document.createElement(
            "div"
        );


    modal.id =
        "planningPreviewModal";


    modal.className =
        "planning-preview-modal";


    modal.innerHTML = `

        <div
            class="planning-preview-overlay"
            onclick="closePreviewPlanning()"
        ></div>

        <div class="planning-preview-box">

            <div
                id="planningPreviewContent"
            ></div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    if (
        !document.getElementById(
            "planningPreviewStyle"
        )
    ) {

        const style =
            document.createElement(
                "style"
            );


        style.id =
            "planningPreviewStyle";


        style.textContent = `

            .planning-preview-modal {

                position: fixed;

                inset: 0;

                z-index: 99999;

                display: none;

                align-items: center;

                justify-content: center;

            }


            .planning-preview-modal.active {

                display: flex;

            }


            .planning-preview-overlay {

                position: absolute;

                inset: 0;

                background: rgba(0, 0, 0, .55);

                backdrop-filter: blur(3px);

            }


            .planning-preview-box {

                position: relative;

                width: min(900px, 94vw);

                max-height: 92vh;

                overflow-y: auto;

                background: #ffffff;

                border-radius: 16px;

                box-shadow:
                    0 20px 60px rgba(0,0,0,.25);

                z-index: 2;

            }


            .planning-preview-header {

                display: flex;

                align-items: center;

                justify-content: space-between;

                padding: 22px 26px;

                background: #d71920;

                color: #ffffff;

                border-radius: 16px 16px 0 0;

            }


            .planning-preview-label {

                font-size: 11px;

                opacity: .8;

                font-weight: 600;

                letter-spacing: .5px;

            }


            .planning-preview-id {

                margin-top: 4px;

                font-size: 19px;

                font-weight: 700;

            }


            .planning-preview-close {

                border: 0;

                background: transparent;

                color: #ffffff;

                font-size: 30px;

                line-height: 1;

                cursor: pointer;

                width: 38px;

                height: 38px;

                border-radius: 8px;

            }


            .planning-preview-close:hover {

                background: rgba(255,255,255,.15);

            }


            .planning-preview-form {

                display: grid;

                grid-template-columns:
                    repeat(3, 1fr);

                gap: 16px;

                padding: 24px 26px 10px;

            }


            .planning-preview-field {

                display: flex;

                flex-direction: column;

                gap: 7px;

            }


            .planning-preview-full {

                grid-column: 1 / -1;

            }


            .planning-preview-field label {

                font-size: 12px;

                font-weight: 700;

                color: #444;

            }


            .planning-preview-field input,

            .planning-preview-field textarea {

                width: 100%;

                border: 1px solid #ddd;

                border-radius: 8px;

                padding: 10px 12px;

                font-size: 14px;

                font-family: inherit;

                outline: none;

            }


            .planning-preview-field input:focus,

            .planning-preview-field textarea:focus {

                border-color: #d71920;

                box-shadow:
                    0 0 0 3px rgba(215,25,32,.08);

            }


            .planning-preview-field input[readonly] {

                background: #f5f5f5;

                color: #666;

            }


            .planning-preview-section {

                padding: 18px 26px 8px;

            }


            .planning-preview-section-header {

                display: flex;

                align-items: center;

                justify-content: space-between;

                gap: 15px;

                margin-bottom: 12px;

            }


            .planning-preview-section-header h3 {

                margin: 0;

                font-size: 16px;

                color: #222;

            }


            .planning-preview-section-header span {

                display: block;

                margin-top: 3px;

                font-size: 12px;

                color: #777;

            }


            .planning-btn-add {

                border: 0;

                background: #151515;

                color: #ffffff;

                padding: 9px 13px;

                border-radius: 8px;

                cursor: pointer;

                font-weight: 600;

            }


            .planning-btn-add:hover {

                background: #333;

            }


            .planning-preview-karyawan-list {

                display: flex;

                flex-direction: column;

                gap: 9px;

                max-height: 300px;

                overflow-y: auto;

                padding-right: 3px;

            }


            .planning-preview-karyawan-row {

                display: grid;

                grid-template-columns:
                    38px 1fr 180px 42px;

                align-items: center;

                gap: 10px;

                padding: 10px;

                border: 1px solid #e4e4e4;

                border-radius: 10px;

                background: #fafafa;

            }


            .planning-preview-number {

                width: 30px;

                height: 30px;

                display: flex;

                align-items: center;

                justify-content: center;

                background: #f0f0f0;

                border-radius: 7px;

                font-size: 12px;

                font-weight: 700;

                color: #555;

            }


            .planning-preview-karyawan-row input {

                width: 100%;

                border: 1px solid #ddd;

                border-radius: 7px;

                padding: 9px 10px;

                font-size: 13px;

                outline: none;

            }


            .planning-preview-karyawan-row input:focus {

                border-color: #d71920;

            }


            .planning-btn-delete {

                border: 0;

                background: #fff1f2;

                color: #d71920;

                width: 34px;

                height: 34px;

                border-radius: 7px;

                cursor: pointer;

                font-size: 17px;

                font-weight: 700;

            }


            .planning-btn-delete:hover {

                background: #d71920;

                color: #ffffff;

            }


            .planning-preview-actions {

                display: flex;

                justify-content: flex-end;

                gap: 10px;

                padding: 22px 26px;

                margin-top: 10px;

                border-top: 1px solid #eee;

            }


            .planning-btn-cancel,

            .planning-btn-save {

                border: 0;

                padding: 11px 18px;

                border-radius: 8px;

                cursor: pointer;

                font-weight: 700;

            }


            .planning-btn-cancel {

                background: #eeeeee;

                color: #333;

            }


            .planning-btn-save {

                background: #d71920;

                color: #ffffff;

            }


            .planning-btn-save:hover {

                background: #b51218;

            }


            @media (max-width: 700px) {

                .planning-preview-form {

                    grid-template-columns: 1fr;

                }


                .planning-preview-full {

                    grid-column: auto;

                }


                .planning-preview-karyawan-row {

                    grid-template-columns:
                        32px 1fr 38px;

                }


                .planning-preview-karyawan-row
                .preview-id-input {

                    grid-column: 2 / -1;

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }

}


/* =====================================================
   RENDER KARYAWAN DI PREVIEW
===================================================== */

function renderPreviewKaryawan(
    daftar
) {

    const container =
        document.getElementById(
            "previewKaryawanList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !Array.isArray(daftar) ||
        daftar.length === 0
    ) {

        container.innerHTML = `

            <div
                class="empty-state"
                style="
                    padding:20px;
                    text-align:center;
                    color:#777;
                "
            >
                Belum ada karyawan.
            </div>

        `;

        updatePreviewJumlahKaryawan();

        return;
    }


    daftar.forEach(
        function (item, index) {

            const id =
                item.id ||
                item.nik ||
                item.NIK ||
                item.NIB ||
                "";


            const nama =
                item.nama ||
                "";


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "planning-preview-karyawan-row";


            row.dataset.index =
                index;


            row.innerHTML = `

                <div
                    class="planning-preview-number"
                >
                    ${index + 1}
                </div>


                <input
                    type="text"
                    class="preview-nama-input"
                    value="${escapePlanningHTML(nama)}"
                    placeholder="Nama karyawan"
                >


                <input
                    type="text"
                    class="preview-id-input"
                    value="${escapePlanningHTML(id)}"
                    placeholder="NIK / NIB"
                >


                <button
                    type="button"
                    class="planning-btn-delete"
                    title="Hapus karyawan"
                    onclick="hapusKaryawanPreview(this)"
                >
                    ×
                </button>

            `;


            container.appendChild(
                row
            );

        }
    );


    updatePreviewJumlahKaryawan();

}


/* =====================================================
   UPDATE JUMLAH KARYAWAN PREVIEW
===================================================== */

function updatePreviewJumlahKaryawan() {

    const container =
        document.getElementById(
            "previewKaryawanList"
        );

    const counter =
        document.getElementById(
            "previewJumlahKaryawan"
        );


    if (!container) {
        return;
    }


    const rows =
        container.querySelectorAll(
            ".planning-preview-karyawan-row"
        );


    if (counter) {

        counter.textContent =
            `${rows.length} karyawan`;

    }

}


/* =====================================================
   TAMBAH KARYAWAN DI PREVIEW
===================================================== */

function tambahKaryawanPreview() {

    const container =
        document.getElementById(
            "previewKaryawanList"
        );


    if (!container) {
        return;
    }


    const aktif =
        getKaryawanAktif();


    if (aktif.length === 0) {

        alert(
            "Data karyawan aktif tidak tersedia."
        );

        return;
    }


    const dataSaatIni = [];


    container
        .querySelectorAll(
            ".planning-preview-karyawan-row"
        )
        .forEach(
            function (row) {

                const namaInput =
                    row.querySelector(
                        ".preview-nama-input"
                    );

                const idInput =
                    row.querySelector(
                        ".preview-id-input"
                    );


                dataSaatIni.push({

                    id:
                        idInput
                            ? idInput.value.trim()
                            : "",

                    nama:
                        namaInput
                            ? namaInput.value.trim()
                            : ""

                });

            }
        );


    const idYangSudahAda =
        dataSaatIni.map(
            function (item) {
                return String(
                    item.id
                );
            }
        );


    const tersedia =
        aktif.filter(
            function (item) {

                const id =
                    getPlanningKaryawanId(
                        item
                    );


                return !idYangSudahAda.includes(
                    String(id)
                );

            }
        );


    if (tersedia.length === 0) {

        alert(
            "Semua karyawan aktif sudah ada di planning ini."
        );

        return;
    }


    const karyawanBaru =
        tersedia[0];


    dataSaatIni.push({

        id:
            getPlanningKaryawanId(
                karyawanBaru
            ),

        nama:
            getPlanningKaryawanNama(
                karyawanBaru
            )

    });


    renderPreviewKaryawan(
        dataSaatIni
    );

}


/* =====================================================
   HAPUS KARYAWAN PREVIEW
===================================================== */

function hapusKaryawanPreview(
    button
) {

    if (!button) {
        return;
    }


    const row =
        button.closest(
            ".planning-preview-karyawan-row"
        );


    if (!row) {
        return;
    }


    const container =
        document.getElementById(
            "previewKaryawanList"
        );


    if (!container) {
        return;
    }


    const rows =
        Array.from(
            container.querySelectorAll(
                ".planning-preview-karyawan-row"
            )
        );


    if (rows.length <= 1) {

        alert(
            "Minimal harus ada satu karyawan."
        );

        return;
    }


    row.remove();


    updatePreviewNomor();

    updatePreviewJumlahKaryawan();

}


/* =====================================================
   UPDATE NOMOR KARYAWAN PREVIEW
===================================================== */

function updatePreviewNomor() {

    const container =
        document.getElementById(
            "previewKaryawanList"
        );


    if (!container) {
        return;
    }


    container
        .querySelectorAll(
            ".planning-preview-karyawan-row"
        )
        .forEach(
            function (row, index) {

                const nomor =
                    row.querySelector(
                        ".planning-preview-number"
                    );


                if (nomor) {

                    nomor.textContent =
                        index + 1;

                }

            }
        );

}


/* =====================================================
   HITUNG DURASI PREVIEW
===================================================== */

function hitungDurasiPreview() {

    const mulai =
        document.getElementById(
            "previewJamMulai"
        );

    const selesai =
        document.getElementById(
            "previewJamSelesai"
        );

    const durasi =
        document.getElementById(
            "previewDurasi"
        );


    if (
        !mulai ||
        !selesai ||
        !durasi
    ) {
        return;
    }


    if (
        !mulai.value ||
        !selesai.value
    ) {

        durasi.value =
            "0 Jam";

        return;
    }


    const mulaiParts =
        mulai.value
            .split(":")
            .map(Number);


    const selesaiParts =
        selesai.value
            .split(":")
            .map(Number);


    let mulaiMenit =
        mulaiParts[0] * 60 +
        mulaiParts[1];


    let selesaiMenit =
        selesaiParts[0] * 60 +
        selesaiParts[1];


    if (
        selesaiMenit <=
        mulaiMenit
    ) {

        selesaiMenit +=
            24 * 60;

    }


    const total =
        selesaiMenit -
        mulaiMenit;


    const jam =
        total / 60;


    durasi.value =
        `${Number.isInteger(jam)
            ? jam
            : jam.toFixed(1)
        } Jam`;

}


/* =====================================================
   TUTUP PREVIEW
===================================================== */

function closePreviewPlanning() {

    const modal =
        document.getElementById(
            "planningPreviewModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );


    modal.style.display =
        "none";

}


/* =====================================================
   SIMPAN EDIT PLANNING
===================================================== */

async function simpanEditPlanning() {

    const modal =
        document.getElementById(
            "planningPreviewModal"
        );


    if (!modal) {
        return;
    }


    const idPlanning =
        modal.dataset.idPlanning;


    if (!idPlanning) {

        alert(
            "ID planning tidak ditemukan."
        );

        return;
    }


    if (!Array.isArray(planning)) {

        alert(
            "Data planning tidak tersedia."
        );

        return;
    }


    const index =
        planning.findIndex(
            function (item) {

                return String(
                    item.idPlanning ||
                    item.id ||
                    ""
                ) ===
                String(idPlanning);

            }
        );


    if (index === -1) {

        alert(
            "Planning tidak ditemukan."
        );

        return;
    }


    const tanggal =
        document.getElementById(
            "previewTanggal"
        );


    const jamMulai =
        document.getElementById(
            "previewJamMulai"
        );


    const jamSelesai =
        document.getElementById(
            "previewJamSelesai"
        );


    const keterangan =
        document.getElementById(
            "previewKeterangan"
        );


    if (
        !tanggal ||
        !jamMulai ||
        !jamSelesai
    ) {

        alert(
            "Form edit tidak lengkap."
        );

        return;
    }


    if (!tanggal.value) {

        alert(
            "Tanggal wajib diisi."
        );

        tanggal.focus();

        return;
    }


    if (!jamMulai.value) {

        alert(
            "Jam mulai wajib diisi."
        );

        jamMulai.focus();

        return;
    }


    if (!jamSelesai.value) {

        alert(
            "Jam selesai wajib diisi."
        );

        jamSelesai.focus();

        return;
    }


    const rows =
        document.querySelectorAll(
            "#previewKaryawanList .planning-preview-karyawan-row"
        );


    if (rows.length === 0) {

        alert(
            "Minimal harus ada satu karyawan."
        );

        return;
    }


    const daftarKaryawan = [];


    let valid =
        true;


    rows.forEach(
        function (row) {

            const namaInput =
                row.querySelector(
                    ".preview-nama-input"
                );


            const idInput =
                row.querySelector(
                    ".preview-id-input"
                );


            const nama =
                namaInput
                    ? namaInput.value.trim()
                    : "";


            const id =
                idInput
                    ? idInput.value.trim()
                    : "";


            if (!nama) {
                valid = false;
            }


            daftarKaryawan.push({

                id: id,

                nama: nama

            });

        }
    );


    if (!valid) {

        alert(
            "Nama karyawan tidak boleh kosong."
        );

        return;
    }


    const durasiMenit =
        hitungDurasiDariJam(
            jamMulai.value,
            jamSelesai.value
        );


    if (durasiMenit <= 0) {

        alert(
            "Durasi lembur tidak valid."
        );

        return;
    }


    const dataLama =
        JSON.parse(
            JSON.stringify(
                planning[index]
            )
        );


    planning[index] = {

        ...planning[index],

        tanggal:
            tanggal.value,

        jamMulai:
            jamMulai.value,

        jamSelesai:
            jamSelesai.value,

        durasi:
            `${durasiMenit / 60} Jam`,

        durasiMenit:
            durasiMenit,

        keterangan:
            keterangan
                ? keterangan.value.trim()
                : "",

        karyawan:
            daftarKaryawan

    };


    let berhasil = true;


    if (
        typeof simpanData ===
        "function"
    ) {

        try {

            const result =
                await simpanData();


            if (result === false) {

                berhasil =
                    false;

            }

        } catch (error) {

            console.error(
                "Gagal menyimpan perubahan planning:",
                error
            );

            berhasil =
                false;

        }

    }


    if (!berhasil) {

        planning[index] =
            dataLama;


        alert(
            "Perubahan gagal disimpan ke database."
        );

        return;
    }


    renderPlanning();


    if (
        typeof updateDashboard ===
        "function"
    ) {

        updateDashboard();

    }


    if (
        typeof updateKaryawanDropdown ===
        "function"
    ) {

        updateKaryawanDropdown();

    }


    closePreviewPlanning();


    alert(
        "Planning berhasil diperbarui."
    );

}


/* =====================================================
   HITUNG DURASI DARI JAM
===================================================== */

function hitungDurasiDariJam(
    jamMulai,
    jamSelesai
) {

    if (
        !jamMulai ||
        !jamSelesai
    ) {
        return 0;
    }


    const mulaiParts =
        jamMulai
            .split(":")
            .map(Number);


    const selesaiParts =
        jamSelesai
            .split(":")
            .map(Number);


    let mulai =
        mulaiParts[0] * 60 +
        mulaiParts[1];


    let selesai =
        selesaiParts[0] * 60 +
        selesaiParts[1];


    if (selesai <= mulai) {

        selesai +=
            24 * 60;

    }


    return selesai - mulai;

}


/* =====================================================
   HAPUS PLANNING
===================================================== */

async function hapusPlanning(
    idPlanning
) {

    if (!Array.isArray(planning)) {
        return;
    }


    const yakin =
        confirm(
            "Yakin ingin menghapus planning ini?"
        );


    if (!yakin) {
        return;
    }


    const index =
        planning.findIndex(
            function (item) {

                return String(
                    item.idPlanning ||
                    item.id ||
                    ""
                ) ===
                String(idPlanning);

            }
        );


    if (index === -1) {

        alert(
            "Data planning tidak ditemukan."
        );

        return;
    }


    const dataLama =
        planning[index];


    planning.splice(
        index,
        1
    );


    let berhasil = true;


    if (
        typeof simpanData ===
        "function"
    ) {

        try {

            const result =
                await simpanData();


            if (result === false) {
                berhasil = false;
            }

        } catch (error) {

            console.error(
                "Gagal menghapus planning:",
                error
            );

            berhasil = false;

        }

    }


    if (!berhasil) {

        planning.splice(
            index,
            0,
            dataLama
        );


        alert(
            "Planning gagal dihapus dari database."
        );

        return;
    }


    renderPlanning();


    if (
        typeof updateDashboard ===
        "function"
    ) {

        updateDashboard();

    }

}


/* =====================================================
   RESET FILTER
===================================================== */

function resetFilter() {

    const tanggal =
        document.getElementById(
            "filterTanggal"
        );


    const karyawanFilter =
        document.getElementById(
            "filterKaryawan"
        );


    if (tanggal) {
        tanggal.value = "";
    }


    if (karyawanFilter) {
        karyawanFilter.value = "";
    }


    renderPlanning();

}


/* =====================================================
   CETAK SPL / PDF
===================================================== */

function cetakPlanningPDF(
    idPlanning
) {

    if (!Array.isArray(planning)) {

        alert(
            "Data planning tidak tersedia."
        );

        return;
    }


    const item =
        planning.find(
            function (data) {

                return String(
                    data.idPlanning ||
                    data.id ||
                    ""
                ) ===
                String(idPlanning);

            }
        );


    if (!item) {

        alert(
            "Data planning tidak ditemukan."
        );

        return;
    }


    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        alert(
            "jsPDF belum termuat."
        );

        return;
    }


    const { jsPDF } =
        window.jspdf;


    const doc =
        new jsPDF({

            orientation:
                "portrait",

            unit:
                "mm",

            format:
                "a4"

        });


    const id =
        item.idPlanning ||
        item.id ||
        "-";


    const tanggal =
        item.tanggal ||
        "-";


    const tanggalTampil =
        formatTanggalPlanning(
            tanggal
        );


    const jamMulai =
        item.jamMulai ||
        "-";


    const jamSelesai =
        item.jamSelesai ||
        "-";


    const durasi =
        item.durasi ||
        formatDurasiPlanning(
            item.durasiMenit
        );


    const keterangan =
        item.keterangan ||
        "-";


    const daftarKaryawan =
        Array.isArray(
            item.karyawan
        )
            ? item.karyawan
            : [];


    const MERAH = [
        215,
        25,
        32
    ];


    const HITAM = [
        25,
        25,
        25
    ];


    const ABU = [
        245,
        245,
        245
    ];


    const PUTIH = [
        255,
        255,
        255
    ];


    /* HEADER */

    doc.setFillColor(
        ...MERAH
    );


    doc.rect(
        0,
        0,
        210,
        32,
        "F"
    );


    doc.setTextColor(
        ...PUTIH
    );


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        18
    );


    doc.text(
        "LINFOX",
        20,
        14
    );


    doc.setFontSize(
        8
    );


    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.text(
        "PT LINFOX LOGISTIC INDONESIA",
        20,
        21
    );


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        14
    );


    doc.text(
        "SURAT PERINTAH LEMBUR",
        190,
        14,
        {
            align: "right"
        }
    );


    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.setFontSize(
        8
    );


    doc.text(
        `No. Planning : ${id}`,
        190,
        21,
        {
            align: "right"
        }
    );


    doc.setTextColor(
        ...HITAM
    );


    /* INFORMASI */

    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        11
    );


    doc.text(
        "INFORMASI LEMBUR",
        20,
        45
    );


    doc.setDrawColor(
        ...MERAH
    );


    doc.setLineWidth(
        0.8
    );


    doc.line(
        20,
        48,
        190,
        48
    );


    doc.setFillColor(
        ...ABU
    );


    doc.roundedRect(
        20,
        53,
        170,
        45,
        2,
        2,
        "F"
    );


    function info(
        label,
        value,
        x,
        y
    ) {

        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.setFontSize(
            9
        );


        doc.text(
            label,
            x,
            y
        );


        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.text(
            String(value),
            x + 38,
            y
        );

    }


    info(
        "ID Planning",
        id,
        27,
        63
    );


    info(
        "Tanggal",
        tanggalTampil,
        27,
        73
    );


    info(
        "Jam Mulai",
        jamMulai,
        27,
        83
    );


    info(
        "Jam Selesai",
        jamSelesai,
        105,
        63
    );


    info(
        "Durasi",
        durasi,
        105,
        73
    );


    info(
        "Keterangan",
        keterangan,
        105,
        83
    );


    /* DAFTAR KARYAWAN */

    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        11
    );


    doc.text(
        "DAFTAR KARYAWAN YANG DIPERINTAHKAN LEMBUR",
        20,
        112
    );


    doc.setDrawColor(
        ...MERAH
    );


    doc.line(
        20,
        115,
        190,
        115
    );


    if (
        typeof doc.autoTable !==
        "function"
    ) {

        alert(
            "Plugin jsPDF AutoTable belum termuat."
        );

        return;
    }


    const tableData =
        daftarKaryawan.map(
            function (
                dataKaryawan,
                index
            ) {

                return [

                    index + 1,

                    dataKaryawan.nama ||
                    "-",

                    dataKaryawan.nik ||
                    dataKaryawan.NIK ||
                    dataKaryawan.NIB ||
                    dataKaryawan.id ||
                    "-",

                    dataKaryawan.jabatan ||
                    "-"

                ];

            }
        );


    doc.autoTable({

        startY:
            120,

        head: [[
            "No",
            "Nama Karyawan",
            "NIK / NIB",
            "Jabatan"
        ]],

        body:
            tableData,

        theme:
            "grid",

        styles: {

            font:
                "helvetica",

            fontSize:
                9,

            cellPadding:
                3,

            textColor:
                HITAM,

            lineColor: [
                210,
                210,
                210
            ],

            lineWidth:
                0.2

        },

        headStyles: {

            fillColor:
                MERAH,

            textColor:
                PUTIH,

            fontStyle:
                "bold",

            halign:
                "center"

        },

        columnStyles: {

            0: {
                cellWidth: 12,
                halign: "center"
            },

            1: {
                cellWidth: 70
            },

            2: {
                cellWidth: 40
            },

            3: {
                cellWidth: 48
            }

        },

        alternateRowStyles: {

            fillColor: [
                250,
                250,
                250
            ]

        }

    });


    /* TOTAL */

    let posisiY =
        doc.lastAutoTable
            ? doc.lastAutoTable.finalY + 12
            : 140;


    doc.setFillColor(
        ...MERAH
    );


    doc.roundedRect(
        20,
        posisiY - 7,
        170,
        14,
        2,
        2,
        "F"
    );


    doc.setTextColor(
        ...PUTIH
    );


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        10
    );


    doc.text(
        `TOTAL KARYAWAN : ${daftarKaryawan.length} ORANG`,
        105,
        posisiY + 2,
        {
            align: "center"
        }
    );


    /* TANDA TANGAN */

    posisiY += 30;


    doc.setTextColor(
        ...HITAM
    );


    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.setFontSize(
        9
    );


    doc.text(
        "Mengetahui,",
        35,
        posisiY
    );


    doc.text(
        "Dibuat oleh,",
        140,
        posisiY
    );


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.text(
        "Supervisor / Atasan",
        35,
        posisiY + 25,
        {
            align: "center"
        }
    );


    doc.text(
        "PIC Planning",
        140,
        posisiY + 25,
        {
            align: "center"
        }
    );


    /* FOOTER */

    const jumlahHalaman =
        doc.internal
            .getNumberOfPages();


    for (
        let i = 1;
        i <= jumlahHalaman;
        i++
    ) {

        doc.setPage(i);


        doc.setTextColor(
            120,
            120,
            120
        );


        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.setFontSize(
            7
        );


        doc.text(
            `Planning Lembur ${id} | Halaman ${i} dari ${jumlahHalaman}`,
            105,
            290,
            {
                align: "center"
            }
        );


        doc.setDrawColor(
            220,
            220,
            220
        );


        doc.line(
            20,
            284,
            190,
            284
        );

    }


    /* SIMPAN */

    const namaFile =
        String(id).replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
        );


    doc.save(
        `SPL_${namaFile}.pdf`
    );

}


/* =====================================================
   EVENT PLANNING
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const jamMulai =
            document.getElementById(
                "jamMulai"
            );


        if (
            jamMulai &&
            !jamMulai.dataset.durationListener
        ) {

            jamMulai.addEventListener(
                "change",
                hitungDurasiPlanning
            );


            jamMulai.dataset.durationListener =
                "true";

        }


        const jamSelesai =
            document.getElementById(
                "jamSelesai"
            );


        if (
            jamSelesai &&
            !jamSelesai.dataset.durationListener
        ) {

            jamSelesai.addEventListener(
                "change",
                hitungDurasiPlanning
            );


            jamSelesai.dataset.durationListener =
                "true";

        }


        const btn =
            document.getElementById(
                "btnBuatPlanning"
            );


        if (
            btn &&
            !btn.dataset.planningListener
        ) {

            btn.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    buatPlanning();

                }
            );


            btn.dataset.planningListener =
                "true";

        }


        const form =
            document.getElementById(
                "formPlanning"
            );


        if (
            form &&
            !form.dataset.planningListener
        ) {

            form.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    buatPlanning();

                }
            );


            form.dataset.planningListener =
                "true";

        }


        hitungDurasiPlanning();

    }
);


/* =====================================================
   DATABASE READY
===================================================== */

document.addEventListener(
    "databaseReady",
    function () {

        if (
            typeof renderPlanning ===
            "function"
        ) {

            renderPlanning();

        }


        if (
            typeof updateKaryawanDropdown ===
            "function"
        ) {

            updateKaryawanDropdown();

        }

    }
);


/* =====================================================
   ESC PREVIEW MODAL
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            const modal =
                document.getElementById(
                    "planningPreviewModal"
                );


            if (
                modal &&
                modal.classList.contains(
                    "active"
                )
            ) {

                closePreviewPlanning();

            }

        }

    }
);


/* =====================================================
   UPDATE DURASI SAAT JAM PREVIEW DIUBAH
===================================================== */

document.addEventListener(
    "input",
    function (event) {

        if (
            event.target &&
            (
                event.target.id ===
                "previewJamMulai" ||

                event.target.id ===
                "previewJamSelesai"
            )
        ) {

            hitungDurasiPreview();

        }

    }
);