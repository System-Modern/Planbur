    /* =========================================================
    PLANNING LEMBUR - OPTIMIZED
    ========================================================= */

    /* =========================================================
    STATE
    ========================================================= */

    let planningCRUDLoading = false;

    const PlanningState = {
        previewId: null,
        toastTimer: null,
        loadingInitialized: false,
        searchInitialized: false,
        previewEventsInitialized: false
    };


    /* =========================================================
    DOM HELPER
    ========================================================= */

    function planningEl(id) {
        return document.getElementById(id);
    }


    /* =========================================================
    NORMALIZER
    ========================================================= */

    function normalizePlanningSearch(value) {
        return String(value ?? "")
            .toLowerCase()
            .trim();
    }


    /* =========================================================
    ESCAPE HTML
    ========================================================= */

    function escapePlanningHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =========================================================
    KARYAWAN HELPER
    ========================================================= */

    function getKaryawanAktif() {

        if (!Array.isArray(karyawan)) {
            return [];
        }

        return karyawan.filter(function (item) {

            const status = normalizePlanningSearch(
                item?.status || "Aktif"
            );

            return ![
                "penalti",
                "nonaktif",
                "resign"
            ].includes(status);

        });

    }


    /* =========================================================
    GET ID KARYAWAN
    ========================================================= */

    function getPlanningKaryawanId(item) {

        if (!item) {
            return "";
        }

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


    /* =========================================================
    GET NAMA KARYAWAN
    ========================================================= */

    function getPlanningKaryawanNama(item) {

        if (!item) {
            return "";
        }

        return String(
            item.nama ??
            item.namaKaryawan ??
            item.Nama ??
            ""
        ).trim();

    }


    /* =========================================================
    SEMUA IDENTITAS KARYAWAN
    ========================================================= */

    function getPlanningKaryawanIdentifiers(item) {

        if (!item) {
            return [];
        }

        return [
            item.id,
            item.idKaryawan,
            item.ID,
            item.nik,
            item.NIK,
            item.NIB
        ]
            .filter(function (value) {
                return value !== undefined &&
                    value !== null &&
                    String(value).trim() !== "";
            })
            .map(function (value) {
                return String(value).trim();
            });

    }


    /* =========================================================
    SEARCH TEXT KARYAWAN
    ========================================================= */

    function getPlanningKaryawanSearchText(item) {

        return normalizePlanningSearch(
            [
                getPlanningKaryawanNama(item),
                ...getPlanningKaryawanIdentifiers(item)
            ].join(" ")
        );

    }


    /* =========================================================
    SORT KARYAWAN
    ========================================================= */

    function sortPlanningKaryawan(data) {

        if (!Array.isArray(data)) {
            return [];
        }

        return [...data].sort(function (a, b) {

            return getPlanningKaryawanNama(a)
                .localeCompare(
                    getPlanningKaryawanNama(b),
                    "id",
                    {
                        sensitivity: "base"
                    }
                );

        });

    }


    /* =========================================================
    GET PLANNING ID
    ========================================================= */

    function getPlanningId(item) {

        return String(
            item?.idPlanning ??
            item?.id ??
            ""
        ).trim();

    }


    /* =========================================================
    FIND PLANNING
    ========================================================= */

    function findPlanningById(idPlanning) {

        if (!Array.isArray(planning)) {
            return null;
        }

        const target = String(idPlanning);

        return planning.find(function (item) {

            return getPlanningId(item) === target;

        }) || null;

    }


    /* =========================================================
    LOADING
    ========================================================= */

    function initPlanningLoading() {

        if (planningEl("planningGlobalLoading")) {
            return;
        }

        const loading = document.createElement("div");

        loading.id = "planningGlobalLoading";

        loading.innerHTML = `
            <div class="planning-loading-box">
                <div class="planning-loading-spinner"></div>
                <div
                    class="planning-loading-text"
                    id="planningLoadingText"
                >
                    Memproses...
                </div>
            </div>
        `;

        Object.assign(loading.style, {
            position: "fixed",
            inset: "0",
            background: "rgba(0,0,0,.35)",
            backdropFilter: "blur(3px)",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "999998"
        });

        const style = document.createElement("style");

        style.id = "planningLoadingStyle";

        style.textContent = `
            .planning-loading-box {
                min-width: 220px;
                padding: 25px 30px;
                border-radius: 15px;
                background: #fff;
                box-shadow: 0 15px 50px rgba(0,0,0,.2);
                text-align: center;
                font-family: Arial, sans-serif;
            }

            .planning-loading-spinner {
                width: 38px;
                height: 38px;
                margin: 0 auto 14px;
                border: 4px solid #eee;
                border-top-color: #d71920;
                border-radius: 50%;
                animation: planningSpin .8s linear infinite;
            }

            .planning-loading-text {
                font-size: 14px;
                font-weight: 600;
                color: #333;
            }

            @keyframes planningSpin {
                to {
                    transform: rotate(360deg);
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(loading);

    }


    function showPlanningLoading(text = "Memproses...") {

        initPlanningLoading();

        const loading = planningEl(
            "planningGlobalLoading"
        );

        const textElement = planningEl(
            "planningLoadingText"
        );

        if (textElement) {
            textElement.textContent = text;
        }

        if (loading) {
            loading.style.display = "flex";
        }

    }


    function hidePlanningLoading() {

        const loading = planningEl(
            "planningGlobalLoading"
        );

        if (loading) {
            loading.style.display = "none";
        }

    }


    /* =========================================================
    BUTTON LOCK
    ========================================================= */

    function lockPlanningButton(button) {

        if (!button) {
            return;
        }

        if (!button.dataset.originalText) {
            button.dataset.originalText =
                button.innerHTML;
        }

        button.disabled = true;

        button.innerHTML = `
            <span style="
                display:inline-flex;
                align-items:center;
                gap:6px;
            ">
                ⏳ Memproses...
            </span>
        `;

    }


    function unlockPlanningButton(button) {

        if (!button) {
            return;
        }

        button.disabled = false;

        if (button.dataset.originalText) {
            button.innerHTML =
                button.dataset.originalText;
        }

    }


    /* =========================================================
    OPEN PLANNING MODAL
    ========================================================= */

    function openPlanningModal() {

        if (planningCRUDLoading) {
            return;
        }

        const modal = planningEl("planningModal");

        const form = planningEl("formPlanning");

        if (!modal) {
            return;
        }

        if (form) {
            form.reset();
        }

        const tanggal = planningEl("tanggal");

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

        const durasi = planningEl("durasiPlanning");

        const jamMulai = planningEl("jamMulai");

        const jamSelesai = planningEl("jamSelesai");

        if (durasi) {
            durasi.value = "4 Jam";
        }

        if (jamMulai) {
            jamMulai.value = "17:00";
        }

        if (jamSelesai) {
            jamSelesai.value = "21:00";
        }

        renderPlanningKaryawan();

        modal.style.display = "flex";

        requestAnimationFrame(function () {
            modal.classList.add("active");
        });

        updateJumlahKaryawanPlanning();

        hitungDurasiPlanning();

    }


    /* =========================================================
    CLOSE PLANNING MODAL
    ========================================================= */

    function closePlanningModal() {

        const modal = planningEl("planningModal");

        if (!modal) {
            return;
        }

        modal.classList.remove("active");
        modal.style.display = "none";

        const search = planningEl(
            "planningSearchKaryawan"
        );

        if (search) {
            search.value = "";
        }

        document
            .querySelectorAll(
                "#planningKaryawanList input[type='checkbox']"
            )
            .forEach(function (checkbox) {
                checkbox.checked = false;
            });

        updateJumlahKaryawanPlanning();

    }


    /* =========================================================
    SEARCH KARYAWAN
    ========================================================= */

    function createPlanningSearch() {

        const container = planningEl(
            "planningKaryawanList"
        );

        if (!container) {
            return;
        }

        if (planningEl("planningSearchKaryawan")) {
            return;
        }

        const wrapper = document.createElement("div");

        wrapper.className =
            "planning-search-wrapper";

        wrapper.innerHTML = `
            <input
                type="search"
                id="planningSearchKaryawan"
                class="planning-search-input"
                placeholder="Cari nama, NIK, atau NIB..."
                autocomplete="off"
            >
        `;

        container.parentNode.insertBefore(
            wrapper,
            container
        );

        const input = planningEl(
            "planningSearchKaryawan"
        );

        if (input) {

            input.addEventListener(
                "input",
                filterPlanningKaryawan
            );

        }

        addPlanningSearchStyle();

    }


    function addPlanningSearchStyle() {

        if (planningEl("planningSearchStyle")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "planningSearchStyle";

        style.textContent = `
            .planning-search-wrapper {
                margin-bottom: 12px;
            }

            .planning-search-input {
                width: 100%;
                box-sizing: border-box;
                padding: 11px 13px;
                border: 1px solid #ddd;
                border-radius: 9px;
                outline: none;
                font-size: 14px;
            }

            .planning-search-input:focus {
                border-color: #d71920;
                box-shadow:
                    0 0 0 3px rgba(215,25,32,.08);
            }

            .planning-search-empty {
                padding: 18px;
                text-align: center;
                color: #888;
                font-size: 13px;
            }
        `;

        document.head.appendChild(style);

    }


    function filterPlanningKaryawan() {

        const input = planningEl(
            "planningSearchKaryawan"
        );

        const container = planningEl(
            "planningKaryawanList"
        );

        if (!input || !container) {
            return;
        }

        const keyword = normalizePlanningSearch(
            input.value
        );

        const items = container.querySelectorAll(
            ".planning-karyawan-item"
        );

        let visible = 0;

        items.forEach(function (item) {

            const searchText =
                normalizePlanningSearch(
                    item.dataset.search || ""
                );

            const match =
                !keyword ||
                searchText.includes(keyword);

            item.style.display =
                match ? "flex" : "none";

            if (match) {
                visible++;
            }

        });

        let empty = container.querySelector(
            ".planning-search-empty"
        );

        if (empty) {
            empty.remove();
        }

        if (items.length && visible === 0) {

            empty = document.createElement("div");

            empty.className =
                "planning-search-empty";

            empty.textContent =
                "Karyawan tidak ditemukan.";

            container.appendChild(empty);
        }

    }


    /* =========================================================
    RENDER KARYAWAN
    ========================================================= */

    function renderPlanningKaryawan() {

        const container = planningEl(
            "planningKaryawanList"
        );

        if (!container) {
            return;
        }

        const activeEmployees =
            sortPlanningKaryawan(
                getKaryawanAktif()
            );

        container.innerHTML = "";

        if (!activeEmployees.length) {

            container.innerHTML = `
                <div class="planning-search-empty">
                    Belum ada karyawan aktif.
                </div>
            `;

            createPlanningSearch();

            return;
        }

        const fragment =
            document.createDocumentFragment();

        activeEmployees.forEach(function (item, index) {

            const id =
                getPlanningKaryawanId(item);

            const nama =
                getPlanningKaryawanNama(item);

            if (!id && !nama) {
                return;
            }

            const label =
                document.createElement("label");

            label.className =
                "planning-karyawan-item";

            const searchText =
                getPlanningKaryawanSearchText(item);

            label.innerHTML = `
                <input
                    type="checkbox"
                    id="planning-karyawan-${index}"
                    data-id="${escapePlanningHTML(id)}"
                    data-nama="${escapePlanningHTML(nama)}"
                    data-search="${escapePlanningHTML(searchText)}"
                >

                <div class="planning-karyawan-info">
                    <strong>
                        ${escapePlanningHTML(nama || "-")}
                    </strong>

                    <span>
                        ${escapePlanningHTML(id || "-")}
                    </span>
                </div>
            `;

            const checkbox =
                label.querySelector(
                    "input[type='checkbox']"
                );

            if (checkbox) {

                checkbox.addEventListener(
                    "change",
                    updateJumlahKaryawanPlanning
                );

            }

            fragment.appendChild(label);

        });

        container.appendChild(fragment);

        createPlanningSearch();

        updateJumlahKaryawanPlanning();

    }


    /* =========================================================
    COUNTER KARYAWAN
    ========================================================= */

    function updateJumlahKaryawanPlanning() {

        const counter = planningEl(
            "jumlahKaryawanPlanning"
        );

        if (!counter) {
            return;
        }

        const total =
            document.querySelectorAll(
                "#planningKaryawanList input[type='checkbox']:checked"
            ).length;

        counter.textContent =
            `${total} karyawan dipilih`;

    }


    /* =========================================================
    SELECT ALL
    ========================================================= */

    function pilihSemuaKaryawanPlanning() {

        document
            .querySelectorAll(
                "#planningKaryawanList input[type='checkbox']"
            )
            .forEach(function (checkbox) {

                checkbox.checked = true;

            });

        updateJumlahKaryawanPlanning();

    }


    /* =========================================================
    DESELECT ALL
    ========================================================= */

    function batalSemuaKaryawanPlanning() {

        document
            .querySelectorAll(
                "#planningKaryawanList input[type='checkbox']"
            )
            .forEach(function (checkbox) {

                checkbox.checked = false;

            });

        updateJumlahKaryawanPlanning();

    }


    /* =========================================================
    GET SELECTED
    ========================================================= */

    function getSelectedPlanningKaryawan() {

        return Array.from(
            document.querySelectorAll(
                "#planningKaryawanList input[type='checkbox']:checked"
            )
        )
            .map(function (checkbox) {

                return {
                    id: String(
                        checkbox.dataset.id || ""
                    ).trim(),

                    nama: String(
                        checkbox.dataset.nama || ""
                    ).trim()
                };

            })
            .filter(function (item) {

                return item.id || item.nama;

            });

    }


    /* =========================================================
    DURASI
    ========================================================= */

    function hitungDurasiDariJam(
        jamMulai,
        jamSelesai
    ) {

        if (!jamMulai || !jamSelesai) {
            return 0;
        }

        const parseTime = function (time) {

            const parts = String(time).split(":");

            const hour = Number(parts[0]);

            const minute = Number(parts[1]);

            if (
                !Number.isFinite(hour) ||
                !Number.isFinite(minute)
            ) {
                return NaN;
            }

            return (
                hour * 60 +
                minute
            );

        };

        const start = parseTime(jamMulai);

        let end = parseTime(jamSelesai);

        if (
            !Number.isFinite(start) ||
            !Number.isFinite(end)
        ) {
            return 0;
        }

        if (end <= start) {
            end += 1440;
        }

        return end - start;

    }


    function hitungDurasiPlanning() {

        const mulai =
            planningEl("jamMulai");

        const selesai =
            planningEl("jamSelesai");

        const durasi =
            planningEl("durasiPlanning");

        if (!mulai || !selesai || !durasi) {
            return;
        }

        const total =
            hitungDurasiDariJam(
                mulai.value,
                selesai.value
            );

        durasi.value =
            formatDurasiPlanning(total);

    }


    function getDurasiMenitPlanning() {

        const mulai =
            planningEl("jamMulai");

        const selesai =
            planningEl("jamSelesai");

        if (!mulai || !selesai) {
            return 0;
        }

        return hitungDurasiDariJam(
            mulai.value,
            selesai.value
        );

    }


    /* =========================================================
    FORMAT DURASI
    ========================================================= */

    function formatDurasiPlanning(menit) {

        const total = Number(menit);

        if (
            !Number.isFinite(total) ||
            total <= 0
        ) {
            return "-";
        }

        const jam = total / 60;

        return `${Number.isInteger(jam)
            ? jam
            : Number(jam.toFixed(1))
        } Jam`;

    }


    /* =========================================================
    FORMAT TANGGAL
    ========================================================= */

    function formatTanggalPlanning(tanggal) {

        if (!tanggal) {
            return "-";
        }

        const parts =
            String(tanggal).split("-");

        if (parts.length !== 3) {
            return tanggal;
        }

        return `${parts[2]}-${parts[1]}-${parts[0]}`;

    }


    /* =========================================================
    GENERATE ID
    ========================================================= */

    function generatePlanningId() {

        const tanggal =
            planningEl("tanggal")?.value ||
            new Date()
                .toISOString()
                .split("T")[0];

        const datePart =
            tanggal.replace(/-/g, "");

        const random =
            Date.now()
                .toString()
                .slice(-6);

        return `PLN-${datePart}-${random}`;

    }


    /* =========================================================
    SIMPAN DATA PLANNING
    ========================================================= */

    async function simpanPlanningCRUD() {

        if (
            typeof simpanPlanningSupabase ===
            "function"
        ) {

            return simpanPlanningSupabase();

        }

        if (typeof simpanData === "function") {
            return simpanData();
        }

        return true;

    }


    /* =========================================================
    BUAT PLANNING
    ========================================================= */

    async function buatPlanning() {

        if (planningCRUDLoading) {
            return;
        }

        const tanggal =
            planningEl("tanggal");

        const jamMulai =
            planningEl("jamMulai");

        const jamSelesai =
            planningEl("jamSelesai");

        const keterangan =
            planningEl("keterangan");

        const button =
            planningEl("btnBuatPlanning");

        if (!tanggal?.value) {

            alert("Tanggal wajib diisi.");

            tanggal?.focus();

            return;
        }

        if (!jamMulai?.value) {

            alert("Jam mulai wajib diisi.");

            jamMulai?.focus();

            return;
        }

        if (!jamSelesai?.value) {

            alert("Jam selesai wajib diisi.");

            jamSelesai?.focus();

            return;
        }

        const selected =
            getSelectedPlanningKaryawan();

        if (!selected.length) {

            alert(
                "Pilih minimal satu karyawan."
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

        const idPlanning =
            generatePlanningId();

        const dataBaru = {

            id: idPlanning,

            idPlanning: idPlanning,

            tanggal:
                tanggal.value,

            jamMulai:
                jamMulai.value,

            jamSelesai:
                jamSelesai.value,

            durasi:
                formatDurasiPlanning(
                    durasiMenit
                ),

            durasiMenit,

            keterangan:
                keterangan?.value.trim() || "",

            karyawan:
                selected,

            createdAt:
                new Date().toISOString()

        };

        if (!Array.isArray(planning)) {
            planning = [];
        }

        planningCRUDLoading = true;

        lockPlanningButton(button);

        showPlanningLoading(
            "Menyimpan planning..."
        );

        planning.push(dataBaru);

        try {

            const result =
                await simpanPlanningCRUD();

            if (result === false) {
                throw new Error(
                    "Database gagal menyimpan planning."
                );
            }

            renderPlanning();

            if (
                typeof updateDashboard === "function"
            ) {
                updateDashboard();
            }

            if (
                typeof updateKaryawanDropdown ===
                "function"
            ) {
                updateKaryawanDropdown();
            }

            closePlanningModal();

            showPlanningToast(
                "success",
                "Planning berhasil dibuat",
                `${selected.length} karyawan berhasil ditambahkan.`
            );

        } catch (error) {

            console.error(
                "Gagal membuat planning:",
                error
            );

            const index =
                planning.indexOf(dataBaru);

            if (index !== -1) {
                planning.splice(index, 1);
            }

            showPlanningToast(
                "error",
                "Planning gagal disimpan",
                "Data dikembalikan karena penyimpanan gagal."
            );

        } finally {

            hidePlanningLoading();

            unlockPlanningButton(button);

            planningCRUDLoading = false;

        }

    }


    /* =========================================================
    RENDER PLANNING
    ========================================================= */

    function renderPlanning() {

        const tbody =
            planningEl("planningTable");

        if (!tbody) {
            return;
        }

        tbody.innerHTML = "";

        let data =
            Array.isArray(planning)
                ? [...planning]
                : [];

        const filterTanggal =
            planningEl("filterTanggal")?.value || "";

        const filterKaryawan =
            planningEl("filterKaryawan")?.value || "";

        if (filterTanggal) {

            data = data.filter(function (item) {

                return String(
                    item.tanggal || ""
                ) === String(filterTanggal);

            });

        }

        if (filterKaryawan) {

            const target =
                String(filterKaryawan);

            data = data.filter(function (item) {

                return Array.isArray(item.karyawan) &&
                    item.karyawan.some(function (k) {

                        return String(
                            k.id ||
                            k.idKaryawan ||
                            k.nik ||
                            k.NIK ||
                            k.NIB ||
                            ""
                        ) === target;

                    });

            });

        }

        data.reverse();

        if (!data.length) {

            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        style="
                            text-align:center;
                            padding:25px;
                            color:#888;
                        "
                    >
                        Belum ada planning.
                    </td>
                </tr>
            `;

            const jumlah =
                planningEl("jumlahPlanningText");

            if (jumlah) {
                jumlah.textContent =
                    "0 Planning";
            }

            return;
        }

        const fragment =
            document.createDocumentFragment();

        data.forEach(function (item, index) {

            const id =
                getPlanningId(item);

            const namaKaryawan =
                Array.isArray(item.karyawan)
                    ? item.karyawan
                        .map(function (k) {
                            return (
                                k.nama ||
                                k.namaKaryawan ||
                                "-"
                            );
                        })
                        .join(", ")
                    : "-";

            const tr =
                document.createElement("tr");

            tr.innerHTML = `
                <td>${index + 1}</td>

                <td>
                    ${escapePlanningHTML(id)}
                </td>

                <td>
                    ${escapePlanningHTML(
                        formatTanggalPlanning(
                            item.tanggal
                        )
                    )}
                </td>

                <td>
                    ${escapePlanningHTML(
                        namaKaryawan
                    )}
                </td>

                <td>
                    ${escapePlanningHTML(
                        item.jamMulai || "-"
                    )}
                    -
                    ${escapePlanningHTML(
                        item.jamSelesai || "-"
                    )}
                </td>

                <td>
                    ${escapePlanningHTML(
                        item.durasi ||
                        formatDurasiPlanning(
                            item.durasiMenit
                        )
                    )}
                </td>

                <td>
                    ${escapePlanningHTML(
                        item.keterangan || "-"
                    )}
                </td>

                <td>
                    <div style="
                        display:flex;
                        gap:6px;
                        flex-wrap:wrap;
                    ">

                       <div class="planning-action-buttons">

    <div class="planning-action-buttons">

    <button
        type="button"
        class="planning-btn planning-btn-preview"
        data-action="preview"
        data-id="${escapePlanningHTML(id)}"
    >
        👁 Preview
    </button>

    <button
        type="button"
        class="planning-btn planning-btn-cetak"
        data-action="cetak"
        data-id="${escapePlanningHTML(id)}"
    >
        🖨 Cetak
    </button>

    <button
        type="button"
        class="planning-btn planning-btn-hapus"
        data-action="hapus"
        data-id="${escapePlanningHTML(id)}"
    >
        🗑 Hapus
    </button>

</div>

</div>

                    </div>
                </td>
            `;

            fragment.appendChild(tr);

        });

        tbody.appendChild(fragment);

        const jumlah =
            planningEl("jumlahPlanningText");

        if (jumlah) {
            jumlah.textContent =
                `${data.length} Planning`;
        }

        if (!tbody.dataset.planningDelegation) {

            tbody.addEventListener(
                "click",
                function (event) {

                    const button =
                        event.target.closest(
                            "[data-action]"
                        );

                    if (!button) {
                        return;
                    }

                    const action =
                        button.dataset.action;

                    const id =
                        button.dataset.id;

                    if (action === "preview") {
                        previewPlanning(id);
                    }

                    if (action === "cetak") {
                        cetakPlanningPDF(id);
                    }

                    if (action === "hapus") {
                        hapusPlanning(id);
                    }

                }
            );

            tbody.dataset.planningDelegation =
                "true";
        }

    }


    /* =========================================================
    PREVIEW STYLE
    ========================================================= */

    function addPreviewStyle() {

        if (planningEl("planningPreviewStyle")) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "planningPreviewStyle";

        style.textContent = `
            .planning-preview-modal {
                position:fixed;
                inset:0;
                z-index:99998;
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
                z-index:2;
                width:min(900px,94vw);
                max-height:92vh;
                overflow:auto;
                background:#fff;
                border-radius:16px;
                box-shadow:0 20px 70px rgba(0,0,0,.25);
            }

            .planning-preview-header {
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:15px;
                padding:18px 22px;
                background:#d71920;
                color:#fff;
                border-radius:16px 16px 0 0;
            }

            .planning-preview-header h2 {
                margin:0;
                font-size:18px;
            }

            .planning-preview-close {
                border:0;
                background:transparent;
                color:#fff;
                font-size:26px;
                cursor:pointer;
            }

            .planning-preview-form {
                display:grid;
                grid-template-columns:repeat(3,1fr);
                gap:16px;
                padding:20px;
            }

            .planning-preview-field {
                display:flex;
                flex-direction:column;
                gap:6px;
            }

            .planning-preview-full {
                grid-column:1/-1;
            }

            .planning-preview-field label {
                font-size:12px;
                font-weight:700;
                color:#555;
            }

            .planning-preview-field input,
            .planning-preview-field textarea {
                width:100%;
                box-sizing:border-box;
                padding:10px 11px;
                border:1px solid #ddd;
                border-radius:8px;
                outline:none;
            }

            .planning-preview-field input:focus,
            .planning-preview-field textarea:focus {
                border-color:#d71920;
            }

            .planning-preview-section {
                padding:0 20px 20px;
            }

            .planning-preview-section-header {
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:12px;
                margin-bottom:12px;
            }

            .planning-preview-section-header h3 {
                margin:0;
                font-size:15px;
            }

            .planning-btn-add {
                border:0;
                background:#111;
                color:#fff;
                padding:9px 13px;
                border-radius:8px;
                cursor:pointer;
            }

            .planning-preview-search {
                position:relative;
                margin-bottom:10px;
            }

            .planning-preview-search input {
                width:100%;
                box-sizing:border-box;
                padding:11px 13px;
                border:1px solid #ddd;
                border-radius:8px;
                outline:none;
            }

            .planning-preview-search-result {
                position:absolute;
                left:0;
                right:0;
                top:calc(100% + 4px);
                z-index:20;
                display:none;
                max-height:220px;
                overflow:auto;
                background:#fff;
                border:1px solid #ddd;
                border-radius:8px;
                box-shadow:0 12px 30px rgba(0,0,0,.15);
            }

            .planning-preview-search-result.active {
                display:block;
            }

            .planning-preview-search-item {
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:10px;
                padding:10px 12px;
                border-bottom:1px solid #eee;
            }

            .planning-preview-search-item:hover {
                background:#fafafa;
            }

            .planning-preview-search-info {
                min-width:0;
                flex:1;
            }

            .planning-preview-search-name {
                font-weight:700;
                font-size:13px;
            }

            .planning-preview-search-id {
                color:#888;
                font-size:11px;
                margin-top:3px;
            }

            .planning-preview-search-add {
                border:0;
                background:#d71920;
                color:#fff;
                padding:7px 9px;
                border-radius:7px;
                cursor:pointer;
            }

            .planning-preview-search-empty {
                padding:15px;
                text-align:center;
                color:#888;
                font-size:13px;
            }

            .planning-preview-karyawan-list {
                display:flex;
                flex-direction:column;
                gap:7px;
                max-height:300px;
                overflow:auto;
            }

            .planning-preview-karyawan-row {
                display:grid;
                grid-template-columns:38px 1fr 180px 42px;
                gap:8px;
                align-items:center;
                padding:8px;
                border:1px solid #eee;
                border-radius:8px;
                background:#fafafa;
            }

            .planning-preview-number {
                text-align:center;
                font-weight:700;
                color:#777;
            }

            .planning-preview-karyawan-row input {
                width:100%;
                box-sizing:border-box;
                padding:8px 9px;
                border:1px solid #ddd;
                border-radius:7px;
                outline:none;
            }

            .planning-btn-delete {
                width:34px;
                height:34px;
                border:0;
                border-radius:7px;
                background:#fff0f1;
                color:#d71920;
                cursor:pointer;
            }

            .planning-preview-actions {
                display:flex;
                justify-content:flex-end;
                gap:8px;
                padding:0 20px 20px;
            }

            .planning-preview-actions button {
                border:0;
                padding:10px 16px;
                border-radius:8px;
                cursor:pointer;
            }

            .planning-preview-cancel {
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

                .planning-preview-karyawan-row {
                    grid-template-columns:32px 1fr 38px;
                }

                .preview-id-input {
                    grid-column:2;
                }

                .planning-preview-actions {
                    flex-direction:column;
                }

                .planning-preview-actions button {
                    width:100%;
                }

            }
        `;

        document.head.appendChild(style);

    }


    /* =========================================================
    CREATE PREVIEW MODAL
    ========================================================= */

    function buatModalPreviewPlanning() {

        let modal =
            planningEl("planningPreviewModal");

        if (modal) {
            return modal;
        }

        modal =
            document.createElement("div");

        modal.id =
            "planningPreviewModal";

        modal.className =
            "planning-preview-modal";

        modal.innerHTML = `
            <div
                class="planning-preview-overlay"
                data-preview-close
            ></div>

            <div class="planning-preview-box">
                <div class="planning-preview-header">
                    <div>
                        <div style="font-size:11px;">
                            PREVIEW PLANNING
                        </div>
                        <h2>Detail Lembur</h2>
                    </div>

                    <button
                        type="button"
                        class="planning-preview-close"
                        data-preview-close
                    >
                        ×
                    </button>
                </div>

                <div id="planningPreviewContent"></div>
            </div>
        `;

        document.body.appendChild(modal);

        addPreviewStyle();

        modal
            .querySelectorAll(
                "[data-preview-close]"
            )
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    closePreviewPlanning
                );

            });

        return modal;

    }


    /* =========================================================
    PREVIEW
    ========================================================= */

    function previewPlanning(idPlanning) {

        if (planningCRUDLoading) {
            return;
        }

        const item =
            findPlanningById(idPlanning);

        if (!item) {

            alert(
                "Data planning tidak ditemukan."
            );

            return;
        }

        const modal =
            buatModalPreviewPlanning();

        const content =
            planningEl(
                "planningPreviewContent"
            );

        if (!content) {
            return;
        }

        PlanningState.previewId =
            getPlanningId(item);

        modal.dataset.idPlanning =
            PlanningState.previewId;

        const daftar =
            Array.isArray(item.karyawan)
                ? item.karyawan
                    .map(function (k) {
                        return {
                            id:
                                k.id ??
                                k.idKaryawan ??
                                k.nik ??
                                k.NIK ??
                                k.NIB ??
                                "",

                            nama:
                                k.nama ??
                                k.namaKaryawan ??
                                ""
                        };
                    })
                : [];

        content.innerHTML = `
            <div class="planning-preview-form">

                <div class="planning-preview-field">
                    <label>ID Planning</label>
                    <input
                        value="${escapePlanningHTML(
                            getPlanningId(item)
                        )}"
                        readonly
                    >
                </div>

                <div class="planning-preview-field">
                    <label>Tanggal</label>
                    <input
                        type="date"
                        id="previewTanggal"
                        value="${escapePlanningHTML(
                            item.tanggal || ""
                        )}"
                    >
                </div>

                <div class="planning-preview-field">
                    <label>Durasi</label>
                    <input
                        id="previewDurasi"
                        value="${escapePlanningHTML(
                            item.durasi ||
                            formatDurasiPlanning(
                                item.durasiMenit
                            )
                        )}"
                        readonly
                    >
                </div>

                <div class="planning-preview-field">
                    <label>Jam Mulai</label>
                    <input
                        type="time"
                        id="previewJamMulai"
                        value="${escapePlanningHTML(
                            item.jamMulai || ""
                        )}"
                    >
                </div>

                <div class="planning-preview-field">
                    <label>Jam Selesai</label>
                    <input
                        type="time"
                        id="previewJamSelesai"
                        value="${escapePlanningHTML(
                            item.jamSelesai || ""
                        )}"
                    >
                </div>

                <div class="planning-preview-field">
                    <label>Keterangan</label>
                    <input
                        id="previewKeterangan"
                        value="${escapePlanningHTML(
                            item.keterangan || ""
                        )}"
                    >
                </div>

            </div>

            <div class="planning-preview-section">

                <div class="planning-preview-section-header">

                    <div>
                        <h3>
                            Daftar Karyawan
                        </h3>

                        <small
                            id="previewJumlahKaryawan"
                        >
                            0 karyawan
                        </small>
                    </div>

                    <button
                        type="button"
                        class="planning-btn-add"
                        onclick="tambahKaryawanPreview()"
                    >
                        + Tambah Karyawan
                    </button>

                </div>

                <div class="planning-preview-search">

                    <input
                        type="search"
                        id="previewSearchKaryawan"
                        placeholder="Cari nama, NIK, atau NIB..."
                        autocomplete="off"
                    >

                    <div
                        id="previewSearchResult"
                        class="planning-preview-search-result"
                    ></div>

                </div>

                <div
                    id="previewKaryawanList"
                    class="planning-preview-karyawan-list"
                ></div>

            </div>

            <div class="planning-preview-actions">

                <button
                    type="button"
                    class="planning-preview-cancel"
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
            daftar
        );

        hitungDurasiPreview();

        const search =
            planningEl(
                "previewSearchKaryawan"
            );

        if (search) {

            search.addEventListener(
                "input",
                function () {

                    searchKaryawanPreview(
                        search.value
                    );

                }
            );

        }

        modal.classList.add("active");

        modal.style.display = "flex";

    }


    /* =========================================================
    RENDER PREVIEW KARYAWAN
    ========================================================= */

    function renderPreviewKaryawan(daftar) {

        const container =
            planningEl(
                "previewKaryawanList"
            );

        if (!container) {
            return;
        }

        const data =
            Array.isArray(daftar)
                ? daftar
                    .map(function (item) {

                        return {
                            id: String(
                                item?.id ??
                                item?.idKaryawan ??
                                item?.nik ??
                                item?.NIK ??
                                item?.NIB ??
                                ""
                            ).trim(),

                            nama: String(
                                item?.nama ??
                                item?.namaKaryawan ??
                                ""
                            ).trim()
                        };

                    })
                    .filter(function (item) {

                        return item.id ||
                            item.nama;

                    })
                : [];

        if (!data.length) {

            container.innerHTML = `
                <div class="planning-preview-search-empty">
                    Belum ada karyawan.
                </div>
            `;

            updatePreviewJumlahKaryawan();

            return;
        }

        container.innerHTML =
            data.map(function (item, index) {

                return `
                    <div
                        class="planning-preview-karyawan-row"
                    >

                        <div
                            class="planning-preview-number"
                        >
                            ${index + 1}
                        </div>

                        <input
                            type="text"
                            class="preview-nama-input"
                            value="${escapePlanningHTML(
                                item.nama
                            )}"
                            placeholder="Nama karyawan"
                        >

                        <input
                            type="text"
                            class="preview-id-input"
                            value="${escapePlanningHTML(
                                item.id
                            )}"
                            placeholder="NIK / NIB"
                        >

                        <button
                            type="button"
                            class="planning-btn-delete"
                            onclick="hapusKaryawanPreview(this)"
                        >
                            ×
                        </button>

                    </div>
                `;

            })
            .join("");

        updatePreviewJumlahKaryawan();

    }


    /* =========================================================
    PREVIEW COUNTER
    ========================================================= */

    function updatePreviewJumlahKaryawan() {

        const container =
            planningEl(
                "previewKaryawanList"
            );

        const counter =
            planningEl(
                "previewJumlahKaryawan"
            );

        if (!container || !counter) {
            return;
        }

        const total =
            container.querySelectorAll(
                ".planning-preview-karyawan-row"
            ).length;

        counter.textContent =
            `${total} karyawan`;

    }


    /* =========================================================
    FOCUS SEARCH PREVIEW
    ========================================================= */

    function focusSearchPreview() {

        const search =
            planningEl(
                "previewSearchKaryawan"
            );

        if (!search) {
            return;
        }

        search.focus();

        search.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    /* =========================================================
    SEARCH PREVIEW
    ========================================================= */

    function searchKaryawanPreview(keyword) {

        const result =
            planningEl(
                "previewSearchResult"
            );

        if (!result) {
            return;
        }

        const search =
            normalizePlanningSearch(
                keyword
            );

        if (!search) {

            result.innerHTML = "";

            result.classList.remove(
                "active"
            );

            return;
        }

        const rows =
            Array.from(
                document.querySelectorAll(
                    "#previewKaryawanList .planning-preview-karyawan-row"
                )
            );

        const existingIds =
            new Set();

        rows.forEach(function (row) {

            const input =
                row.querySelector(
                    ".preview-id-input"
                );

            if (!input) {
                return;
            }

            const id =
                normalizePlanningSearch(
                    input.value
                );

            if (id) {
                existingIds.add(id);
            }

        });

        const employees =
            sortPlanningKaryawan(
                getKaryawanAktif()
            );

        const matches =
            employees
                .filter(function (item) {

                    const searchText =
                        getPlanningKaryawanSearchText(
                            item
                        );

                    const identifiers =
                        getPlanningKaryawanIdentifiers(
                            item
                        )
                            .map(
                                normalizePlanningSearch
                            );

                    const duplicate =
                        identifiers.some(
                            function (id) {
                                return existingIds.has(id);
                            }
                        );

                    return (
                        searchText.includes(search) &&
                        !duplicate
                    );

                })
                .slice(0, 20);

        if (!matches.length) {

            result.innerHTML = `
                <div class="planning-preview-search-empty">
                    Karyawan tidak ditemukan
                    atau sudah ada.
                </div>
            `;

            result.classList.add("active");

            return;
        }

        result.innerHTML =
            matches.map(function (item) {

                const id =
                    getPlanningKaryawanId(item);

                const nama =
                    getPlanningKaryawanNama(item);

                return `
                    <div
                        class="planning-preview-search-item"
                    >

                        <div
                            class="planning-preview-search-info"
                        >
                            <div
                                class="planning-preview-search-name"
                            >
                                ${escapePlanningHTML(
                                    nama
                                )}
                            </div>

                            <div
                                class="planning-preview-search-id"
                            >
                                ${escapePlanningHTML(
                                    id || "-"
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            class="planning-preview-search-add"
                            data-add-id="${escapePlanningHTML(
                                id
                            )}"
                            data-add-nama="${escapePlanningHTML(
                                nama
                            )}"
                        >
                            + Tambah
                        </button>

                    </div>
                `;

            })
            .join("");

        result.classList.add("active");

        if (!result.dataset.delegation) {

            result.addEventListener(
                "click",
                function (event) {

                    const button =
                        event.target.closest(
                            "[data-add-id]"
                        );

                    if (!button) {
                        return;
                    }

                    tambahKaryawanDariSearch(
                        button.dataset.addId,
                        button.dataset.addNama
                    );

                }
            );

            result.dataset.delegation =
                "true";
        }

    }


    /* =========================================================
    TAMBAH KARYAWAN DARI SEARCH
    ========================================================= */

    function tambahKaryawanDariSearch(
        id,
        nama
    ) {

        const container =
            planningEl(
                "previewKaryawanList"
            );

        if (!container) {
            return;
        }

        const targetId =
            normalizePlanningSearch(id);

        const rows =
            Array.from(
                container.querySelectorAll(
                    ".planning-preview-karyawan-row"
                )
            );

        const duplicate =
            rows.some(function (row) {

                const input =
                    row.querySelector(
                        ".preview-id-input"
                    );

                return (
                    input &&
                    normalizePlanningSearch(
                        input.value
                    ) === targetId
                );

            });

        if (duplicate) {

            showPlanningToast(
                "warning",
                "Karyawan sudah ada",
                "Karyawan tersebut sudah ada di planning."
            );

            return;
        }

        const dataSaatIni =
            rows.map(function (row) {

                return {

                    id:
                        row.querySelector(
                            ".preview-id-input"
                        )?.value.trim() || "",

                    nama:
                        row.querySelector(
                            ".preview-nama-input"
                        )?.value.trim() || ""

                };

            });

        dataSaatIni.push({
            id: String(id || "").trim(),
            nama: String(nama || "").trim()
        });

        /*
        Sorting berdasarkan NAMA TERBARU.
        Jadi kalau nama diedit, urutannya ikut nama edit.
        */
        dataSaatIni.sort(function (a, b) {

            return String(a.nama)
                .localeCompare(
                    String(b.nama),
                    "id",
                    {
                        sensitivity: "base"
                    }
                );

        });

        renderPreviewKaryawan(
            dataSaatIni
        );

        const search =
            planningEl(
                "previewSearchKaryawan"
            );

        const result =
            planningEl(
                "previewSearchResult"
            );

        if (search) {
            search.value = "";
        }

        if (result) {
            result.innerHTML = "";
            result.classList.remove("active");
        }

    }


    /* =========================================================
    TAMBAH KARYAWAN LAMA
    ========================================================= */

    function tambahKaryawanPreview() {

        focusSearchPreview();

    }


    /* =========================================================
    HAPUS KARYAWAN PREVIEW
    ========================================================= */

    function hapusKaryawanPreview(button) {

        if (planningCRUDLoading) {
            return;
        }

        const row =
            button?.closest(
                ".planning-preview-karyawan-row"
            );

        const container =
            planningEl(
                "previewKaryawanList"
            );

        if (!row || !container) {
            return;
        }

        const rows =
            container.querySelectorAll(
                ".planning-preview-karyawan-row"
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


    /* =========================================================
    UPDATE NOMOR PREVIEW
    ========================================================= */

    function updatePreviewNomor() {

        const container =
            planningEl(
                "previewKaryawanList"
            );

        if (!container) {
            return;
        }

        container
            .querySelectorAll(
                ".planning-preview-karyawan-row"
            )
            .forEach(function (row, index) {

                const nomor =
                    row.querySelector(
                        ".planning-preview-number"
                    );

                if (nomor) {
                    nomor.textContent =
                        index + 1;
                }

            });

    }


    /* =========================================================
    DURASI PREVIEW
    ========================================================= */

    function hitungDurasiPreview() {

        const mulai =
            planningEl(
                "previewJamMulai"
            );

        const selesai =
            planningEl(
                "previewJamSelesai"
            );

        const durasi =
            planningEl(
                "previewDurasi"
            );

        if (!mulai || !selesai || !durasi) {
            return;
        }

        const total =
            hitungDurasiDariJam(
                mulai.value,
                selesai.value
            );

        durasi.value =
            formatDurasiPlanning(total);

    }


    /* =========================================================
    CLOSE PREVIEW
    ========================================================= */

    function closePreviewPlanning() {

        const modal =
            planningEl(
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

        PlanningState.previewId = null;

    }


    /* =========================================================
    SIMPAN EDIT PLANNING
    ========================================================= */

    async function simpanEditPlanning() {

        if (planningCRUDLoading) {
            return;
        }

        const modal =
            planningEl(
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
            planning.findIndex(function (item) {

                return getPlanningId(item) ===
                    String(idPlanning);

            });

        if (index === -1) {

            alert(
                "Planning tidak ditemukan."
            );

            return;
        }

        const tanggal =
            planningEl(
                "previewTanggal"
            );

        const jamMulai =
            planningEl(
                "previewJamMulai"
            );

        const jamSelesai =
            planningEl(
                "previewJamSelesai"
            );

        const keterangan =
            planningEl(
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

        if (!rows.length) {

            alert(
                "Minimal harus ada satu karyawan."
            );

            return;
        }

        const daftarKaryawan = [];

        const idSet = new Set();

        let valid = true;

        rows.forEach(function (row) {

            const nama =
                row.querySelector(
                    ".preview-nama-input"
                )?.value.trim() || "";

            const id =
                row.querySelector(
                    ".preview-id-input"
                )?.value.trim() || "";

            if (!nama) {
                valid = false;
            }

            const normalizedId =
                normalizePlanningSearch(id);

            if (
                normalizedId &&
                idSet.has(normalizedId)
            ) {
                valid = false;
            }

            if (normalizedId) {
                idSet.add(normalizedId);
            }

            daftarKaryawan.push({
                id,
                nama
            });

        });

        if (!valid) {

            alert(
                "Nama karyawan wajib diisi dan NIK/NIB tidak boleh duplikat."
            );

            return;
        }

        /*
        Urutkan berdasarkan nama hasil edit.
        */
        daftarKaryawan.sort(function (a, b) {

            return a.nama.localeCompare(
                b.nama,
                "id",
                {
                    sensitivity: "base"
                }
            );

        });

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

        const button =
            modal.querySelector(
                ".planning-btn-save"
            );

        const dataLama =
            JSON.parse(
                JSON.stringify(
                    planning[index]
                )
            );

        planningCRUDLoading = true;

        lockPlanningButton(button);

        showPlanningLoading(
            "Menyimpan perubahan..."
        );

        try {

            planning[index] = {

                ...planning[index],

                tanggal:
                    tanggal.value,

                jamMulai:
                    jamMulai.value,

                jamSelesai:
                    jamSelesai.value,

                durasi:
                    formatDurasiPlanning(
                        durasiMenit
                    ),

                durasiMenit,

                keterangan:
                    keterangan?.value.trim() || "",

                karyawan:
                    daftarKaryawan

            };

            const result =
                await simpanPlanningCRUD();

            if (result === false) {
                throw new Error(
                    "Database gagal menyimpan perubahan."
                );
            }

            renderPlanning();

            if (
                typeof updateDashboard === "function"
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

            showPlanningToast(
                "success",
                "Perubahan berhasil disimpan",
                "Data planning dan daftar karyawan berhasil diperbarui."
            );

        } catch (error) {

            console.error(
                "Gagal menyimpan perubahan:",
                error
            );

            planning[index] =
                dataLama;

            showPlanningToast(
                "error",
                "Perubahan gagal disimpan",
                "Data planning dikembalikan ke kondisi sebelumnya."
            );

        } finally {

            hidePlanningLoading();

            unlockPlanningButton(button);

            planningCRUDLoading = false;

        }
        

    }


    /* =========================================================
    HAPUS PLANNING
    ========================================================= */

    async function hapusPlanning(idPlanning) {

        if (planningCRUDLoading) {
            return;
        }

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
            planning.findIndex(function (item) {

                return getPlanningId(item) ===
                    String(idPlanning);

            });

        if (index === -1) {

            alert(
                "Data planning tidak ditemukan."
            );

            return;
        }

        const dataLama =
            planning[index];

        planningCRUDLoading = true;

        showPlanningLoading(
            "Menghapus planning..."
        );

        planning.splice(
            index,
            1
        );

        try {

            const result =
                await simpanPlanningCRUD();

            if (result === false) {
                throw new Error(
                    "Database gagal menghapus planning."
                );
            }

            renderPlanning();

            if (
                typeof updateDashboard === "function"
            ) {
                updateDashboard();
            }

            showPlanningToast(
                "success",
                "Planning berhasil dihapus",
                "Data planning telah berhasil dihapus."
            );

        } catch (error) {

            console.error(
                "Gagal menghapus planning:",
                error
            );

            planning.splice(
                index,
                0,
                dataLama
            );

            showPlanningToast(
                "error",
                "Planning gagal dihapus",
                "Data dikembalikan karena proses penghapusan gagal."
            );

        } finally {

            hidePlanningLoading();

            planningCRUDLoading = false;

        }

    }


    /* =========================================================
    RESET FILTER
    ========================================================= */

    function resetFilter() {

        const tanggal =
            planningEl(
                "filterTanggal"
            );

        const karyawanFilter =
            planningEl(
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


    /* =========================================================
    TOAST
    ========================================================= */

    function initPlanningToast() {

        if (planningEl(
            "planningToastContainer"
        )) {
            return;
        }

        const container =
            document.createElement("div");

        container.id =
            "planningToastContainer";

        container.innerHTML = `
            <div
                id="planningToast"
                class="planning-toast"
            >

                <div
                    id="planningToastIcon"
                    class="planning-toast-icon"
                >
                    ✓
                </div>

                <div
                    class="planning-toast-content"
                >

                    <div
                        id="planningToastTitle"
                        class="planning-toast-title"
                    >
                        Berhasil
                    </div>

                    <div
                        id="planningToastMessage"
                        class="planning-toast-message"
                    ></div>

                </div>

                <button
                    type="button"
                    id="planningToastClose"
                    class="planning-toast-close"
                >
                    ×
                </button>

            </div>
        `;

        const style =
            document.createElement("style");

        style.id =
            "planningToastStyle";

        style.textContent = `
            #planningToastContainer {
                position:fixed;
                top:24px;
                right:24px;
                z-index:1000000;
                pointer-events:none;
            }

            .planning-toast {
                min-width:320px;
                max-width:420px;
                display:flex;
                align-items:center;
                gap:13px;
                padding:14px 15px;
                background:#fff;
                border:1px solid #e8e8e8;
                border-radius:13px;
                box-shadow:
                    0 15px 45px rgba(0,0,0,.16);
                transform:translateX(120%);
                opacity:0;
                transition:
                    transform .35s ease,
                    opacity .35s ease;
                pointer-events:auto;
            }

            .planning-toast.show {
                transform:translateX(0);
                opacity:1;
            }

            .planning-toast-icon {
                width:38px;
                height:38px;
                min-width:38px;
                display:flex;
                align-items:center;
                justify-content:center;
                border-radius:50%;
                background:#e9f8ef;
                color:#1d9b52;
                font-size:19px;
                font-weight:800;
            }

            .planning-toast-content {
                flex:1;
                min-width:0;
            }

            .planning-toast-title {
                font-size:14px;
                font-weight:750;
                color:#222;
                line-height:1.3;
            }

            .planning-toast-message {
                margin-top:3px;
                font-size:12px;
                line-height:1.45;
                color:#777;
            }

            .planning-toast-close {
                width:28px;
                height:28px;
                border:0;
                background:transparent;
                color:#999;
                font-size:20px;
                line-height:1;
                border-radius:6px;
                cursor:pointer;
            }

            .planning-toast-close:hover {
                background:#f4f4f4;
                color:#333;
            }

            .planning-toast.success
            .planning-toast-icon {
                background:#e9f8ef;
                color:#1d9b52;
            }

            .planning-toast.error
            .planning-toast-icon {
                background:#fff0f1;
                color:#d71920;
            }

            .planning-toast.warning
            .planning-toast-icon {
                background:#fff7e6;
                color:#d98a00;
            }

            @media(max-width:600px) {

                #planningToastContainer {
                    top:15px;
                    left:15px;
                    right:15px;
                }

                .planning-toast {
                    min-width:0;
                    width:100%;
                    max-width:none;
                }

            }
        `;

        document.head.appendChild(style);

        document.body.appendChild(container);

        const close =
            planningEl(
                "planningToastClose"
            );

        if (close) {

            close.addEventListener(
                "click",
                hidePlanningToast
            );

        }

    }


    /* =========================================================
    SHOW TOAST
    ========================================================= */

    function showPlanningToast(
        type = "success",
        title = "Berhasil",
        message = "",
        duration = 3500
    ) {

        initPlanningToast();

        const toast =
            planningEl(
                "planningToast"
            );

        const icon =
            planningEl(
                "planningToastIcon"
            );

        const titleElement =
            planningEl(
                "planningToastTitle"
            );

        const messageElement =
            planningEl(
                "planningToastMessage"
            );

        if (
            !toast ||
            !icon ||
            !titleElement ||
            !messageElement
        ) {
            return;
        }

        clearTimeout(
            PlanningState.toastTimer
        );

        toast.classList.remove(
            "success",
            "error",
            "warning",
            "show"
        );

        const icons = {
            success: "✓",
            error: "×",
            warning: "!"
        };

        icon.textContent =
            icons[type] || "✓";

        titleElement.textContent =
            title;

        messageElement.textContent =
            message;

        toast.classList.add(
            type
        );

        requestAnimationFrame(function () {

            toast.classList.add(
                "show"
            );

        });

        PlanningState.toastTimer =
            setTimeout(
                hidePlanningToast,
                duration
            );

    }


    /* =========================================================
    HIDE TOAST
    ========================================================= */

    function hidePlanningToast() {

        const toast =
            planningEl(
                "planningToast"
            );

        if (!toast) {
            return;
        }

        toast.classList.remove(
            "show"
        );

    }


    /* =========================================================
    COMPATIBILITY
    Fungsi lama tetap tersedia
    ========================================================= */

    function tampilkanNotifPlanning(
        tipe,
        judul,
        pesan
    ) {

        showPlanningToast(
            tipe,
            judul,
            pesan
        );

    }


    function planningToastSuccess(
        title,
        message
    ) {

        showPlanningToast(
            "success",
            title,
            message
        );

    }


    /* =========================================================
    CETAK PDF
    ========================================================= */

   /* =========================================================
   CETAK PLANNING PDF
   ========================================================= */

async function cetakPlanningPDF(idPlanning) {

    if (planningCRUDLoading) {
        return;
    }


    const item =
        findPlanningById(idPlanning);


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


    if (
        typeof window.jspdf.jsPDF !==
        "function"
    ) {

        alert(
            "jsPDF tidak dapat digunakan."
        );

        return;

    }


    planningCRUDLoading = true;


    showPlanningLoading(
        "Menyiapkan PDF..."
    );


    try {

        /* =====================================================
           PRELOAD LOGO
        ===================================================== */

        showPlanningLoading(
            "Memuat logo LINFOX..."
        );


        const logoLinfox =
            await preloadLogoLinfox();


        /* =====================================================
           INIT JSPDF
        ===================================================== */

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


        /* =====================================================
           DATA
        ===================================================== */

        const id =
            getPlanningId(item) ||
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


        /* =====================================================
           COLOR PALETTE
        ===================================================== */

        const KUNING = [
            247,
            244,
            15
        ];


        const KUNING_SOFT = [
            255,
            253,
            220
        ];


        const HITAM = [
            28,
            28,
            28
        ];


        const ABU_GELAP = [
            90,
            90,
            90
        ];


        const ABU = [
            244,
            244,
            244
        ];


        const ABU_BORDER = [
            220,
            220,
            220
        ];


        const PUTIH = [
            255,
            255,
            255
        ];


        /* =====================================================
           HEADER
        ===================================================== */

        doc.setFillColor(
            ...KUNING
        );


        doc.rect(
            0,
            0,
            210,
            34,
            "F"
        );


        /* =====================================================
           LOGO LINFOX
        ===================================================== */

        doc.addImage(

            logoLinfox,

            "PNG",

            20,
            7,

            30,
            20

        );


        /* =====================================================
           COMPANY
        ===================================================== */

        doc.setTextColor(
            ...HITAM
        );


        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.setFontSize(13);


        doc.text(
            "PT LINFOX LOGISTICS INDONESIA",
            55,
            14
        );


        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.setFontSize(7.5);


        doc.setTextColor(
            ...ABU_GELAP
        );


        doc.text(
            "LOGISTICS & SUPPLY CHAIN MANAGEMENT",
            55,
            21
        );


        /* =====================================================
           DOCUMENT LABEL
        ===================================================== */

        doc.setFillColor(
            ...HITAM
        );


        doc.roundedRect(
            153,
            7,
            37,
            20,
            3,
            3,
            "F"
        );


        doc.setTextColor(
            ...KUNING
        );


        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.setFontSize(8);


        doc.text(
            "DOKUMEN",
            171.5,
            14,
            {
                align:
                    "center"
            }
        );


        doc.setTextColor(
            ...PUTIH
        );


        doc.setFontSize(7);


        doc.text(
            "LEMBUR",
            171.5,
            21,
            {
                align:
                    "center"
            }
        );


        /* =====================================================
           TITLE
        ===================================================== */

        doc.setTextColor(
            ...HITAM
        );


        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.setFontSize(17);


        doc.text(
            "SURAT PERINTAH LEMBUR",
            105,
            49,
            {
                align:
                    "center"
            }
        );


        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.setFontSize(8);


        doc.setTextColor(
            ...ABU_GELAP
        );


        doc.text(
            `Planning ID : ${id}`,
            105,
            56,
            {
                align:
                    "center"
            }
        );


        /* =====================================================
           ACCENT LINE
        ===================================================== */

        doc.setDrawColor(
            ...KUNING
        );


        doc.setLineWidth(1.5);


        doc.line(
            76,
            61,
            134,
            61
        );


        /* =====================================================
           INFORMASI LEMBUR
        ===================================================== */

        doc.setTextColor(
            ...HITAM
        );


        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.setFontSize(10);


        doc.text(
            "INFORMASI LEMBUR",
            20,
            72
        );


        doc.setDrawColor(
            ...KUNING
        );


        doc.setLineWidth(1);


        doc.line(
            20,
            76,
            190,
            76
        );


        /* =====================================================
           INFORMATION CARD
        ===================================================== */

        doc.setFillColor(
            ...ABU
        );


        doc.roundedRect(
            20,
            82,
            170,
            48,
            3,
            3,
            "F"
        );


        /* LEFT ACCENT */

        doc.setFillColor(
            ...KUNING
        );


        doc.roundedRect(
            20,
            82,
            4,
            48,
            2,
            2,
            "F"
        );


        /* =====================================================
           INFO FUNCTION
        ===================================================== */

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


            doc.setFontSize(8);


            doc.setTextColor(
                ...ABU_GELAP
            );


            doc.text(
                label,
                x,
                y
            );


            doc.setTextColor(
                ...HITAM
            );


            doc.setFont(
                "helvetica",
                "normal"
            );


            doc.setFontSize(8.5);


            doc.text(
                String(value),
                x + 34,
                y
            );

        }


        info(
            "ID Planning",
            id,
            29,
            94
        );


        info(
            "Tanggal",
            tanggalTampil,
            29,
            105
        );


        info(
            "Jam Mulai",
            jamMulai,
            29,
            116
        );


        info(
            "Jam Selesai",
            jamSelesai,
            108,
            94
        );


        info(
            "Durasi",
            durasi,
            108,
            105
        );


        info(
            "Keterangan",
            keterangan,
            108,
            116
        );


        /* =====================================================
           DAFTAR KARYAWAN
        ===================================================== */

        doc.setTextColor(
            ...HITAM
        );


        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.setFontSize(10);


        doc.text(
            "DAFTAR KARYAWAN",
            20,
            145
        );


        doc.setDrawColor(
            ...KUNING
        );


        doc.setLineWidth(1);


        doc.line(
            20,
            149,
            190,
            149
        );


        /* =====================================================
           CHECK AUTOTABLE
        ===================================================== */

        if (
            typeof doc.autoTable !==
            "function"
        ) {

            throw new Error(
                "Plugin jsPDF AutoTable belum termuat."
            );

        }


        /* =====================================================
           TABLE DATA
        ===================================================== */

        const tableData =
            daftarKaryawan.map(
                function (
                    dataKaryawan,
                    index
                ) {

                    return [

                        index + 1,

                        dataKaryawan.nama ||
                        dataKaryawan.namaKaryawan ||
                        "-",

                        dataKaryawan.nik ||
                        dataKaryawan.NIK ||
                        dataKaryawan.NIB ||
                        dataKaryawan.id ||
                        "-"

                    ];

                }
            );


        /* =====================================================
           TABLE
        ===================================================== */

        doc.autoTable({

            startY:
                154,


            head: [[

                "No",

                "Nama Karyawan",

                "NIK / NIB"

            ]],


            body:
                tableData,


            theme:
                "grid",


            styles: {

                font:
                    "helvetica",

                fontSize:
                    8.5,

                cellPadding:
                    3.2,

                textColor:
                    HITAM,

                lineColor:
                    ABU_BORDER,

                lineWidth:
                    0.2,

                valign:
                    "middle"

            },


            headStyles: {

                fillColor:
                    HITAM,

                textColor:
                    KUNING,

                fontStyle:
                    "bold",

                halign:
                    "center",

                cellPadding:
                    3.5

            },


            columnStyles: {

                0: {

                    cellWidth:
                        16,

                    halign:
                        "center"

                },


                1: {

                    cellWidth:
                        94

                },


                2: {

                    cellWidth:
                        60,

                    halign:
                        "center"

                }

            },


            alternateRowStyles: {

                fillColor: [

                    252,

                    252,

                    252

                ]

            }

        });


        /* =====================================================
           TOTAL KARYAWAN
        ===================================================== */

        let posisiY =

            doc.lastAutoTable

                ? doc.lastAutoTable.finalY + 10

                : 180;


        if (
            posisiY > 250
        ) {

            doc.addPage();

            posisiY = 25;

        }


        doc.setFillColor(
            ...KUNING_SOFT
        );


        doc.setDrawColor(
            ...KUNING
        );


        doc.setLineWidth(
            0.5
        );


        doc.roundedRect(
            20,
            posisiY - 6,
            170,
            15,
            3,
            3,
            "FD"
        );


        doc.setTextColor(
            ...HITAM
        );


        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.setFontSize(9);


        doc.text(
            `TOTAL KARYAWAN : ${daftarKaryawan.length} ORANG`,
            105,
            posisiY + 3,
            {
                align:
                    "center"
            }
        );


        /* =====================================================
           TANDA TANGAN
        ===================================================== */

        posisiY += 30;


        doc.setTextColor(
            ...ABU_GELAP
        );


        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.setFontSize(
            8.5
        );


        doc.text(
            "Mengetahui,",
            55,
            posisiY,
            {
                align:
                    "center"
            }
        );


        doc.text(
            "Dibuat oleh,",
            155,
            posisiY,
            {
                align:
                    "center"
            }
        );


        /* SIGNATURE SPACE */

        doc.setDrawColor(
            ...ABU_BORDER
        );


        doc.setLineWidth(
            0.3
        );


        doc.line(
            30,
            posisiY + 28,
            80,
            posisiY + 28
        );


        doc.line(
            130,
            posisiY + 28,
            180,
            posisiY + 28
        );


        /* =====================================================
           FOOTER
        ===================================================== */

        const jumlahHalaman =
            doc.internal
                .getNumberOfPages();


        for (
            let i = 1;
            i <= jumlahHalaman;
            i++
        ) {

            doc.setPage(i);


            doc.setDrawColor(
                ...KUNING
            );


            doc.setLineWidth(
                0.8
            );


            doc.line(
                20,
                282,
                190,
                282
            );


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
                `Planning Lembur ${id}`,
                20,
                288
            );


            doc.text(
                `Halaman ${i} dari ${jumlahHalaman}`,
                190,
                288,
                {
                    align:
                        "right"
                }
            );

        }


        /* =====================================================
           SAVE PDF
        ===================================================== */

        const namaFile =
            String(id)
                .replace(
                    /[^a-zA-Z0-9_-]/g,
                    "_"
                );


        doc.save(
            `SPL_${namaFile}.pdf`
        );


        /* =====================================================
           SUCCESS TOAST
        ===================================================== */

        if (
            typeof showPlanningToast ===
            "function"
        ) {

            showPlanningToast(
                "success",
                "PDF berhasil dibuat",
                `SPL ${id} berhasil dibuat.`
            );

        }


    } catch (error) {

        console.error(
            "Gagal membuat PDF:",
            error
        );


        if (
            typeof showPlanningToast ===
            "function"
        ) {

            showPlanningToast(
                "error",
                "PDF gagal dibuat",
                error.message ||
                "Terjadi kesalahan saat membuat PDF."
            );

        } else {

            alert(
                error.message ||
                "PDF gagal dibuat."
            );

        }

    } finally {

        setTimeout(
            function () {

                hidePlanningLoading();

                planningCRUDLoading =
                    false;

            },
            300
        );

    }

}
/* =========================================================
   PRELOAD LOGO LINFOX
========================================================= */

function preloadLogoLinfox() {

    return new Promise(function (resolve, reject) {

        const img = new Image();

        img.onload = function () {

            resolve(img);

        };

        img.onerror = function () {

            reject(
                new Error(
                    "File logo.png tidak ditemukan."
                )
            );

        };

        img.src = "Logo.png";

    });

}
    /* =========================================================
    INITIALIZE EVENTS
    ========================================================= */

    function initPlanningEvents() {

        const jamMulai =
            planningEl("jamMulai");

        if (
            jamMulai &&
            !jamMulai.dataset.planningDuration
        ) {

            jamMulai.addEventListener(
                "input",
                hitungDurasiPlanning
            );

            jamMulai.dataset.planningDuration =
                "true";
        }

        const jamSelesai =
            planningEl("jamSelesai");

        if (
            jamSelesai &&
            !jamSelesai.dataset.planningDuration
        ) {

            jamSelesai.addEventListener(
                "input",
                hitungDurasiPlanning
            );

            jamSelesai.dataset.planningDuration =
                "true";
        }

        const button =
            planningEl(
                "btnBuatPlanning"
            );

        if (
            button &&
            !button.dataset.planningListener
        ) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    buatPlanning();

                }
            );

            button.dataset.planningListener =
                "true";
        }

        const form =
            planningEl(
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

        createPlanningSearch();

        hitungDurasiPlanning();

    }


    /* =========================================================
    GLOBAL EVENT - PREVIEW
    ========================================================= */

    function initPlanningGlobalEvents() {

        if (
            PlanningState.previewEventsInitialized
        ) {
            return;
        }

        PlanningState.previewEventsInitialized =
            true;

        document.addEventListener(
            "keydown",
            function (event) {

                if (event.key !== "Escape") {
                    return;
                }

                const modal =
                    planningEl(
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
        );

        document.addEventListener(
            "input",
            function (event) {

                if (
                    event.target?.id ===
                        "previewJamMulai" ||
                    event.target?.id ===
                        "previewJamSelesai"
                ) {

                    hitungDurasiPreview();

                }

            }
        );

        document.addEventListener(
            "click",
            function (event) {

                const result =
                    planningEl(
                        "previewSearchResult"
                    );

                const search =
                    planningEl(
                        "previewSearchKaryawan"
                    );

                if (
                    !result ||
                    !search
                ) {
                    return;
                }

                if (
                    !result.contains(
                        event.target
                    ) &&
                    event.target !== search
                ) {

                    result.classList.remove(
                        "active"
                    );

                }

            }
        );

    }


    /* =========================================================
    DOM READY
    ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                initPlanningEvents();

                initPlanningGlobalEvents();

                initPlanningToast();

            }
        );

    } else {

        initPlanningEvents();

        initPlanningGlobalEvents();

        initPlanningToast();

    }


    /* =========================================================
    DATABASE READY
    ========================================================= */

    document.addEventListener(
        "databaseReady",
        function () {

            renderPlanning();

            if (
                typeof updateKaryawanDropdown ===
                "function"
            ) {

                updateKaryawanDropdown();

            }

        }
    );
