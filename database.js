/* =====================================================
   DATABASE SUPABASE
   LINFOX - DATABASE.JS
   VERSI OPTIMASI - LOGIKA TETAP SAMA
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


    return Array.isArray(data)
        ? data
        : [];

}


/* =====================================================
   LOAD RELASI PLANNING
===================================================== */

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


    /*
       Buat map supaya pencarian karyawan
       tidak menggunakan .find() berkali-kali.
    */

    const karyawanMap =
        new Map();


    daftarKaryawanDB.forEach(
        k => {

            const databaseId =
                String(
                    k.databaseId ??
                    k.idDatabase ??
                    k._databaseId ??
                    ""
                );


            if (databaseId) {

                karyawanMap.set(
                    databaseId,
                    k
                );

            }

        }
    );


    /*
       Buat map relasi berdasarkan planning_id.
       Ini jauh lebih cepat daripada filter()
       untuk setiap planning.
    */

    const relasiMap =
        new Map();


    if (Array.isArray(dataRelasi)) {

        dataRelasi.forEach(
            relation => {

                const planningId =
                    String(
                        relation.planning_id
                    );


                if (
                    !relasiMap.has(
                        planningId
                    )
                ) {

                    relasiMap.set(
                        planningId,
                        []
                    );

                }


                relasiMap
                    .get(planningId)
                    .push(
                        relation
                    );

            }
        );

    }


    return dataPlanning
        .map(item => {

            if (!item) {

                return null;

            }


            const relasi =
                relasiMap.get(
                    String(item.id)
                ) || [];


            const daftarKaryawan =
                relasi
                    .map(
                        relation => {

                            const karyawanId =
                                String(
                                    relation.karyawan_id
                                );


                            const data =
                                karyawanMap.get(
                                    karyawanId
                                );


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

                        }
                    )
                    .filter(Boolean);


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


            const idPlanning =
                item.kode_planning ??
                String(item.id);


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
   HANYA DIGUNAKAN SAAT INITIAL LOAD /
   REFRESH MANUAL
===================================================== */

async function loadDatabase() {

    if (!cekSupabase()) {

        return false;

    }


    try {

        console.log(
            "Mengambil data dari Supabase..."
        );


        /* =============================================
           KARYAWAN
        ============================================= */

        /*
           Hanya SATU request karyawan.
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


                        normalized.databaseId =
                            item.id;

                        normalized.idDatabase =
                            item.id;


                        return normalized;

                    })
                    .filter(Boolean)
                : [];


        window.karyawan =
            karyawan;


        databaseKaryawanSnapshot =
            cloneData(karyawan);


        /* =============================================
           PLANNING
        ============================================= */

        const dataPlanning =
            await loadPlanningSupabase();


        /* =============================================
           RELASI
        ============================================= */

        const dataRelasi =
            await loadRelasiPlanningSupabase();


        /* =============================================
           BENTUK PLANNING
        ============================================= */

        planning =
            bentukDataPlanning(
                dataPlanning,
                dataRelasi,
                karyawan
            );


        window.planning =
            planning;


        databasePlanningSnapshot =
            cloneData(planning);


        /* =============================================
           READY
        ============================================= */

        databaseReady =
            true;


        document.dispatchEvent(
            new CustomEvent(
                "databaseReady"
            )
        );


        refreshUI();


        console.log(
            "Supabase database ready."
        );


        console.log(
            "Karyawan:",
            karyawan.length
        );


        console.log(
            "Planning:",
            planning.length
        );


        return true;

    }
    catch (error) {

        databaseReady =
            false;


        console.error(
            "DATABASE ERROR:",
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


        return false;

    }

}


/* =====================================================
   REFRESH UI
===================================================== */

function refreshUI() {

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
   SIMPAN KARYAWAN - OPTIMIZED
===================================================== */

async function simpanKaryawanSupabase() {

    if (!cekSupabase()) {

        return false;

    }


    try {

        const current =
            getKaryawan();


        const oldSnapshot =
            Array.isArray(
                databaseKaryawanSnapshot
            )
                ? databaseKaryawanSnapshot
                : [];


        /*
           Buat map data lama
           supaya tidak perlu .find()
           berulang-ulang.
        */

        const oldMap =
            new Map();


        oldSnapshot.forEach(
            item => {

                oldMap.set(
                    normalizeId(item.id),
                    item
                );

            }
        );


        const currentMap =
            new Map();


        current.forEach(
            item => {

                currentMap.set(
                    normalizeId(item.id),
                    item
                );

            }
        );


        /*
           INSERT / UPDATE hanya data
           yang berubah.
        */

        const changedData = [];


        current.forEach(
            item => {

                const id =
                    normalizeId(item.id);


                if (!id || !item.nama) {

                    return;

                }


                const old =
                    oldMap.get(id);


                const currentData = {

                    kode_karyawan:
                        id,

                    nama:
                        String(
                            item.nama ?? ""
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


                /*
                   Data baru
                */

                if (!old) {

                    changedData.push(
                        currentData
                    );

                    return;

                }


                /*
                   Data berubah
                */

                const oldNama =
                    String(
                        old.nama ?? ""
                    ).trim();


                const oldStatus =
                    String(
                        old.status ??
                        "AKTIF"
                    )
                    .trim()
                    .toUpperCase();


                const oldAlasan =
                    String(
                        old.alasanPenalti ??
                        ""
                    ).trim();


                if (
                    oldNama !==
                    currentData.nama ||

                    oldStatus !==
                    currentData.status ||

                    oldAlasan !==
                    currentData.alasan_penalti
                ) {

                    changedData.push(
                        currentData
                    );

                }

            }
        );


        /*
           Kalau ada data berubah,
           kirim hanya data tersebut.
        */

        if (
            changedData.length > 0
        ) {

            const {
                error
            } =
                await supabaseClient
                    .from("karyawan")
                    .upsert(
                        changedData,
                        {
                            onConflict:
                                "kode_karyawan"
                        }
                    );


            if (error) {

                throw error;

            }

        }


        /*
           Cari data yang dihapus.
        */

        const deleted =
            oldSnapshot.filter(
                oldItem => {

                    const id =
                        normalizeId(
                            oldItem.id
                        );


                    return (
                        id &&
                        !currentMap.has(id)
                    );

                }
            );


        /*
           Hapus data satu per satu.
           Biasanya jumlahnya hanya 1.
        */

        for (
            const item of deleted
        ) {

            const id =
                normalizeId(
                    item.id
                );


            const {
                error
            } =
                await supabaseClient
                    .from("karyawan")
                    .delete()
                    .eq(
                        "kode_karyawan",
                        id
                    );


            if (error) {

                throw error;

            }

        }


        /*
           Update snapshot lokal.
        */

        databaseKaryawanSnapshot =
            cloneData(
                current
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
   SIMPAN PENALTI - OPTIMIZED
===================================================== */

async function simpanPenaltiSupabase() {

    if (!cekSupabase()) {

        return false;

    }


    try {

        /*
           Hanya cari karyawan yang berubah
           berdasarkan snapshot.
        */

        const current =
            getKaryawan();


        const old =
            Array.isArray(
                databaseKaryawanSnapshot
            )
                ? databaseKaryawanSnapshot
                : [];


        const oldMap =
            new Map();


        old.forEach(
            item => {

                oldMap.set(
                    normalizeId(item.id),
                    item
                );

            }
        );


        const changed =
            current.filter(
                item => {

                    const id =
                        normalizeId(
                            item.id
                        );


                    const previous =
                        oldMap.get(id);


                    if (!previous) {

                        return false;

                    }


                    return (

                        String(
                            previous.status ??
                            "AKTIF"
                        )
                        .trim()
                        .toUpperCase() !==

                        String(
                            item.status ??
                            "AKTIF"
                        )
                        .trim()
                        .toUpperCase()

                    ) ||

                    String(
                        previous.alasanPenalti ??
                        ""
                    ).trim() !==

                    String(
                        item.alasanPenalti ??
                        ""
                    ).trim();

                }
            );


        /*
           Tidak ada perubahan penalti.
           Tidak perlu request apa pun.
        */

        if (
            changed.length === 0
        ) {

            return true;

        }


        /*
           Ambil ID database hanya
           untuk karyawan yang berubah.
        */

        const kodeList =
            changed.map(
                item =>
                    normalizeId(
                        item.id
                    )
            );


        const {
            data,
            error
        } =
            await supabaseClient
                .from("karyawan")
                .select(
                    "id, kode_karyawan"
                )
                .in(
                    "kode_karyawan",
                    kodeList
                );


        if (error) {

            throw error;

        }


        if (!Array.isArray(data)) {

            return true;

        }


        const databaseMap =
            new Map();


        data.forEach(
            item => {

                databaseMap.set(
                    normalizeId(
                        item.kode_karyawan
                    ),
                    item.id
                );

            }
        );


        /*
           Proses penalti yang berubah saja.
        */

        for (
            const aplikasi
            of changed
        ) {

            const kode =
                normalizeId(
                    aplikasi.id
                );


            const databaseId =
                databaseMap.get(
                    kode
                );


            if (!databaseId) {

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


            /*
               PENALTI
            */

            if (
                status ===
                "PENALTI"
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
                            databaseId
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
                                    databaseId,

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

            /*
               LEPAS PENALTI
            */

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
                            databaseId
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
   LOGIKA TETAP SAMA
===================================================== */

async function simpanPlanningSupabase() {

    if (!cekSupabase()) {

        return false;

    }


    try {

        const currentPlanning =
            getPlanning();


        const currentPlanningIds =
            currentPlanning
                .map(
                    item =>
                        String(
                            item.idPlanning ??
                            item.id ??
                            ""
                        ).trim()
                )
                .filter(Boolean);


        /*
           Proses planning satu per satu
        */

        for (
            const item
            of currentPlanning
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


            /*
               Hapus relasi lama
            */

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


            /*
               Ambil daftar karyawan
            */

            const daftar =
                Array.isArray(
                    item.karyawan
                )
                    ? item.karyawan
                    : [];


            /*
               OPTIMASI:
               Ambil semua ID karyawan
               dalam SATU query.
            */

            const kodeKaryawanList =
                daftar
                    .map(
                        dataKaryawan =>
                            normalizeId(
                                dataKaryawan.id
                            )
                    )
                    .filter(Boolean);


            if (
                kodeKaryawanList.length === 0
            ) {

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
                    .select(
                        "id, kode_karyawan"
                    )
                    .in(
                        "kode_karyawan",
                        kodeKaryawanList
                    );


            if (karyawanError) {

                throw karyawanError;

            }


            const databaseKaryawanMap =
                new Map();


            if (
                Array.isArray(
                    karyawanDB
                )
            ) {

                karyawanDB.forEach(
                    itemDB => {

                        databaseKaryawanMap.set(
                            normalizeId(
                                itemDB.kode_karyawan
                            ),
                            itemDB.id
                        );

                    }
                );

            }


            /*
               Buat semua relasi sekaligus.
            */

            const relationInsert =
                kodeKaryawanList
                    .map(
                        kode => {

                            const databaseId =
                                databaseKaryawanMap.get(
                                    kode
                                );


                            if (!databaseId) {

                                console.warn(
                                    "Karyawan tidak ditemukan:",
                                    kode
                                );

                                return null;

                            }


                            return {

                                planning_id:
                                    planningId,

                                karyawan_id:
                                    databaseId

                            };

                        }
                    )
                    .filter(Boolean);


            /*
               INSERT RELASI SEKALIGUS
            */

            if (
                relationInsert.length > 0
            ) {

                const {
                    error:
                        relationError
                } =
                    await supabaseClient
                        .from(
                            "planning_karyawan"
                        )
                        .insert(
                            relationInsert
                        );


                if (relationError) {

                    throw relationError;

                }

            }

        }


        /*
           HAPUS PLANNING
        */

        const deletedPlanning =
            databasePlanningSnapshot
                .filter(
                    oldItem => {

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

                    }
                );


        for (
            const item
            of deletedPlanning
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


        /*
           Update snapshot
        */

        databasePlanningSnapshot =
            cloneData(
                currentPlanning
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
   SIMPAN SEMUA DATA - OPTIMIZED
===================================================== */

async function simpanData() {

    if (!databaseReady) {

        alert(
            "Database belum siap. Tunggu sebentar lalu coba lagi."
        );

        return false;

    }


    console.log(
        "Menyimpan perubahan..."
    );


    /*
       Simpan karyawan yang berubah saja.
    */

    const karyawanBerhasil =
        await simpanKaryawanSupabase();


    if (!karyawanBerhasil) {

        return false;

    }


    /*
       Simpan penalti yang berubah saja.
    */

    const penaltiBerhasil =
        await simpanPenaltiSupabase();


    if (!penaltiBerhasil) {

        return false;

    }


    /*
       Planning tetap diproses.
       Namun tidak reload database setelahnya.
    */

    const planningBerhasil =
        await simpanPlanningSupabase();


    if (!planningBerhasil) {

        return false;

    }


    /*
       Snapshot lokal sudah diperbarui.
    */

    databaseKaryawanSnapshot =
        cloneData(
            getKaryawan()
        );


    databasePlanningSnapshot =
        cloneData(
            getPlanning()
        );


    /*
       TIDAK ADA:
       await loadDatabase();

       Jadi setelah CRUD tidak
       mengambil seluruh database lagi.
    */


    console.log(
        "Perubahan berhasil disimpan."
    );


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
   EXPORT GLOBAL
===================================================== */

window.getKaryawan =
    getKaryawan;

window.getPlanning =
    getPlanning;

window.getKaryawanAktifDatabase =
    getKaryawanAktifDatabase;

window.loadDatabase =
    loadDatabase;

window.refreshDatabase =
    refreshDatabase;

window.simpanData =
    simpanData;

window.saveDatabase =
    saveDatabase;

window.simpanDatabase =
    simpanDatabase;

window.isDatabaseReady =
    isDatabaseReady;

window.tungguDatabaseReady =
    tungguDatabaseReady;


/* =====================================================
   INITIAL DATABASE
===================================================== */

databaseReadyPromise =
    loadDatabase();


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

    }
);
