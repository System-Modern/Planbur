/* =====================================================
   KARYAWAN.JS
   DATABASE KARYAWAN
   TERHUBUNG DENGAN DATABASE.JS / SUPABASE
===================================================== */


/* =====================================================
   HELPER DATA
===================================================== */

function getDataKaryawan() {

    if (Array.isArray(window.karyawan)) {
        return window.karyawan;
    }

    if (Array.isArray(karyawan)) {
        return karyawan;
    }

    return [];

}


function getDataPlanning() {

    if (Array.isArray(window.planning)) {
        return window.planning;
    }

    if (Array.isArray(planning)) {
        return planning;
    }

    return [];

}


/* =====================================================
   TAMBAH KARYAWAN
===================================================== */

async function tambahKaryawan() {

    const idInput =
        document.getElementById("idKaryawan");

    const namaInput =
        document.getElementById("namaKaryawan");


    if (!idInput || !namaInput) {
        return;
    }


    const id =
        idInput.value
            .trim()
            .toUpperCase();


    const nama =
        namaInput.value
            .trim();


    if (!id || !nama) {

        alert(
            "ID dan nama karyawan wajib diisi."
        );

        return;

    }


    const dataKaryawan =
        getDataKaryawan();


    const sudahAda =
        dataKaryawan.some(
            item =>
                String(item.id || "")
                    .trim()
                    .toUpperCase() === id
        );


    if (sudahAda) {

        alert(
            "ID karyawan sudah terdaftar."
        );

        return;

    }


    dataKaryawan.push({

        id: id,

        nama: nama,

        status: "AKTIF",

        alasanPenalti: ""

    });


    /*
       Pastikan global tetap menunjuk
       ke array yang sama
    */

    window.karyawan =
        dataKaryawan;


    const berhasil =
        await simpanData();


    if (!berhasil) {

        dataKaryawan.pop();

        return;

    }


    idInput.value = "";

    namaInput.value = "";


    renderKaryawan();

    updateKaryawanDropdown();


    if (
        typeof renderFilterKaryawan ===
        "function"
    ) {

        renderFilterKaryawan();

    }


    if (
        typeof updateDashboard ===
        "function"
    ) {

        updateDashboard();

    }


    alert(
        "Karyawan berhasil ditambahkan."
    );

}


/* =====================================================
   HAPUS KARYAWAN
===================================================== */

async function hapusKaryawan(index) {

    const dataKaryawan =
        getDataKaryawan();


    const data =
        dataKaryawan[index];


    if (!data) {
        return;
    }


    const id =
        String(data.id || "")
            .trim()
            .toUpperCase();


    const dataPlanning =
        getDataPlanning();


    const digunakan =
        dataPlanning.some(
            item =>

                Array.isArray(
                    item.karyawan
                ) &&

                item.karyawan.some(
                    k =>

                        String(k.id || "")
                            .trim()
                            .toUpperCase() === id
                )
        );


    if (digunakan) {

        alert(
            "Karyawan ini sudah digunakan dalam planning lembur dan tidak dapat dihapus."
        );

        return;

    }


    if (
        !confirm(
            `Hapus karyawan ${data.nama}?`
        )
    ) {

        return;

    }


    const dataLama =
        {
            ...data
        };


    dataKaryawan.splice(
        index,
        1
    );


    window.karyawan =
        dataKaryawan;


    const berhasil =
        await simpanData();


    if (!berhasil) {

        dataKaryawan.splice(
            index,
            0,
            dataLama
        );

        window.karyawan =
            dataKaryawan;

        renderKaryawan();
        updateKaryawanDropdown();

        return;

    }


    renderKaryawan();

    updateKaryawanDropdown();


    if (
        typeof renderFilterKaryawan ===
        "function"
    ) {

        renderFilterKaryawan();

    }


    if (
        typeof updateDashboard ===
        "function"
    ) {

        updateDashboard();

    }


    alert(
        `Karyawan ${data.nama} berhasil dihapus.`
    );

}


/* =====================================================
   RENDER KARYAWAN
===================================================== */

