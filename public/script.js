// Kadir Sadi Civelek

// tarif formunu gönderdiğimizde çalışacak fonksiyonu yazıyoruz
document.getElementById('tarifForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // sayfanın yenilenmesini engelliyoruz
    
    // formdaki verileri alıp FormData nesnesine ekliyoruz çünkü resim yükleyeceğiz
    const formData = new FormData();
    formData.append('ad', document.getElementById('tarifAdi').value);
    formData.append('malzemeler', document.getElementById('malzemeler').value);
    formData.append('yapilis', document.getElementById('yapilisi').value);
    formData.append('kategori', document.getElementById('kategori').value);
    
    // kullanıcı resim seçtiyse onu da ekliyoruz
    const resimDosyasi = document.getElementById('tarifResmi').files[0];
    if (resimDosyasi) {
        formData.append('resim', resimDosyasi);
    }

    try {
        // sunucuya veriyi gönderiyoruz
        const yanit = await fetch('/api/tarifler', {
            method: 'POST',
            body: formData 
        });

        if (yanit.ok) {
            // başarılı olduysa formu temizleyip tarifleri yeniden yüklüyoruz
            this.reset();
            document.getElementById('onizleme').style.backgroundImage = '';
            tarifleriYukle();
        }
    } catch (hata) {
        console.error('Tarif eklenemedi:', hata);
    }
});

// tarifleri sunucudan alıp sayfada gösteriyoruz
async function tarifleriYukle() {
    try {
        const yanit = await fetch('/api/tarifler');
        const tarifler = await yanit.json();
        tarifleriGoster(tarifler);
    } catch (hata) {
        console.error('Tarifler yüklenemedi:', hata);
    }
}

// her tarif için güzel bir kart oluşturuyoruz
function tarifleriGoster(tarifler) {
    const tarifListesi = document.getElementById('tarifListesi');
    tarifListesi.innerHTML = '';

    tarifler.forEach(tarif => {
        const tarifKarti = document.createElement('div');
        tarifKarti.className = 'tarif_karti';
        // resim varsa onu da ekliyoruz, yoksa sadece yazıları gösteriyoruz
        tarifKarti.innerHTML = `
            ${tarif.resimYolu ? `<div class="tarif_resmi" style="background-image: url('${tarif.resimYolu}')"></div>` : ''}
            <h3>${tarif.ad}</h3>
            <span class="kategori_rozeti">${tarif.kategori}</span>
            <h4>Malzemeler</h4>
            <p>${tarif.malzemeler}</p>
            <h4>Yapılışı</h4>
            <p>${tarif.yapilis}</p>
        `;
        tarifListesi.appendChild(tarifKarti);
    });
}

// arama yapıldığında ve kategori seçildiğinde filtreleme yapıyoruz
document.getElementById('aramaKutusu').addEventListener('input', tarifleriFiltrele);
document.getElementById('kategoriFiltre').addEventListener('change', tarifleriFiltrele);

// tarifleri filtreleyip gösteriyoruz
async function tarifleriFiltrele() {
    const aramaMetni = document.getElementById('aramaKutusu').value.toLowerCase();
    const secilenKategori = document.getElementById('kategoriFiltre').value;
    
    const yanit = await fetch('/api/tarifler');
    const tarifler = await yanit.json();
    
    // hem isim hem de kategoriye göre filtreleme yapıyoruz
    const filtreliTarifler = tarifler.filter(tarif => {
        const isimUyuyor = tarif.ad.toLowerCase().includes(aramaMetni);
        const kategoriUyuyor = !secilenKategori || tarif.kategori === secilenKategori;
        return isimUyuyor && kategoriUyuyor;
    });
    
    tarifleriGoster(filtreliTarifler);
}

// sayfa yüklendiğinde tarifleri gösteriyoruz
window.addEventListener('load', tarifleriYukle);

// resim seçildiğinde önizleme gösteriyoruz
document.getElementById('tarifResmi').addEventListener('change', function(e) {
    const dosya = e.target.files[0];
    if (dosya) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('onizleme').style.backgroundImage = `url(${e.target.result})`;
        }
        reader.readAsDataURL(dosya);
    }
});

// kullanıcı girişi için form kontrolü yapıyoruz
document.getElementById('girisForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    const sifre = this.querySelector('input[type="password"]').value;
    
    try {
        const yanit = await fetch('/api/giris', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, sifre })
        });
        
        if (yanit.ok) {
            document.getElementById('girisModal').style.display = 'none';
            // başarılı giriş mesajını gösteriyoruz
        }
    } catch (hata) {
        console.error('Giriş hatası:', hata);
    }
});

// tariflere puan vermek için yıldızları oluşturuyoruz
function yildizlariOlustur(puan = 0) {
    const yildizlarDiv = document.createElement('div');
    yildizlarDiv.className = 'yildizlar';
    
    for(let i = 1; i <= 5; i++) {
        const yildiz = document.createElement('span');
        yildiz.className = `yildiz ${i <= puan ? 'aktif' : ''}`;
        yildiz.innerHTML = '★';
        yildiz.dataset.puan = i;
        yildiz.onclick = function() {
            const seciliPuan = this.dataset.puan;
            puanVer(seciliPuan);
        };
        yildizlarDiv.appendChild(yildiz);
    }
    
    return yildizlarDiv;
}

// Kadir Sadi Civelek