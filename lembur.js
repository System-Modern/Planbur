/* =====================================================
   LEMBUR / PLANNING
   OPTIMIZED VERSION
   Logika utama tetap sama
===================================================== */


/* =====================================================
   HELPER
===================================================== */

function getKaryawanAktif() {
    if (!Array.isArray(karyawan)) return [];

    return karyawan.filter(item => {
        const status = String(item.status || "Aktif")
            .trim()
            .toLowerCase();

        return !["penalti", "nonaktif", "resign"].includes(status);
    });
}


function getPlanningKaryawanId(item = {}) {
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


function getPlanningKaryawanNama(item = {}) {
    return String(
        item.nama ??
        item.namaKaryawan ??
        item.Nama ??
        ""
    ).trim();
}


function escapePlanningHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getElement(id) {
    return document.getElementById(id);
}


/* =====================================================
   DURASI
===================================================== */

function hitungDurasiDariJam(jamMulai, jamSelesai) {
    if (!jamMulai || !jamSelesai) return 0;

    const mulai = jamMulai.split(":").map(Number);
    const selesai = jamSelesai.split(":").map(Number);

    if (
        mulai.length < 2 ||
        selesai.length < 2 ||
        Number.isNaN(mulai[0]) ||
        Number.isNaN(mulai[1]) ||
        Number.isNaN(selesai[0]) ||
        Number.isNaN(selesai[1])
    ) {
        return 0;
    }

    let awal = mulai[0] * 60 + mulai[1];
    let akhir = selesai[0] * 60 + selesai[1];

    if (akhir <= awal) akhir += 1440;

    return akhir - awal;
}


function formatDurasiPlanning(menit) {
    const value = Number(menit || 0);

    if (value <= 0) return "-";

    const jam = value / 60;

    return `${Number.isInteger(jam) ? jam : jam.toFixed(1)} Jam`;
}


function hitungDurasiPlanning() {
    const mulai = getElement("jamMulai");
    const selesai = getElement("jamSelesai");
    const durasi = getElement("durasiPlanning");

    if (!mulai || !selesai || !durasi) return;

    const menit = hitungDurasiDariJam(
        mulai.value,
        selesai.value
    );

    durasi.value = `${menit / 60 || 0} Jam`;
}


function getDurasiMenitPlanning() {
    const mulai = getElement("jamMulai");
    const selesai = getElement("jamSelesai");

    if (!mulai || !selesai) return 0;

    return hitungDurasiDariJam(
        mulai.value,
        selesai.value
    );
}


/* =====================================================
   ID PLANNING
===================================================== */

function generatePlanningId() {
    const now = new Date();

    const tanggal =
        `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    return `PLN-${tanggal}-${String(Date.now()).slice(-6)}`;
}


/* =====================================================
   MODAL BUAT PLANNING
===================================================== */

function openPlanningModal() {
    const modal = getElement("planningModal");

    if (!modal) {
        console.error("planningModal tidak ditemukan.");
        return;
    }

    const form = getElement("formPlanning");
    if (form) form.reset();

    const now = new Date();

    const localDate = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
    )
        .toISOString()
        .split("T")[0];

    const tanggal = getElement("tanggal");
    const durasi = getElement("durasiPlanning");
    const mulai = getElement("jamMulai");
    const selesai = getElement("jamSelesai");

    if (tanggal) tanggal.value = localDate;
    if (durasi) durasi.value = "4 Jam";
    if (mulai) mulai.value = "17:00";
    if (selesai) selesai.value = "21:00";

    renderPlanningKaryawan();

    modal.classList.add("active");
    modal.style.display = "flex";

    updateJumlahKaryawanPlanning();
}


function closePlanningModal() {
    const modal = getElement("planningModal");
    if (!modal) return;

    modal.classList.remove("active");
    modal.style.display = "none";

    const list = getElement("planningKaryawanList");

    if (list) {
        list.querySelectorAll(
            ".planning-karyawan-checkbox"
        ).forEach(cb => cb.checked = false);
    }

    updateJumlahKaryawanPlanning();
}


/* =====================================================
   KARYAWAN PLANNING
===================================================== */

function renderPlanningKaryawan() {
    const container = getElement("planningKaryawanList");

    if (!container) return;

    const daftar = getKaryawanAktif();

    container.innerHTML = "";

    if (!daftar.length) {
        container.innerHTML = `
            <div class="empty-state">
                Tidak ada karyawan yang dapat dipilih.
            </div>
        `;

        updateJumlahKaryawanPlanning();
        return;
    }

    const fragment = document.createDocumentFragment();

    daftar.forEach((item, index) => {
        const id = getPlanningKaryawanId(item);
        const nama = getPlanningKaryawanNama(item);

        if (!id && !nama) return;

        const safeId = `planning-karyawan-${index}`;

        const label = document.createElement("label");
        label.className = "planning-karyawan-item";
        label.htmlFor = safeId;

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.id = safeId;
        checkbox.className = "planning-karyawan-checkbox";
        checkbox.value = id;
        checkbox.dataset.id = id;
        checkbox.dataset.nama = nama;

        const info = document.createElement("div");
        info.className = "planning-karyawan-info";

        const strong = document.createElement("strong");
        strong.textContent = nama;

        const span = document.createElement("span");
        span.textContent = id;

        info.append(strong, span);
        label.append(checkbox, info);

        fragment.appendChild(label);
    });

    container.appendChild(fragment);

    updateJumlahKaryawanPlanning();
}


function updateJumlahKaryawanPlanning() {
    const container = getElement("planningKaryawanList");
    const counter = getElement("jumlahKaryawanPlanning");

    if (!container) return;

    const jumlah = container.querySelectorAll(
        ".planning-karyawan-checkbox:checked"
    ).length;

    if (counter) {
        counter.textContent = `${jumlah} karyawan dipilih`;
    }
}


function pilihSemuaKaryawanPlanning() {
    const container = getElement("planningKaryawanList");

    if (!container) return;

    container.querySelectorAll(
        ".planning-karyawan-checkbox"
    ).forEach(cb => cb.checked = true);

    updateJumlahKaryawanPlanning();
}


function batalSemuaKaryawanPlanning() {
    const container = getElement("planningKaryawanList");

    if (!container) return;

    container.querySelectorAll(
        ".planning-karyawan-checkbox"
    ).forEach(cb => cb.checked = false);

    updateJumlahKaryawanPlanning();
}


function getSelectedPlanningKaryawan() {
    const container = getElement("planningKaryawanList");

    if (!container) return [];

    return [...container.querySelectorAll(
        ".planning-karyawan-checkbox:checked"
    )].map(cb => ({
        id: cb.dataset.id || cb.value || "",
        nama: cb.dataset.nama || ""
    }));
}


/* =====================================================
   BUAT PLANNING
===================================================== */

async function buatPlanning() {
    const tanggal = getElement("tanggal");
    const jamMulai = getElement("jamMulai");
    const jamSelesai = getElement("jamSelesai");
    const keterangan = getElement("keterangan");

    if (!tanggal || !jamMulai || !jamSelesai) {
        alert("Form planning tidak ditemukan.");
        return;
    }

    if (!tanggal.value) {
        alert("Tanggal wajib diisi.");
        tanggal.focus();
        return;
    }

    if (!jamMulai.value) {
        alert("Jam mulai wajib diisi.");
        jamMulai.focus();
        return;
    }

    if (!jamSelesai.value) {
        alert("Jam selesai wajib diisi.");
        jamSelesai.focus();
        return;
    }

    const selected = getSelectedPlanningKaryawan();

    if (!selected.length) {
        alert("Pilih minimal satu karyawan.");
        return;
    }

    const durasiMenit = hitungDurasiDariJam(
        jamMulai.value,
        jamSelesai.value
    );

    if (durasiMenit <= 0) {
        alert("Durasi lembur tidak valid.");
        return;
    }

    if (!Array.isArray(planning)) {
        planning = [];
    }

    const idPlanning = generatePlanningId();

    const dataPlanning = {
        id: idPlanning,
        idPlanning,
        tanggal: tanggal.value,
        jamMulai: jamMulai.value,
        jamSelesai: jamSelesai.value,
        durasi: `${durasiMenit / 60} Jam`,
        durasiMenit,
        keterangan: keterangan
            ? keterangan.value.trim()
            : "",
        karyawan: selected,
        createdAt: new Date().toISOString()
    };

    planning.push(dataPlanning);

    const berhasil = await simpanPlanningKeDatabase();

    if (!berhasil) {
        planning.pop();

        alert("Planning gagal disimpan ke database.");
        return;
    }

    if (typeof updateKaryawanDropdown === "function") {
        updateKaryawanDropdown();
    }

    if (typeof renderPlanning === "function") {
        renderPlanning();
    }

    if (typeof updateDashboard === "function") {
        updateDashboard();
    }

    closePlanningModal();

    alert(
        `Planning berhasil dibuat.\n${selected.length} karyawan dipilih.`
    );
}


async function simpanPlanningKeDatabase() {
    if (typeof simpanData !== "function") {
        console.warn("Fungsi simpanData() tidak ditemukan.");
        return true;
    }

    try {
        const result = await simpanData();
        return result !== false;
    } catch (error) {
        console.error(
            "Gagal menyimpan planning:",
            error
        );

        return false;
    }
}


/* =====================================================
   RENDER PLANNING
===================================================== */

function renderPlanning() {
    const tbody = getElement("planningTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!Array.isArray(planning)) {
        updateJumlahPlanningText(0);
        return;
    }

    const filterTanggal = getElement("filterTanggal");
    const filterKaryawan = getElement("filterKaryawan");

    const tanggalFilter = filterTanggal?.value || "";
    const karyawanFilter = filterKaryawan?.value || "";

    let data = planning.filter(item => {
        if (
            tanggalFilter &&
            item.tanggal !== tanggalFilter
        ) {
            return false;
        }

        if (karyawanFilter) {
            if (!Array.isArray(item.karyawan)) {
                return false;
            }

            const ada = item.karyawan.some(k =>
                String(k.id || "") === String(karyawanFilter)
            );

            if (!ada) return false;
        }

        return true;
    });

    data.reverse();

    const fragment = document.createDocumentFragment();

    data.forEach((item, index) => {
        const tr = document.createElement("tr");

        const daftar = Array.isArray(item.karyawan)
            ? item.karyawan
            : [];

        const nama = daftar
            .map(k => k.nama || "")
            .filter(Boolean)
            .join(", ");

        const id =
            item.idPlanning ||
            item.id ||
            "-";

        const durasi =
            item.durasi ||
            formatDurasiPlanning(item.durasiMenit);

        const tanggal =
            formatTanggalPlanning(item.tanggal);

        const jam =
            `${item.jamMulai || "-"} - ${item.jamSelesai || "-"}`;

        const values = [
            index + 1,
            id,
            tanggal,
            nama || "-",
            jam,
            durasi,
            item.keterangan || "-"
        ];

        values.forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        });

        const action = document.createElement("td");
        action.className = "planning-action";

        action.append(
            createPlanningButton(
                "Preview",
                "btn-preview-planning",
                () => previewPlanning(id),
                "Preview Planning"
            ),

            createPlanningButton(
                "Cetak",
                "btn-cetak-spl",
                () => cetakPlanningPDF(id),
                "Cetak SPL"
            ),

            createPlanningButton(
                "Hapus",
                "btn-secondary",
                () => hapusPlanning(id),
                "Hapus Planning"
            )
        );

        tr.appendChild(action);
        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);

    updateJumlahPlanningText(data.length);
}


function createPlanningButton(
    text,
    className,
    handler,
    title
) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = className;
    button.textContent = text;
    button.title = title;
    button.addEventListener("click", handler);

    return button;
}


function updateJumlahPlanningText(jumlah) {
    const element = getElement("jumlahPlanningText");

    if (element) {
        element.textContent = `${jumlah} planning`;
    }
}


/* =====================================================
   FORMAT
===================================================== */

function formatTanggalPlanning(tanggal) {
    if (!tanggal) return "-";

    const parts = String(tanggal).split("-");

    if (parts.length !== 3) return tanggal;

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}


/* =====================================================
   PREVIEW
===================================================== */

function previewPlanning(idPlanning) {
    if (!Array.isArray(planning)) {
        alert("Data planning tidak tersedia.");
        return;
    }

    const item = planning.find(data =>
        String(
            data.idPlanning ||
            data.id ||
            ""
        ) === String(idPlanning)
    );

    if (!item) {
        alert("Data planning tidak ditemukan.");
        return;
    }

    buatModalPreviewPlanning();

    const modal = getElement("planningPreviewModal");
    const content = getElement("planningPreviewContent");

    if (!modal || !content) return;

    const id =
        item.idPlanning ||
        item.id ||
        "-";

    const daftar =
        Array.isArray(item.karyawan)
            ? item.karyawan
            : [];

    modal.dataset.idPlanning = id;

    const tanggal = item.tanggal || "";
    const jamMulai = item.jamMulai || "";
    const jamSelesai = item.jamSelesai || "";
    const durasi =
        item.durasi ||
        formatDurasiPlanning(item.durasiMenit);

    const keterangan = item.keterangan || "";

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
            >×</button>
        </div>

        <div class="planning-preview-form">

            <div class="planning-preview-field">
                <label>Tanggal</label>
                <input
                    type="date"
                    id="previewTanggal"
                    value="${escapePlanningHTML(tanggal)}"
                >
            </div>

            <div class="planning-preview-field">
                <label>Jam Mulai</label>
                <input
                    type="time"
                    id="previewJamMulai"
                    value="${escapePlanningHTML(jamMulai)}"
                >
            </div>

            <div class="planning-preview-field">
                <label>Jam Selesai</label>
                <input
                    type="time"
                    id="previewJamSelesai"
                    value="${escapePlanningHTML(jamSelesai)}"
                >
            </div>

            <div class="planning-preview-field">
                <label>Durasi</label>
                <input
                    type="text"
                    id="previewDurasi"
                    value="${escapePlanningHTML(durasi)}"
                    readonly
                >
            </div>

            <div class="planning-preview-field planning-preview-full">
                <label>Keterangan</label>
                <textarea
                    id="previewKeterangan"
                    rows="3"
                >${escapePlanningHTML(keterangan)}</textarea>
            </div>

        </div>

        <div class="planning-preview-section">

            <div class="planning-preview-section-header">

                <div>
                    <h3>Karyawan Lembur</h3>

                    <span id="previewJumlahKaryawan">
                        ${daftar.length} karyawan
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

    renderPreviewKaryawan(daftar);
    hitungDurasiPreview();

    modal.classList.add("active");
    modal.style.display = "flex";
}


/* =====================================================
   MODAL PREVIEW
===================================================== */

function buatModalPreviewPlanning() {
    if (getElement("planningPreviewModal")) return;

    const modal = document.createElement("div");

    modal.id = "planningPreviewModal";
    modal.className = "planning-preview-modal";

    modal.innerHTML = `
        <div
            class="planning-preview-overlay"
            onclick="closePreviewPlanning()"
        ></div>

        <div class="planning-preview-box">
            <div id="planningPreviewContent"></div>
        </div>
    `;

    document.body.appendChild(modal);

    if (!getElement("planningPreviewStyle")) {
        const style = document.createElement("style");

        style.id = "planningPreviewStyle";

        style.textContent = `
            .planning-preview-modal {
                position:fixed;
                inset:0;
                z-index:99999;
                display:none;
                align-items:center;
                justify-content:center;
            }

            .planning-preview-modal.active {
                display:flex;
            }

            .planning-preview-overlay {
                position:absolute;
                inset:0;
                background:rgba(0,0,0,.55);
                backdrop-filter:blur(3px);
            }

            .planning-preview-box {
                position:relative;
                width:min(900px,94vw);
                max-height:92vh;
                overflow-y:auto;
                background:#fff;
                border-radius:16px;
                box-shadow:0 20px 60px rgba(0,0,0,.25);
                z-index:2;
            }

            .planning-preview-header {
                display:flex;
                align-items:center;
                justify-content:space-between;
                padding:22px 26px;
                background:#d71920;
                color:#fff;
                border-radius:16px 16px 0 0;
            }

            .planning-preview-label {
                font-size:11px;
                opacity:.8;
                font-weight:600;
                letter-spacing:.5px;
            }

            .planning-preview-id {
                margin-top:4px;
                font-size:19px;
                font-weight:700;
            }

            .planning-preview-close {
                border:0;
                background:transparent;
                color:#fff;
                font-size:30px;
                cursor:pointer;
                width:38px;
                height:38px;
                border-radius:8px;
            }

            .planning-preview-close:hover {
                background:rgba(255,255,255,.15);
            }

            .planning-preview-form {
                display:grid;
                grid-template-columns:repeat(3,1fr);
                gap:16px;
                padding:24px 26px 10px;
            }

            .planning-preview-field {
                display:flex;
                flex-direction:column;
                gap:7px;
            }

            .planning-preview-full {
                grid-column:1/-1;
            }

            .planning-preview-field label {
                font-size:12px;
                font-weight:700;
                color:#444;
            }

            .planning-preview-field input,
            .planning-preview-field textarea {
                width:100%;
                box-sizing:border-box;
                border:1px solid #ddd;
                border-radius:8px;
                padding:10px 12px;
                font-size:14px;
                font-family:inherit;
                outline:none;
            }

            .planning-preview-field input:focus,
            .planning-preview-field textarea:focus {
                border-color:#d71920;
                box-shadow:0 0 0 3px rgba(215,25,32,.08);
            }

            .planning-preview-field input[readonly] {
                background:#f5f5f5;
                color:#666;
            }

            .planning-preview-section {
                padding:18px 26px 8px;
            }

            .planning-preview-section-header {
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:15px;
                margin-bottom:12px;
            }

            .planning-preview-section-header h3 {
                margin:0;
                font-size:16px;
                color:#222;
            }

            .planning-preview-section-header span {
                display:block;
                margin-top:3px;
                font-size:12px;
                color:#777;
            }

            .planning-btn-add {
                border:0;
                background:#151515;
                color:#fff;
                padding:9px 13px;
                border-radius:8px;
                cursor:pointer;
                font-weight:600;
            }

            .planning-preview-karyawan-list {
                display:flex;
                flex-direction:column;
                gap:9px;
                max-height:300px;
                overflow-y:auto;
            }

            .planning-preview-karyawan-row {
                display:grid;
                grid-template-columns:38px 1fr 180px 42px;
                align-items:center;
                gap:10px;
                padding:10px;
                border:1px solid #e4e4e4;
                border-radius:10px;
                background:#fafafa;
            }

            .planning-preview-number {
                width:30px;
                height:30px;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#f0f0f0;
                border-radius:7px;
                font-size:12px;
                font-weight:700;
                color:#555;
            }

            .planning-preview-karyawan-row input {
                width:100%;
                box-sizing:border-box;
                border:1px solid #ddd;
                border-radius:7px;
                padding:9px 10px;
                font-size:13px;
                outline:none;
            }

            .planning-btn-delete {
                border:0;
                background:#fff1f2;
                color:#d71920;
                width:34px;
                height:34px;
                border-radius:7px;
                cursor:pointer;
                font-size:17px;
                font-weight:700;
            }

            .planning-preview-actions {
                display:flex;
                justify-content:flex-end;
                gap:10px;
                padding:22px 26px;
                margin-top:10px;
                border-top:1px solid #eee;
            }

            .planning-btn-cancel,
            .planning-btn-save {
                border:0;
                padding:11px 18px;
                border-radius:8px;
                cursor:pointer;
                font-weight:700;
            }

            .planning-btn-cancel {
                background:#eee;
                color:#333;
            }

            .planning-btn-save {
                background:#d71920;
                color:#fff;
            }

            @media(max-width:700px) {
                .planning-preview-form {
                    grid-template-columns:1fr;
                }

                .planning-preview-full {
                    grid-column:auto;
                }

                .planning-preview-karyawan-row {
                    grid-template-columns:32px 1fr 38px;
                }

                .planning-preview-karyawan-row
                .preview-id-input {
                    grid-column:2/-1;
                }
            }
        `;

        document.head.appendChild(style);
    }
}


/* =====================================================
   PREVIEW KARYAWAN
===================================================== */

function renderPreviewKaryawan(daftar) {
    const container = getElement("previewKaryawanList");

    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(daftar) || !daftar.length) {
        container.innerHTML = `
            <div class="empty-state"
                 style="padding:20px;text-align:center;color:#777">
                Belum ada karyawan.
            </div>
        `;

        updatePreviewJumlahKaryawan();
        return;
    }

    const fragment = document.createDocumentFragment();

    daftar.forEach((item, index) => {
        const id =
            item.id ||
            item.nik ||
            item.NIK ||
            item.NIB ||
            "";

        const nama = item.nama || "";

        const row = document.createElement("div");

        row.className = "planning-preview-karyawan-row";

        row.innerHTML = `
            <div class="planning-preview-number">
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
            >×</button>
        `;

        fragment.appendChild(row);
    });

    container.appendChild(fragment);

    updatePreviewJumlahKaryawan();
}


function updatePreviewJumlahKaryawan() {
    const container = getElement("previewKaryawanList");
    const counter = getElement("previewJumlahKaryawan");

    if (!container) return;

    const jumlah = container.querySelectorAll(
        ".planning-preview-karyawan-row"
    ).length;

    if (counter) {
        counter.textContent = `${jumlah} karyawan`;
    }
}


function tambahKaryawanPreview() {
    const container = getElement("previewKaryawanList");

    if (!container) return;

    const aktif = getKaryawanAktif();

    if (!aktif.length) {
        alert("Data karyawan aktif tidak tersedia.");
        return;
    }

    const sekarang = [...container.querySelectorAll(
        ".planning-preview-karyawan-row"
    )].map(row => ({
        id:
            row.querySelector(".preview-id-input")?.value.trim() || "",
        nama:
            row.querySelector(".preview-nama-input")?.value.trim() || ""
    }));

    const idSudahAda = new Set(
        sekarang.map(item => String(item.id))
    );

    const tersedia = aktif.find(item =>
        !idSudahAda.has(
            String(getPlanningKaryawanId(item))
        )
    );

    if (!tersedia) {
        alert(
            "Semua karyawan aktif sudah ada di planning ini."
        );
        return;
    }

    sekarang.push({
        id: getPlanningKaryawanId(tersedia),
        nama: getPlanningKaryawanNama(tersedia)
    });

    renderPreviewKaryawan(sekarang);
}


function hapusKaryawanPreview(button) {
    if (!button) return;

    const row = button.closest(
        ".planning-preview-karyawan-row"
    );

    const container = getElement("previewKaryawanList");

    if (!row || !container) return;

    const rows = container.querySelectorAll(
        ".planning-preview-karyawan-row"
    );

    if (rows.length <= 1) {
        alert("Minimal harus ada satu karyawan.");
        return;
    }

    row.remove();

    updatePreviewNomor();
    updatePreviewJumlahKaryawan();
}


function updatePreviewNomor() {
    const container = getElement("previewKaryawanList");

    if (!container) return;

    container.querySelectorAll(
        ".planning-preview-karyawan-row"
    ).forEach((row, index) => {
        const nomor = row.querySelector(
            ".planning-preview-number"
        );

        if (nomor) nomor.textContent = index + 1;
    });
}


/* =====================================================
   DURASI PREVIEW
===================================================== */

function hitungDurasiPreview() {
    const mulai = getElement("previewJamMulai");
    const selesai = getElement("previewJamSelesai");
    const durasi = getElement("previewDurasi");

    if (!mulai || !selesai || !durasi) return;

    const menit = hitungDurasiDariJam(
        mulai.value,
        selesai.value
    );

    durasi.value = `${menit / 60 || 0} Jam`;
}


/* =====================================================
   CLOSE PREVIEW
===================================================== */

function closePreviewPlanning() {
    const modal = getElement("planningPreviewModal");

    if (!modal) return;

    modal.classList.remove("active");
    modal.style.display = "none";
}


/* =====================================================
   EDIT PLANNING
===================================================== */

async function simpanEditPlanning() {
    const modal = getElement("planningPreviewModal");

    if (!modal) return;

    const idPlanning = modal.dataset.idPlanning;

    if (!idPlanning) {
        alert("ID planning tidak ditemukan.");
        return;
    }

    if (!Array.isArray(planning)) {
        alert("Data planning tidak tersedia.");
        return;
    }

    const index = planning.findIndex(item =>
        String(
            item.idPlanning ||
            item.id ||
            ""
        ) === String(idPlanning)
    );

    if (index === -1) {
        alert("Planning tidak ditemukan.");
        return;
    }

    const tanggal = getElement("previewTanggal");
    const jamMulai = getElement("previewJamMulai");
    const jamSelesai = getElement("previewJamSelesai");
    const keterangan = getElement("previewKeterangan");

    if (!tanggal || !jamMulai || !jamSelesai) {
        alert("Form edit tidak lengkap.");
        return;
    }

    if (!tanggal.value) {
        alert("Tanggal wajib diisi.");
        tanggal.focus();
        return;
    }

    if (!jamMulai.value) {
        alert("Jam mulai wajib diisi.");
        jamMulai.focus();
        return;
    }

    if (!jamSelesai.value) {
        alert("Jam selesai wajib diisi.");
        jamSelesai.focus();
        return;
    }

    const rows = document.querySelectorAll(
        "#previewKaryawanList .planning-preview-karyawan-row"
    );

    if (!rows.length) {
        alert("Minimal harus ada satu karyawan.");
        return;
    }

    const daftarKaryawan = [];
    let valid = true;

    rows.forEach(row => {
        const nama =
            row.querySelector(".preview-nama-input")
                ?.value.trim() || "";

        const id =
            row.querySelector(".preview-id-input")
                ?.value.trim() || "";

        if (!nama) valid = false;

        daftarKaryawan.push({
            id,
            nama
        });
    });

    if (!valid) {
        alert("Nama karyawan tidak boleh kosong.");
        return;
    }

    const durasiMenit = hitungDurasiDariJam(
        jamMulai.value,
        jamSelesai.value
    );

    if (durasiMenit <= 0) {
        alert("Durasi lembur tidak valid.");
        return;
    }

    const dataLama = JSON.parse(
        JSON.stringify(planning[index])
    );

    planning[index] = {
        ...planning[index],
        tanggal: tanggal.value,
        jamMulai: jamMulai.value,
        jamSelesai: jamSelesai.value,
        durasi: `${durasiMenit / 60} Jam`,
        durasiMenit,
        keterangan:
            keterangan?.value.trim() || "",
        karyawan: daftarKaryawan
    };

    const berhasil =
        await simpanPlanningKeDatabase();

    if (!berhasil) {
        planning[index] = dataLama;

        alert(
            "Perubahan gagal disimpan ke database."
        );

        return;
    }

    renderPlanning();

    if (typeof updateDashboard === "function") {
        updateDashboard();
    }

    if (typeof updateKaryawanDropdown === "function") {
        updateKaryawanDropdown();
    }

    closePreviewPlanning();

    alert("Planning berhasil diperbarui.");
}


/* =====================================================
   HAPUS PLANNING
===================================================== */

async function hapusPlanning(idPlanning) {
    if (!Array.isArray(planning)) return;

    if (!confirm(
        "Yakin ingin menghapus planning ini?"
    )) {
        return;
    }

    const index = planning.findIndex(item =>
        String(
            item.idPlanning ||
            item.id ||
            ""
        ) === String(idPlanning)
    );

    if (index === -1) {
        alert("Data planning tidak ditemukan.");
        return;
    }

    const dataLama = planning[index];

    planning.splice(index, 1);

    const berhasil =
        await simpanPlanningKeDatabase();

    if (!berhasil) {
        planning.splice(index, 0, dataLama);

        alert(
            "Planning gagal dihapus dari database."
        );

        return;
    }

    renderPlanning();

    if (typeof updateDashboard === "function") {
        updateDashboard();
    }
}


/* =====================================================
   FILTER
===================================================== */

function resetFilter() {
    const tanggal = getElement("filterTanggal");
    const karyawan = getElement("filterKaryawan");

    if (tanggal) tanggal.value = "";
    if (karyawan) karyawan.value = "";

    renderPlanning();
}


/* =====================================================
   PDF / SPL
===================================================== */

function cetakPlanningPDF(idPlanning) {
    if (!Array.isArray(planning)) {
        alert("Data planning tidak tersedia.");
        return;
    }

    const item = planning.find(data =>
        String(
            data.idPlanning ||
            data.id ||
            ""
        ) === String(idPlanning)
    );

    if (!item) {
        alert("Data planning tidak ditemukan.");
        return;
    }

    if (typeof window.jspdf === "undefined") {
        alert("jsPDF belum termuat.");
        return;
    }

    if (typeof window.jspdf.jsPDF !== "function") {
        alert("jsPDF tidak dapat digunakan.");
        return;
    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    if (typeof doc.autoTable !== "function") {
        alert("Plugin jsPDF AutoTable belum termuat.");
        return;
    }

    const id =
        item.idPlanning ||
        item.id ||
        "-";

    const tanggal =
        formatTanggalPlanning(item.tanggal);

    const jamMulai =
        item.jamMulai || "-";

    const jamSelesai =
        item.jamSelesai || "-";

    const durasi =
        item.durasi ||
        formatDurasiPlanning(item.durasiMenit);

    const keterangan =
        item.keterangan || "-";

    const daftarKaryawan =
        Array.isArray(item.karyawan)
            ? item.karyawan
            : [];

    const MERAH = [215, 25, 32];
    const HITAM = [25, 25, 25];
    const ABU = [245, 245, 245];
    const PUTIH = [255, 255, 255];

    /* HEADER */

    doc.setFillColor(...MERAH);
    doc.rect(0, 0, 210, 32, "F");

    doc.setTextColor(...PUTIH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("LINFOX", 20, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
        "PT LINFOX LOGISTIC INDONESIA",
        20,
        21
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);

    doc.text(
        "SURAT PERINTAH LEMBUR",
        190,
        14,
        { align: "right" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    doc.text(
        `No. Planning : ${id}`,
        190,
        21,
        { align: "right" }
    );

    doc.setTextColor(...HITAM);

    /* INFORMASI */

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    doc.text(
        "INFORMASI LEMBUR",
        20,
        45
    );

    doc.setDrawColor(...MERAH);
    doc.setLineWidth(.8);
    doc.line(20, 48, 190, 48);

    doc.setFillColor(...ABU);

    doc.roundedRect(
        20,
        53,
        170,
        45,
        2,
        2,
        "F"
    );

    function info(label, value, x, y) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(label, x, y);

        doc.setFont("helvetica", "normal");
        doc.text(String(value), x + 38, y);
    }

    info("ID Planning", id, 27, 63);
    info("Tanggal", tanggal, 27, 73);
    info("Jam Mulai", jamMulai, 27, 83);

    info("Jam Selesai", jamSelesai, 105, 63);
    info("Durasi", durasi, 105, 73);
    info("Keterangan", keterangan, 105, 83);

    /* KARYAWAN */

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    doc.text(
        "DAFTAR KARYAWAN YANG DIPERINTAHKAN LEMBUR",
        20,
        112
    );

    doc.setDrawColor(...MERAH);
    doc.line(20, 115, 190, 115);

    const tableData = daftarKaryawan.map(
        (data, index) => [
            index + 1,
            data.nama || "-",
            data.nik ||
            data.NIK ||
            data.NIB ||
            data.id ||
            "-",
            data.jabatan || "-"
        ]
    );

    doc.autoTable({
        startY: 120,

        head: [[
            "No",
            "Nama Karyawan",
            "NIK / NIB",
            "Jabatan"
        ]],

        body: tableData,

        theme: "grid",

        styles: {
            font: "helvetica",
            fontSize: 9,
            cellPadding: 3,
            textColor: HITAM,
            lineColor: [210, 210, 210],
            lineWidth: .2
        },

        headStyles: {
            fillColor: MERAH,
            textColor: PUTIH,
            fontStyle: "bold",
            halign: "center"
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
            fillColor: [250, 250, 250]
        }
    });

    /* TOTAL */

    let posisiY =
        doc.lastAutoTable.finalY + 12;

    doc.setFillColor(...MERAH);

    doc.roundedRect(
        20,
        posisiY - 7,
        170,
        14,
        2,
        2,
        "F"
    );

    doc.setTextColor(...PUTIH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    doc.text(
        `TOTAL KARYAWAN : ${daftarKaryawan.length} ORANG`,
        105,
        posisiY + 2,
        { align: "center" }
    );

    /* TANDA TANGAN */

    posisiY += 30;

    doc.setTextColor(...HITAM);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text("Mengetahui,", 35, posisiY);
    doc.text("Dibuat oleh,", 140, posisiY);

    doc.setFont("helvetica", "bold");

    doc.text(
        "Supervisor / Atasan",
        35,
        posisiY + 25,
        { align: "center" }
    );

    doc.text(
        "PIC Planning",
        140,
        posisiY + 25,
        { align: "center" }
    );

    /* FOOTER */

    const jumlahHalaman =
        doc.internal.getNumberOfPages();

    for (let i = 1; i <= jumlahHalaman; i++) {
        doc.setPage(i);

        doc.setTextColor(120, 120, 120);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);

        doc.text(
            `Planning Lembur ${id} | Halaman ${i} dari ${jumlahHalaman}`,
            105,
            290,
            { align: "center" }
        );

        doc.setDrawColor(220, 220, 220);
        doc.line(20, 284, 190, 284);
    }

    const namaFile = String(id)
        .replace(/[^a-zA-Z0-9_-]/g, "_");

    doc.save(`SPL_${namaFile}.pdf`);
}


/* =====================================================
   EVENT
===================================================== */

function initLemburEvents() {
    const jamMulai = getElement("jamMulai");
    const jamSelesai = getElement("jamSelesai");

    if (
        jamMulai &&
        !jamMulai.dataset.durationListener
    ) {
        jamMulai.addEventListener(
            "input",
            hitungDurasiPlanning
        );

        jamMulai.dataset.durationListener = "true";
    }

    if (
        jamSelesai &&
        !jamSelesai.dataset.durationListener
    ) {
        jamSelesai.addEventListener(
            "input",
            hitungDurasiPlanning
        );

        jamSelesai.dataset.durationListener = "true";
    }

    const btn = getElement("btnBuatPlanning");

    if (
        btn &&
        !btn.dataset.planningListener
    ) {
        btn.addEventListener(
            "click",
            event => {
                event.preventDefault();
                buatPlanning();
            }
        );

        btn.dataset.planningListener = "true";
    }

    const form = getElement("formPlanning");

    if (
        form &&
        !form.dataset.planningListener
    ) {
        form.addEventListener(
            "submit",
            event => {
                event.preventDefault();
                buatPlanning();
            }
        );

        form.dataset.planningListener = "true";
    }

    hitungDurasiPlanning();
}


/* =====================================================
   DATABASE READY
===================================================== */

document.addEventListener(
    "databaseReady",
    () => {
        renderPlanning();

        if (typeof updateKaryawanDropdown === "function") {
            updateKaryawanDropdown();
        }
    }
);


/* =====================================================
   DOM READY
===================================================== */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initLemburEvents,
        { once: true }
    );
} else {
    initLemburEvents();
}


/* =====================================================
   ESC PREVIEW
===================================================== */

document.addEventListener(
    "keydown",
    event => {
        if (event.key !== "Escape") return;

        const modal =
            getElement("planningPreviewModal");

        if (
            modal &&
            modal.classList.contains("active")
        ) {
            closePreviewPlanning();
        }
    }
);


/* =====================================================
   UPDATE DURASI PREVIEW
===================================================== */

document.addEventListener(
    "input",
    event => {
        if (
            event.target?.id === "previewJamMulai" ||
            event.target?.id === "previewJamSelesai"
        ) {
            hitungDurasiPreview();
        }
    }
);
