/* =====================================================
   DATABASE SUPABASE
   LINFOX - DATABASE.JS
===================================================== */


/* =====================================================
   KONFIGURASI SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://msthucqijrjmmntsdscm.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_-mgfP8xp-YlJDNmHtmonZw_nN0CR8gz";


/* =====================================================
   INITIALIZE SUPABASE
===================================================== */

let supabaseClient = null;

try {

    if (
        typeof window.supabase !== "undefined" &&
        typeof window.supabase.createClient === "function"
    ) {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            );

        console.log(
            "Supabase client berhasil dibuat."
        );

    } else {

        console.error(
            "Library Supabase belum termuat."
        );

    }

}
catch (error) {

    console.error(
        "Gagal membuat Supabase client:",
        error
    );

}


/* =====================================================
   DATA GLOBAL
===================================================== */

let karyawan = [];
let planning = [];


/*
   PENTING:
   Sinkronkan ke window supaya app.js,
   chart dan file JS lain bisa membaca data.
*/

window.karyawan = karyawan;
window.planning = planning;


/* =====================================================
   SNAPSHOT DATABASE
===================================================== */

let databaseKaryawanSnapshot = [];
let databasePlanningSnapshot = [];


/* =====================================================
   STATUS DATABASE
===================================================== */

let databaseReady = false;
let databaseReadyPromise = null;


/* =====================================================
   HELPER
===================================================== */

function normalizeId(value) {

    return String(value ?? "")
        .trim()
        .toUpperCase();

}


function cloneData(data) {

    try {

        return JSON.parse(
            JSON.stringify(data)
        );

    }
    catch (error) {

        console.error(
            "Gagal clone data:",
            error
        );

        return [];

    }

}


/* =====================================================
   FORMAT DURASI
===================================================== */

function formatDurasiDatabase(menit) {

    const value =
        Number(menit || 0);

    if (value <= 0) {

        return "0 Jam";

    }

    const jam =
        value / 60;

    return (
        Number.isInteger(jam)
            ? jam
            : jam.toFixed(1)
    ) + " Jam";

}


/* =====================================================
   NORMALISASI KARYAWAN
===================================================== */

function normalisasiKaryawanData(data) {

    if (!Array.isArray(data)) {

        return [];

    }

    return data
        .map(item => {

            if (!item) {

                return null;

            }

            const id =
                normalizeId(
                    item.kode_karyawan ??
                    item.id
                );

            const nama =
                String(
                    item.nama ?? ""
                ).trim();

            const status =
                String(
                    item.status ?? "AKTIF"
                )
                .trim()
                .toUpperCase();

            const alasanPenalti =
                String(
                    item.alasan_penalti ??
                    item.alasanPenalti ??
                    ""
                ).trim();

            return {

                id: id,

                nama: nama,

                status: status,

                alasanPenalti:
                    alasanPenalti

            };

        })
        .filter(item => {

            return (
                item &&
                item.id &&
                item.nama
            );

        });

}


/* =====================================================
   CEK SUPABASE
===================================================== */

function cekSupabase() {

    if (!supabaseClient) {

        console.error(
            "supabaseClient belum tersedia."
        );

        return false;

    }

    return true;

}


/* =====================================================
   LOAD KARYAWAN
===================================================== */

async function loadKaryawanSupabase() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("karyawan")
            .select("*")
            .order(
                "id",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "ERROR LOAD KARYAWAN:",
            error
        );

        throw error;

    }


    console.log(
        "DATA KARYAWAN SUPABASE:",
        data
    );


    return normalisasiKaryawanData(data);

}


/* =====================================================
   LOAD PLANNING
===================================================== */

async function loadPlanningSupabase() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("planning_lembur")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "ERROR LOAD PLANNING:",
            error
        );

        throw error;

    }


    console.log(
        "DATA PLANNING SUPABASE:",
        data
    );


    return Array.isArray(data)
        ? data
        : [];

}


/* =====================================================
   LOAD RELASI PLANNING
===================================================== */

/*
   Tidak menggunakan nested relation Supabase.
   Kita ambil relasi secara langsung supaya lebih aman
   walaupun foreign key relationship belum terdeteksi.
*/