function renderKaryawan() {

    const tbody =
        document.getElementById(
            "tableKaryawan"
        );


    if (!tbody) {
        return;
    }


    const dataKaryawan =
        getDataKaryawan();


    const searchInput =
        document.getElementById(
            "searchKaryawan"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    tbody.innerHTML = "";


    /*
       Normalisasi data
    */

    dataKaryawan.forEach(
        item => {

            if (!item.status) {

                item.status =
                    "AKTIF";

            }


            if (
                item.alasanPenalti ===
                undefined
            ) {

                item.alasanPenalti =
                    "";

            }

        }
    );


    /*
       Filter pencarian
    */

    const filtered =
        dataKaryawan.filter(
            item => {

                const id =
                    String(
                        item.id || ""
                    )
                    .toLowerCase();


                const nama =
                    String(
                        item.nama || ""
                    )
                    .toLowerCase();


                return (
                    id.includes(search) ||
                    nama.includes(search)
                );

            }
        );


    /*
       Data kosong
    */

    if (
        filtered.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-state-cell"
                >

                    <div class="empty-state">

                        Belum ada data karyawan.

                    </div>

                </td>

            </tr>

        `;

    }

    else {

        filtered.forEach(
            item => {

                const index =
                    dataKaryawan.findIndex(
                        x =>

                            String(
                                x.id || ""
                            )
                            .trim()
                            .toUpperCase() ===

                            String(
                                item.id || ""
                            )
                            .trim()
                            .toUpperCase()
                    );


                const isPenalty =
                    String(
                        item.status || ""
                    )
                    .trim()
                    .toUpperCase() ===
                    "PENALTI";


                let statusHTML;

                let aksiHTML;


                if (isPenalty) {

                    statusHTML = `

                        <span
                            class="status-badge status-penalty"
                        >

                            <span>●</span>

                            PENALTI

                        </span>

                    `;


                    aksiHTML = `

                        <button
                            type="button"
                            class="btn-primary btn-small"
                            onclick="lepasPenalti(${index})"
                        >

                            Lepas Penalti

                        </button>


                        <button
                            type="button"
                            class="btn-delete btn-small"
                            onclick="hapusKaryawan(${index})"
                        >

                            Hapus

                        </button>

                    `;

                }

                else {

                    statusHTML = `

                        <span
                            class="status-badge status-active"
                        >

                            <span>●</span>

                            AKTIF

                        </span>

                    `;


                    aksiHTML = `

                        <button
                            type="button"
                            class="btn-penalty btn-small"
                            onclick="bukaModalPenalti(${index})"
                        >

                            Penalti

                        </button>


                        <button
                            type="button"
                            class="btn-delete btn-small"
                            onclick="hapusKaryawan(${index})"
                        >

                            Hapus

                        </button>

                    `;

                }


                tbody.innerHTML += `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(item.id)}
                            </strong>

                        </td>


                        <td>

                            ${escapeHTML(item.nama)}

                        </td>


                        <td>

                            ${statusHTML}

                        </td>


                        <td>

                            <div
                                class="action-buttons"
                            >

                                ${aksiHTML}

                            </div>

                        </td>

                    </tr>

                `;

            }
        );

    }


    const jumlah =
        document.getElementById(
            "jumlahKaryawanText"
        );


    if (jumlah) {

        jumlah.textContent =
            `${dataKaryawan.length} karyawan`;

    }

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

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


/* =====================================================
   BUKA MODAL PENALTI
===================================================== */

function bukaModalPenalti(index) {

    const dataKaryawan =
        getDataKaryawan();


    const data =
        dataKaryawan[index];


    if (!data) {

        alert(
            "Data karyawan tidak ditemukan."
        );

        return;

    }


    const modal =
        document.getElementById(
            "penaltyModal"
        );


    const idInput =
        document.getElementById(
            "penaltyKaryawanId"
        );


    const namaInput =
        document.getElementById(
            "penaltyKaryawanNama"
        );


    const alasanInput =
        document.getElementById(
            "alasanPenalti"
        );


    if (!modal) {

        alert(
            "Modal penalti belum tersedia."
        );

        return;

    }


    if (idInput) {

        idInput.value =
            data.id;

    }


    if (namaInput) {

        namaInput.value =
            `${data.id} - ${data.nama}`;

    }


    if (alasanInput) {

        alasanInput.value =
            data.alasanPenalti || "";

    }


    modal.classList.add(
        "show"
    );


    modal.style.display =
        "flex";


    setTimeout(
        () => {

            if (alasanInput) {

                alasanInput.focus();

            }

        },
        100
    );

}


/* =====================================================
   TUTUP MODAL PENALTI
===================================================== */

function closePenaltyModal() {

    const modal =
        document.getElementById(
            "penaltyModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "show"
    );


    modal.style.display =
        "none";


    const form =
        document.getElementById(
            "formPenalty"
        );


    if (form) {

        form.reset();

    }


    const idInput =
        document.getElementById(
            "penaltyKaryawanId"
        );


    const namaInput =
        document.getElementById(
            "penaltyKaryawanNama"
        );


    const alasanInput =
        document.getElementById(
            "alasanPenalti"
        );


    if (idInput) {

        idInput.value = "";

    }


    if (namaInput) {

        namaInput.value = "";

    }


    if (alasanInput) {

        alasanInput.value = "";

    }

}


/* =====================================================
   AKTIFKAN PENALTI
===================================================== */

async function aktifkanPenalti() {

    const dataKaryawan =
        getDataKaryawan();


    const idInput =
        document.getElementById(
            "penaltyKaryawanId"
        );


    const alasanInput =
        document.getElementById(
            "alasanPenalti"
        );


    const id =
        idInput
            ? String(
                idInput.value
            ).trim()
            : "";


    const alasan =
        alasanInput
            ? alasanInput.value.trim()
            : "";


    if (!id) {

        alert(
            "Karyawan tidak ditemukan."
        );

        return;

    }


    if (!alasan) {

        alert(
            "Alasan penalti wajib diisi."
        );


        if (alasanInput) {

            alasanInput.focus();

        }


        return;

    }


    const index =
        dataKaryawan.findIndex(
            item =>

                String(item.id || "")
                    .trim()
                    .toLowerCase() ===
                id.toLowerCase()
        );


    if (index === -1) {

        alert(
            "Data karyawan tidak ditemukan."
        );

        return;

    }


    const statusLama =
        dataKaryawan[index].status;


    const alasanLama =
        dataKaryawan[index]
            .alasanPenalti;


    dataKaryawan[index].status =
        "PENALTI";


    dataKaryawan[index]
        .alasanPenalti =
        alasan;


    window.karyawan =
        dataKaryawan;


    const berhasil =
        await simpanData();


    if (!berhasil) {

        dataKaryawan[index].status =
            statusLama;


        dataKaryawan[index]
            .alasanPenalti =
            alasanLama;


        return;

    }


    const namaKaryawan =
        dataKaryawan[index].nama;


    closePenaltyModal();

    renderKaryawan();

    updateKaryawanDropdown();


    if (
        typeof renderFilterKaryawan ===
        "function"
    ) {

        renderFilterKaryawan();

    }


    if (
        typeof renderPlanningKaryawan ===
        "function"
    ) {

        renderPlanningKaryawan();

    }


    if (
        typeof updateDashboard ===
        "function"
    ) {

        updateDashboard();

    }


    alert(
        `${namaKaryawan} sekarang terkena PENALTI dan tidak dapat masuk planning lembur.`
    );

}


/* =====================================================
   LEPAS PENALTI
===================================================== */

async function lepasPenalti(index) {

    const dataKaryawan =
        getDataKaryawan();


    const data =
        dataKaryawan[index];


    if (!data) {
        return;
    }


    if (
        !confirm(
            `Lepas penalti untuk ${data.nama}?`
        )
    ) {

        return;

    }


    const statusLama =
        data.status;


    const alasanLama =
        data.alasanPenalti;


    data.status =
        "AKTIF";


    data.alasanPenalti =
        "";


    window.karyawan =
        dataKaryawan;


    const berhasil =
        await simpanData();


    if (!berhasil) {

        data.status =
            statusLama;


        data.alasanPenalti =
            alasanLama;


        return;

    }


    renderKaryawan();

    updateKaryawanDropdown();


    if (
        typeof renderFilterKaryawan ===
        "function"
    ) {

        renderFilterKaryawan();

    }


    if (
        typeof renderPlanningKaryawan ===
        "function"
    ) {

        renderPlanningKaryawan();

    }


    if (
        typeof updateDashboard ===
        "function"
    ) {

        updateDashboard();

    }


    alert(
        `${data.nama} sudah tidak terkena penalti dan dapat melakukan planning lembur kembali.`
    );

}


/* =====================================================
   DROPDOWN KARYAWAN
===================================================== */

function updateKaryawanDropdown() {

    const select =
        document.getElementById(
            "pilihKaryawan"
        );


    const filter =
        document.getElementById(
            "filterKaryawan"
        );


    const dataKaryawan =
        getDataKaryawan();


    /* =================================================
       DROPDOWN PLANNING
    ================================================= */

    if (select) {

        select.innerHTML = `

            <option value="">
                Pilih Karyawan
            </option>

        `;


        dataKaryawan.forEach(
            item => {

                const status =
                    String(
                        item.status ||
                        "AKTIF"
                    )
                    .trim()
                    .toUpperCase();


                /*
                   Karyawan penalti
                   tidak masuk planning
                */

                if (
                    status ===
                    "PENALTI"
                ) {

                    return;

                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    item.id;


                option.textContent =
                    `${item.id} - ${item.nama}`;


                select.appendChild(
                    option
                );

            }
        );

    }


    /* =================================================
       FILTER PLANNING
    ================================================= */

    if (filter) {

        const nilaiLama =
            filter.value;


        filter.innerHTML = `

            <option value="">
                Semua Karyawan
            </option>

        `;


        dataKaryawan.forEach(
            item => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    item.id;


                option.textContent =
                    `${item.id} - ${item.nama}`;


                filter.appendChild(
                    option
                );

            }
        );


        const masihAda =
            Array.from(
                filter.options
            ).some(
                option =>
                    option.value ===
                    nilaiLama
            );


        filter.value =
            masihAda
                ? nilaiLama
                : "";

    }

}


/* =====================================================
   EVENT MODAL PENALTI
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "formPenalty"
            );


        if (
            form &&
            !form.dataset.penaltyListener
        ) {

            form.addEventListener(
                "submit",
                event => {

                    event.preventDefault();

                    aktifkanPenalti();

                }
            );


            form.dataset.penaltyListener =
                "true";

        }


        const modal =
            document.getElementById(
                "penaltyModal"
            );


        if (!modal) {
            return;
        }


        /* =============================================
           KLIK LUAR MODAL
        ============================================= */

        if (
            !modal.dataset.outsideListener
        ) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        closePenaltyModal();

                    }

                }
            );


            modal.dataset.outsideListener =
                "true";

        }


        /* =============================================
           TOMBOL X
        ============================================= */

        const closeButton =
            modal.querySelector(
                ".modal-close"
            );


        if (
            closeButton &&
            !closeButton.dataset.penaltyListener
        ) {

            closeButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    closePenaltyModal();

                }
            );


            closeButton.dataset.penaltyListener =
                "true";

        }


        /* =============================================
           TOMBOL BATAL
        ============================================= */

        const cancelButton =
            modal.querySelector(
                ".btn-cancel"
            );


        if (
            cancelButton &&
            !cancelButton.dataset.penaltyListener
        ) {

            cancelButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    closePenaltyModal();

                }
            );


            cancelButton.dataset.penaltyListener =
                "true";

        }

    }
);


/* =====================================================
   DATABASE READY
===================================================== */

document.addEventListener(
    "databaseReady",
    () => {

        /*
           Pastikan global data berupa array
        */

        if (
            !Array.isArray(
                window.karyawan
            )
        ) {

            window.karyawan = [];

        }


        if (
            !Array.isArray(
                window.planning
            )
        ) {

            window.planning = [];

        }


        renderKaryawan();

        updateKaryawanDropdown();


        /*
           Refresh dashboard
           setelah Supabase selesai load
        */

        if (
            typeof updateDashboard ===
            "function"
        ) {

            updateDashboard();

        }

    }
);


/* =====================================================
   EXPORT GLOBAL
===================================================== */

window.renderKaryawan =
    renderKaryawan;


window.updateKaryawanDropdown =
    updateKaryawanDropdown;


window.tambahKaryawan =
    tambahKaryawan;


window.hapusKaryawan =
    hapusKaryawan;


window.bukaModalPenalti =
    bukaModalPenalti;


window.closePenaltyModal =
    closePenaltyModal;


window.aktifkanPenalti =
    aktifkanPenalti;


window.lepasPenalti =
    lepasPenalti;


console.log(
    "karyawan.js berhasil dimuat."
);