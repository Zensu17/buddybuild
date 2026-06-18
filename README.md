# 🎓 BuddyBuild | Your Ultimate University Companion

<div align="center">
  <p align="center">
    <strong>Satu aplikasi pintar untuk mengelola jadwal kuliah, tugas, nilai, dan sesi belajar bertenaga AI secara gamified.</strong>
  </p>
</div>

---

## 🌟 Apa itu BuddyBuild?

**BuddyBuild** adalah platform digital all-in-one yang dirancang khusus untuk mahasiswa demi menyederhanakan kehidupan perkuliahan. Dari pelacakan jadwal harian, manajemen tugas mendesak, kalkulasi IPK otomatis, hingga sesi belajar fokus dengan pemutar suara latar ambient, BuddyBuild menyatukan seluruh aspek akademis dan kesejahteraan mental (*student wellness*) ke dalam satu antarmuka modern yang interaktif.

Dilengkapi dengan integrasi **Gemini AI**, BuddyBuild membantu Anda memahami topik sulit melalui tutor AI cerdas, serta membuat kartu flashcard secara otomatis hanya dengan mengetik subjek mata kuliah Anda.

---

## 🚀 Fitur Utama (Core Features)

### 🤖 1. AI Study Buddy (Asisten Cerdas Gemini)
- **Tutor Interaktif**: Sesi obrolan terstruktur yang ramah dengan format langkah-demi-langkah (Step-by-Step).
- **Mode Belajar Spesifik**: Pilih profil asisten seperti *Coding Helper*, *Conceptual Tutor*, atau *Language Teacher* untuk menyesuaikan gaya bantuan.
- **Tips Belajar Otomatis**: Setiap jawaban AI dilengkapi dengan bagian penutup `Tips Belajar BuddyBuild` berisi strategi ingatan praktis atau teknik mnemonic.

### 🎴 2. AI Flashcard Generator
- **Generasi Kartu Cepat**: Masukkan topik dan mata kuliah, dan AI akan otomatis menghasilkan 6 kartu flashcard konsep kunci.
- **Interaksi 3D Flip**: UI kartu interaktif dengan efek balik 3 dimensi (framer-motion) untuk memperkuat memori (Active Recall).

### 📅 3. Timetable & Task Manager
- **Jadwal Kuliah Mingguan**: Jadwal interaktif berkode warna untuk melacak ruang kelas dan waktu kuliah Anda.
- **Daftar Tugas & Ujian**: Manajemen tugas terintegrasi lengkap dengan indikator urgensi (Countdown) dan tingkat prioritas (Tinggi, Sedang, Rendah).
- **Audit Logs**: Riwayat pelacakan modifikasi akademis untuk transparansi perubahan jadwal dan agenda.

### 📈 4. GPA Calculator
- **Pemantau Indeks Prestasi**: Kalkulator interaktif per-semester untuk melacak SKS (Credits) dan IP (GPA) secara visual melalui grafik tren perkembangan akademis Anda.

### 🪴 5. Gamified Study Garden (Kebun Belajar)
- **Belajar Sambil Berkebun**: Tingkatkan motivasi dengan menanam benih (Bunga Matahari, Sakura Bonsai, Lavender, Magic Fern).
- **Penyiraman Berbasis Aktivitas**: Gunakan tetesan air (*droplets*) yang didapatkan dari penyelesaian tugas nyata untuk menyiram tanaman hingga tumbuh besar dan memanen XP.

### 🎵 6. Zen Sound Player & Audio Mixer
- **Mixer Audio Relaksasi**: Putar dan gabungkan audio santai seperti white noise, cafe ambient, suara burung, dan hujan lebat.
- **Visualizer Audio**: Dilengkapi dengan grafik visualizer Canvas responsif untuk menjaga fokus tetap optimal saat sesi belajar.

---

## 🛠️ Tech Stack & Arsitektur Hardened

Aplikasi ini dibangun menggunakan arsitektur modern berkinerja tinggi:
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS 4 + Framer Motion (Animasi Lancar).
- **Backend**: Python + FastAPI + Uvicorn (Modular routes & services).
- **Database & Auth**: Firebase Firestore (Keamanan granular via Rules) + Firebase Authentication.
- **AI Engine**: `google-genai` Python SDK (Menghubungkan ke model canggih `gemini-3.5-flash`).

### 🛡️ Fitur Keamanan Tambahan
- **API Key Proxy**: Tidak ada kunci API Gemini yang bocor ke browser. Seluruh pemanggilan AI diproksi aman di sisi server.
- **Rate Limiting**: AI router terlindung dari eksploitasi kuota dengan pembatasan 10 permintaan per menit per IP.
- **Payload Validation**: Input pengguna divalidasi ketat sebelum diproses oleh sistem AI.

---