async function loadRelasiPlanningSupabase() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("planning_karyawan")
            .select(
                "planning_id, karyawan_id"
            );


    if (error) {

        console.error(
            "ERROR LOAD RELASI PLANNING:",
            error
        );

        throw error;

    }


    console.log(
        "DATA RELASI PLANNING:",
        data
    );


    return Array.isArray(data)
        ? data
        : [];

}


/* =====================================================
   BENTUK DATA PLANNING
===================================================== */

function bentukDataPlanning(
    dataPlanning,
    dataRelasi,
    dataKaryawan
) {

    if (!Array.isArray(dataPlanning)) {

        return [];

    }


    const daftarKaryawanDB =
        Array.isArray(dataKaryawan)
            ? dataKaryawan
            : [];


    return dataPlanning
        .map(item => {

            if (!item) {

                return null;

            }


            /* =========================================
               RELASI
            ========================================= */

            const relasi =
                Array.isArray(dataRelasi)
                    ? dataRelasi.filter(
                        relation => {

                            return (
                                String(
                                    relation.planning_id
                                ) ===
                                String(
                                    item.id
                                )
                            );

                        }
                    )
                    : [];


            /* =========================================
               KARYAWAN DALAM PLANNING
            ========================================= */

            const daftarKaryawan =
                relasi
                    .map(relation => {

                        const karyawanId =
                            String(
                                relation.karyawan_id
                            );


                        /*
                           Cari berdasarkan ID database
                        */

                        const data =
                            daftarKaryawanDB.find(
                                k => {

                                    return (
                                        String(
                                            k.databaseId ??
                                            k.idDatabase ??
                                            k._databaseId ??
                                            ""
                                        ) ===
                                        karyawanId
                                    );

                                }
                            );


                        /*
                           Kalau tidak ketemu berdasarkan
                           database ID, cari berdasarkan
                           kode karyawan.
                        */

                        if (!data) {

                            return null;

                        }


                        return {

                            id:
                                normalizeId(
                                    data.id
                                ),

                            nama:
                                String(
                                    data.nama || ""
                                ).trim()

                        };

                    })
                    .filter(Boolean);


            /* =========================================
               DURASI
            ========================================= */

            let durasiMenit =
                Number(
                    item.durasi_menit ??
                    item.durasiMenit ??
                    0
                );


            if (
                !durasiMenit &&
                item.jam_mulai &&
                item.jam_selesai &&
                typeof hitungDurasiPlanning ===
                "function"
            ) {

                durasiMenit =
                    Number(
                        hitungDurasiPlanning(
                            item.jam_mulai,
                            item.jam_selesai
                        )
                    ) || 0;

            }


            /* =========================================
               ID PLANNING
            ========================================= */

            const idPlanning =
                item.kode_planning ??
                String(item.id);


            /* =========================================
               HASIL
            ========================================= */

            return {

                id:
                    idPlanning,

                idPlanning:
                    idPlanning,

                databaseId:
                    item.id,

                tanggal:
                    item.tanggal ?? "",

                jamMulai:
                    item.jam_mulai ??
                    item.jamMulai ??
                    "",

                jamSelesai:
                    item.jam_selesai ??
                    item.jamSelesai ??
                    "",

                durasiMenit:
                    durasiMenit,

                durasi:
                    item.durasi ??
                    formatDurasiDatabase(
                        durasiMenit
                    ),

                keterangan:
                    item.keterangan ??
                    "",

                status:
                    item.status ??
                    "Planning",

                karyawan:
                    daftarKaryawan,

                jumlahKaryawan:
                    daftarKaryawan.length,

                createdAt:
                    item.created_at ??
                    item.createdAt ??
                    new Date().toISOString()

            };

        })
        .filter(Boolean);

}


/* =====================================================
   LOAD SEMUA DATABASE
===================================================== */

