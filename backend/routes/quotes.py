from fastapi import APIRouter

router = APIRouter(tags=["quotes"])

STUDY_QUOTES = [
    {
        "text": "Pendidikan adalah senjata paling mematikan di dunia, karena dengan itu Anda bisa mengubah dunia.",
        "author": "Nelson Mandela",
    },
    {
        "text": "Jangan biarkan apa yang tidak bisa Anda lakukan menghalangi apa yang bisa Anda lakukan.",
        "author": "John Wooden",
    },
    {
        "text": "Masa depan adalah milik mereka yang percaya pada keindahan impian mereka.",
        "author": "Eleanor Roosevelt",
    },
    {
        "text": "Kesuksesan bukanlah kebetulan. Ia adalah kerja keras, ketekunan, belajar, berkorban, dan cinta akan apa yang sedang kamu lakukan.",
        "author": "Pelé",
    },
    {
        "text": "Investasi terbaik dalam hidup adalah investasi pada otak, pengetahuan, dan kebiasaan hebat.",
        "author": "Benjamin Franklin",
    },
    {
        "text": "Belajar memang melelahkan, tapi akan jauh lebih melelahkan jika saat ini dan di masa depan kamu tidak memiliki ilmu.",
        "author": "Dr. H. Moh. Hatta",
    },
    {
        "text": "Orang-orang yang berhenti belajar akan menjadi pemilik masa lalu. Orang-orang yang masih terus belajar, akan menjadi pemilik masa depan.",
        "author": "Mario Teguh",
    },
    {
        "text": "Fokuslah pada proses, bukan hanya pada hasil. Setiap detik fokus yang kamu tabung hari ini adalah pilar kesuksesanmu esok.",
        "author": "Inspirator Belajar",
    },
    {
        "text": "Bila kamu tidak tahan penatnya belajar, maka kamu harus menanggung perihnya kebodohan.",
        "author": "Imam Syafi'i",
    },
    {
        "text": "Disiplin adalah jembatan penghubung antara cita-cita besar dan pencapaian luar biasa.",
        "author": "Jim Rohn",
    },
    {
        "text": "Kunci meraih kesuksesan akademik bukanlah kepintaran mutlak, melainkan konsistensi kecil yang dilakukan secara terus menerus tanpa menyerah.",
        "author": "Ki Hajar Dewantara",
    },
    {
        "text": "Setiap kegagalan dalam memahami bab pelajaran hari ini adalah satu langkah maju mendekati pemahaman sejati di hari esok. Lanjutkan langkahmu!",
        "author": "Fokus Karir",
    },
    {
        "text": "Mimpi tidak akan pernah menjadi kenyataan jika kita hanya berdiam diri tanpa belajar dan berusaha keras.",
        "author": "B.J. Habibie",
    },
    {
        "text": "Belajar adalah satu-satunya hal yang tidak pernah membuat pikiran lelah, tidak pernah takut, dan tidak pernah menyesal.",
        "author": "Leonardo da Vinci",
    },
    {
        "text": "Pendidikan bukanlah proses mengisi wadah yang kosong, melainkan proses menyalakan api pikiran agar terus membara.",
        "author": "William Butler Yeats",
    },
    {
        "text": "Hiduplah seolah-olah kamu akan mati besok. Belajarlah seolah-olah kamu akan hidup selamanya.",
        "author": "Mahatma Gandhi",
    },
    {
        "text": "Jangan takut salah saat belajar. Setiap kesalahan mengajarkan kita satu cara baru untuk melakukan sesuatu dengan lebih baik.",
        "author": "Thomas Alva Edison",
    },
    {
        "text": "Kesuksesan adalah totalitas dari usaha-usaha kecil yang diulang dan konsisten ditekuni hari demi hari tanpa kenal lelah.",
        "author": "Robert Collier",
    },
    {
        "text": "Pendidikan dasar terbaik adalah membaca buku bermutu, berdiskusi dengan orang bijak, dan membiasakan diri menulis gagasan.",
        "author": "Tan Malaka",
    },
]


@router.get("/quotes")
async def get_quotes():
    return {"success": True, "data": STUDY_QUOTES}
