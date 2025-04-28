// Kadir Sadi Civelek
// nodejs için gerekli paketleri yüklüyoruz
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// sunucuyu başlatıyoruz ve 3000 portunu kullanıyoruz
const app = express();
const port = 3000;

// json verilerini okuyabilmek için bu middleware'i ekliyoruz
app.use(bodyParser.json());
// public klasöründeki dosyalara erişim için static middleware ekliyoruz
app.use(express.static(path.join(__dirname, 'public')));

// resim yüklemek için multer kullanıyoruz, uploads klasörüne kaydediyoruz
const upload = multer({ dest: 'public/uploads/' });

// json dosyamızın yolunu belirliyoruz, tarifleri burada tutuyoz
const DB_FILE = 'tarifler.json';

// json dosyası yoksa boş bir tane oluşturuyoruz
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// tarifleri getirmek için bir endpoint yapıyoruz
app.get('/api/tarifler', (req, res) => {
    const tarifler = JSON.parse(fs.readFileSync(DB_FILE));
    res.json(tarifler);
});

// yeni tarif eklemek için endpoint, resimle beraber
app.post('/api/tarifler', upload.single('resim'), (req, res) => {
    const { ad, malzemeler, yapilis, kategori } = req.body;
    const tarifler = JSON.parse(fs.readFileSync(DB_FILE));
    
    // yeni tarifi oluşturuyoruz, resim varsa onun yolunu da ekliyoruz
    const yeniTarif = {
        id: Date.now(), // benzersiz id için şuanki zamanı kullanıyoruz
        ad,
        malzemeler,
        yapilis,
        kategori,
        resimYolu: req.file ? `/uploads/${req.file.filename}` : null
    };
    
    // tarifi listeye ekleyip json dosyasına kaydediyoruz
    tarifler.push(yeniTarif);
    fs.writeFileSync(DB_FILE, JSON.stringify(tarifler, null, 2));
    
    res.json(yeniTarif);
});

// Resim yükleme endpoint'i
app.post('/api/resim-yukle', upload.single('resim'), (req, res) => {
    if (req.file) {
        res.json({ dosyaYolu: '/uploads/' + req.file.filename });
    } else {
        res.status(400).json({ hata: 'Resim yüklenemedi' });
    }
});

// Puanlama endpoint'i
app.post('/api/puan', (req, res) => {
    const { tarifId, puan } = req.body;
    // Puanı JSON dosyasına kaydet
    res.json({ mesaj: 'Puan kaydedildi' });
});

// Kullanıcı girişi endpoint'i
app.post('/api/giris', (req, res) => {
    const { email, sifre } = req.body;
    // Kullanıcı doğrulama işlemi
    res.json({ mesaj: 'Giriş başarılı' });
});

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});