async function loadDatabase() {

    if (!cekSupabase()) {

        return false;

    }


    try {

        console.log(
            "================================="
        );

        console.log(
            "MENGAMBIL DATA DARI SUPABASE..."
        );


        /* =============================================
           LOAD KARYAWAN
        ============================================= */

        const dataKaryawan =
            await loadKaryawanSupabase();


        /*
           Simpan ID database asli.
           Ini penting untuk relasi planning_karyawan.
        */

        const {
            data: rawKaryawan,
            error: rawKaryawanError
        } =
            await supabaseClient
                .from("karyawan")
                .select("*")
                .order(
                    "id",
                    {
                        ascending: true
                    }
                );


        if (rawKaryawanError) {

            throw rawKaryawanError;

        }


        karyawan =
            Array.isArray(rawKaryawan)
                ? rawKaryawan
                    .map(item => {

                        const normalized =
                            normalisasiKaryawanData(
                                [item]
                            )[0];

                        if (!normalized) {

                            return null;

                        }

                        /*
                           Simpan ID database internal.
                        */

                        normalized.databaseId =
                            item.id;

                        normalized.idDatabase =
                            item.id;

                        return normalized;

                    })
                    .filter(Boolean)
                : [];


        /*
           Sinkronkan global.
        */

        window.karyawan =
            karyawan;


        databaseKaryawanSnapshot =
            cloneData(karyawan);


        console.log(
            "Karyawan:",
            karyawan.length
        );


        /* =============================================
           LOAD PLANNING
        ============================================= */

        const dataPlanning =
            await loadPlanningSupabase();


        console.log(
            "Planning mentah:",
            dataPlanning.length
        );


        /* =============================================
           LOAD RELASI
        ============================================= */

        const dataRelasi =
            await loadRelasiPlanningSupabase();


        console.log(
            "Relasi planning:",
            dataRelasi.length
        );


        /* =============================================
           BENTUK PLANNING
        ============================================= */

        planning =
            bentukDataPlanning(
                dataPlanning,
                dataRelasi,
                karyawan
            );


        /*
           SANGAT PENTING
           Supaya app.js bisa membaca:
           window.planning
        */

        window.planning =
            planning;


        databasePlanningSnapshot =
            cloneData(planning);


        /* =============================================
           DATABASE READY
        ============================================= */

        databaseReady =
            true;


        console.log(
            "================================="
        );

        console.log(
            "SUPABASE DATABASE READY"
        );

        console.log(
            "Karyawan:",
            karyawan.length
        );

        console.log(
            "Planning:",
            planning.length
        );

        console.log(
            "window.planning:",
            window.planning
        );

        console.log(
            "================================="
        );


        /* =============================================
           EVENT
        ============================================= */

        document.dispatchEvent(
            new CustomEvent(
                "databaseReady"
            )
        );


        /* =============================================
           REFRESH UI
        ============================================= */

        refreshUI();


        return true;

    }
    catch (error) {

        databaseReady =
            false;


        console.error(
            "================================="
        );

        console.error(
            "DATABASE ERROR"
        );

        console.error(
            error
        );

        console.error(
            "MESSAGE:",
            error?.message
        );

        console.error(
            "DETAIL:",
            error?.details
        );

        console.error(
            "HINT:",
            error?.hint
        );

        console.error(
            "================================="
        );


        return false;

    }

}


/* =====================================================
   REFRESH UI
===================================================== */

function refreshUI() {

    /*
       Pastikan global selalu sinkron.
    */

    window.karyawan =
        karyawan;

    window.planning =
        planning;


    if (
        typeof renderKaryawan ===
        "function"
    ) {

        renderKaryawan();

    }


    if (
        typeof updateKaryawanDropdown ===
        "function"
    ) {

        updateKaryawanDropdown();

    }


    if (
        typeof renderPlanningKaryawan ===
        "function"
    ) {

        renderPlanningKaryawan();

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

}


/* =====================================================
   GET DATA
===================================================== */

function getKaryawan() {

    return Array.isArray(karyawan)
        ? karyawan
        : [];

}


function getPlanning() {

    return Array.isArray(planning)
        ? planning
        : [];

}


/* =====================================================
   GET KARYAWAN AKTIF
===================================================== */

function getKaryawanAktifDatabase() {

    return getKaryawan()
        .filter(item => {

            return (
                String(
                    item.status ??
                    "AKTIF"
                )
                .trim()
                .toUpperCase() ===
                "AKTIF"
            );

        });

}


/* =====================================================
   SIMPAN KARYAWAN
===================================================== */

async function simpanKaryawanSupabase() {

    if (!cekSupabase()) {

        return false;

    }


    try {

        const dataInsert =
            getKaryawan()
                .map(item => {

                    return {

                        kode_karyawan:
                            normalizeId(
                                item.id
                            ),

                        nama:
                            String(
                                item.nama ??
                                ""
                            ).trim(),

                        status:
                            String(
                                item.status ??
                                "AKTIF"
                            )
                            .trim()
                            .toUpperCase(),

                        alasan_penalti:
                            String(
                                item.alasanPenalti ??
                                item.alasan_penalti ??
                                ""
                            ).trim()

                    };

                })
                .filter(item => {

                    return (
                        item.kode_karyawan &&
                        item.nama
                    );

                });


        if (
            dataInsert.length > 0
        ) {

            const {
                error
            } =
                await supabaseClient
                    .from("karyawan")
                    .upsert(
                        dataInsert,
                        {
                            onConflict:
                                "kode_karyawan"
                        }
                    );


            if (error) {

                throw error;

            }

        }


        const currentIds =
            dataInsert.map(
                item =>
                    normalizeId(
                        item.kode_karyawan
                    )
            );


        const deleted =
            databaseKaryawanSnapshot
                .filter(oldItem => {

                    return (
                        !currentIds.includes(
                            normalizeId(
                                oldItem.id
                            )
                        )
                    );

                });


        for (
            const item of deleted
        ) {

            const {
                error
            } =
                await supabaseClient
                    .from("karyawan")
                    .delete()
                    .eq(
                        "kode_karyawan",
                        normalizeId(
                            item.id
                        )
                    );


            if (error) {

                console.error(
                    "Gagal menghapus karyawan:",
                    error
                );

            }

        }


        databaseKaryawanSnapshot =
            cloneData(
                getKaryawan()
            );


        return true;

    }
    catch (error) {

        console.error(
            "Gagal menyimpan karyawan:",
            error
        );


        alert(
            "Karyawan gagal disimpan ke Supabase.\n\n" +
            (
                error?.message ??
                "Unknown error"
            )
        );


        return false;

    }

}


/* =====================================================
   SIMPAN PENALTI
===================================================== */

async function simpanPenaltiSupabase() {

    if (!cekSupabase()) {

        return false;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("karyawan")
                .select(
                    "id, kode_karyawan, status"
                );


        if (error) {

            throw error;

        }


        if (!Array.isArray(data)) {

            return true;

        }


        for (
            const item of data
        ) {

            const aplikasi =
                getKaryawan()
                    .find(
                        k =>
                            normalizeId(
                                k.id
                            ) ===
                            normalizeId(
                                item.kode_karyawan
                            )
                    );


            if (!aplikasi) {

                continue;

            }


            const status =
                String(
                    aplikasi.status ??
                    "AKTIF"
                )
                .trim()
                .toUpperCase();


            const alasan =
                String(
                    aplikasi.alasanPenalti ??
                    ""
                ).trim();


            if (
                status === "PENALTI"
            ) {

                const {
                    data:
                        penaltyAktif,
                    error:
                        penaltyError
                } =
                    await supabaseClient
                        .from("penalti")
                        .select("id")
                        .eq(
                            "karyawan_id",
                            item.id
                        )
                        .eq(
                            "aktif",
                            true
                        )
                        .limit(1);


                if (penaltyError) {

                    throw penaltyError;

                }


                if (
                    Array.isArray(
                        penaltyAktif
                    ) &&
                    penaltyAktif.length > 0
                ) {

                    const {
                        error:
                            updateError
                    } =
                        await supabaseClient
                            .from("penalti")
                            .update({

                                alasan:
                                    alasan ||
                                    "Penalti"

                            })
                            .eq(
                                "id",
                                penaltyAktif[0].id
                            );


                    if (updateError) {

                        throw updateError;

                    }

                }
                else {

                    const {
                        error:
                            insertError
                    } =
                        await supabaseClient
                            .from("penalti")
                            .insert({

                                karyawan_id:
                                    item.id,

                                alasan:
                                    alasan ||
                                    "Penalti",

                                tanggal:
                                    new Date()
                                        .toISOString()
                                        .split("T")[0],

                                aktif:
                                    true

                            });


                    if (insertError) {

                        throw insertError;

                    }

                }

            }
            else {

                const {
                    error:
                        updateError
                } =
                    await supabaseClient
                        .from("penalti")
                        .update({

                            aktif:
                                false

                        })
                        .eq(
                            "karyawan_id",
                            item.id
                        )
                        .eq(
                            "aktif",
                            true
                        );


                if (updateError) {

                    throw updateError;

                }

            }

        }


        return true;

    }
    catch (error) {

        console.error(
            "Gagal menyimpan penalti:",
            error
        );


        alert(
            "Data penalti gagal disimpan ke Supabase.\n\n" +
            (
                error?.message ??
                "Unknown error"
            )
        );


        return false;

    }

}


/* =====================================================
   SIMPAN PLANNING
===================================================== */

async function simpanPlanningSupabase() {

    if (!cekSupabase()) {

        return false;

    }


    try {

        const currentPlanningIds =
            getPlanning()
                .map(
                    item =>
                        String(
                            item.idPlanning ??
                            item.id ??
                            ""
                        ).trim()
                )
                .filter(Boolean);


        for (
            const item of getPlanning()
        ) {

            const kodePlanning =
                String(
                    item.idPlanning ??
                    item.id ??
                    ""
                ).trim();


            if (!kodePlanning) {

                continue;

            }


            const {
                data:
                    planningData,
                error:
                    planningError
            } =
                await supabaseClient
                    .from(
                        "planning_lembur"
                    )
                    .upsert(
                        {

                            kode_planning:
                                kodePlanning,

                            tanggal:
                                item.tanggal ??
                                "",

                            jam_mulai:
                                item.jamMulai ??
                                "",

                            jam_selesai:
                                item.jamSelesai ??
                                "",

                            durasi_menit:
                                Number(
                                    item.durasiMenit ??
                                    0
                                ),

                            durasi:
                                item.durasi ??
                                formatDurasiDatabase(
                                    item.durasiMenit
                                ),

                            keterangan:
                                item.keterangan ??
                                "",

                            status:
                                item.status ??
                                "Planning"

                        },
                        {
                            onConflict:
                                "kode_planning"
                        }
                    )
                    .select(
                        "id, kode_planning"
                    )
                    .single();


            if (planningError) {

                throw planningError;

            }


            const planningId =
                planningData.id;


            /* =========================================
               HAPUS RELASI LAMA
            ========================================= */

            const {
                error:
                    deleteRelationError
            } =
                await supabaseClient
                    .from(
                        "planning_karyawan"
                    )
                    .delete()
                    .eq(
                        "planning_id",
                        planningId
                    );


            if (deleteRelationError) {

                throw deleteRelationError;

            }


            /* =========================================
               INSERT RELASI
            ========================================= */

            const daftar =
                Array.isArray(
                    item.karyawan
                )
                    ? item.karyawan
                    : [];


            for (
                const dataKaryawan
                of daftar
            ) {

                const kodeKaryawan =
                    normalizeId(
                        dataKaryawan.id
                    );


                if (!kodeKaryawan) {

                    continue;

                }


                const {
                    data:
                        karyawanDB,
                    error:
                        karyawanError
                } =
                    await supabaseClient
                        .from("karyawan")
                        .select("id")
                        .eq(
                            "kode_karyawan",
                            kodeKaryawan
                        )
                        .maybeSingle();


                if (karyawanError) {

                    console.warn(
                        "Karyawan tidak ditemukan:",
                        kodeKaryawan,
                        karyawanError
                    );

                    continue;

                }


                if (!karyawanDB) {

                    console.warn(
                        "Karyawan tidak ditemukan:",
                        kodeKaryawan
                    );

                    continue;

                }


                const {
                    error:
                        relationError
                } =
                    await supabaseClient
                        .from(
                            "planning_karyawan"
                        )
                        .insert({

                            planning_id:
                                planningId,

                            karyawan_id:
                                karyawanDB.id

                        });


                if (relationError) {

                    throw relationError;

                }

            }

        }


        /* =========================================
           HAPUS PLANNING
        ========================================= */

        const deletedPlanning =
            databasePlanningSnapshot
                .filter(oldItem => {

                    const oldId =
                        String(
                            oldItem.idPlanning ??
                            oldItem.id ??
                            ""
                        ).trim();


                    return (
                        oldId &&
                        !currentPlanningIds.includes(
                            oldId
                        )
                    );

                });


        for (
            const item of deletedPlanning
        ) {

            const kode =
                String(
                    item.idPlanning ??
                    item.id ??
                    ""
                ).trim();


            if (!kode) {

                continue;

            }


            const {
                error
            } =
                await supabaseClient
                    .from(
                        "planning_lembur"
                    )
                    .delete()
                    .eq(
                        "kode_planning",
                        kode
                    );


            if (error) {

                console.error(
                    "Gagal menghapus planning:",
                    error
                );

            }

        }


        databasePlanningSnapshot =
            cloneData(
                getPlanning()
            );


        return true;

    }
    catch (error) {

        console.error(
            "Gagal menyimpan planning:",
            error
        );


        alert(
            "Planning gagal disimpan ke Supabase.\n\n" +
            (
                error?.message ??
                "Unknown error"
            )
        );


        return false;

    }

}


/* =====================================================
   SIMPAN SEMUA DATA
===================================================== */

async function simpanData() {

    if (!databaseReady) {

        alert(
            "Database belum siap. Tunggu sebentar lalu coba lagi."
        );

        return false;

    }


    console.log(
        "Menyimpan data..."
    );


    const karyawanBerhasil =
        await simpanKaryawanSupabase();


    if (!karyawanBerhasil) {

        return false;

    }


    const penaltiBerhasil =
        await simpanPenaltiSupabase();


    if (!penaltiBerhasil) {

        return false;

    }


    const planningBerhasil =
        await simpanPlanningSupabase();


    if (!planningBerhasil) {

        return false;

    }


    console.log(
        "Semua data berhasil disimpan ke Supabase."
    );


    /*
       Setelah save, reload dari database
       supaya data UI benar-benar sinkron.
    */

    await loadDatabase();


    return true;

}


/* =====================================================
   ALIAS
===================================================== */

async function saveDatabase() {

    return await simpanData();

}


async function simpanDatabase() {

    return await simpanData();

}


/* =====================================================
   NORMALISASI DATABASE
===================================================== */

function normalisasiDatabase() {

    karyawan =
        normalisasiKaryawanData(
            karyawan
        );


    /*
       Jangan sampai window.planning
       kehilangan referensi.
    */

    window.karyawan =
        karyawan;

    window.planning =
        planning;

}


/* =====================================================
   REFRESH DATABASE
===================================================== */

async function refreshDatabase() {

    return await loadDatabase();

}


/* =====================================================
   CEK DATABASE READY
===================================================== */

function isDatabaseReady() {

    return databaseReady;

}


/* =====================================================
   TUNGGU DATABASE READY
===================================================== */

async function tungguDatabaseReady() {

    if (databaseReady) {

        return true;

    }


    if (databaseReadyPromise) {

        return await databaseReadyPromise;

    }


    return false;

}


/* =====================================================
   INITIAL DATABASE
===================================================== */

databaseReadyPromise =
    loadDatabase();


/* =====================================================
   GLOBAL PROMISE
===================================================== */

window.databaseReadyPromise =
    databaseReadyPromise;


/* =====================================================
   EVENT DATABASE READY
===================================================== */

document.addEventListener(
    "databaseReady",
    function () {

        console.log(
            "Database siap digunakan."
        );

        console.log(
            "window.karyawan:",
            window.karyawan
        );

        console.log(
            "window.planning:",
            window.planning
        );

    }
);