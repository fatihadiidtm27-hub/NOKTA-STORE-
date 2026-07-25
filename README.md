# NOKTA STORE

Halaman jualan publik untuk semua tools **NOKTA Creator Suite**. Menampilkan produk satuan dan paket bundling, tombol beli langsung ke WhatsApp.

## WAJIB diisi sebelum publish

Buka `app.js`, ganti:
1. **`WA_NUMBER`** — nomor WhatsApp asli kamu (format `62812xxxxxxx`, tanpa `+` atau spasi)
2. **`price`** di tiap produk & bundle — sesuaikan harga jual asli
3. **`link`** di tiap produk — ganti dengan URL GitHub Pages tools yang sudah kamu deploy (nokta-clip, nokta-reframe, nokta-voice, nokta-pdf-studio)

## Cara kerja pembelian (manual, tanpa payment gateway)

1. Pembeli ketuk tombol **Beli** → otomatis buka WhatsApp dengan pesan terisi produk & harga
2. Kamu balas dengan info transfer GoPay
3. Setelah bayar, kamu generate kode akses dan kirim ke pembeli (lihat bagian di bawah)
4. Pembeli masukkan kode itu ke aplikasi yang dibeli

## Sistem kode: single product vs bundle

Semua tools NOKTA (Clip, Reframe, Voice, PDF) memakai **satu gist yang sama** untuk cek kode, tapi sekarang setiap kode bisa diatur mau buka tools yang mana saja. Format baru di `codes.json`:

```json
{
  "codes": [
    "KODE-LAMA-1",
    { "code": "BUDI-CLIP", "products": ["clip"] },
    { "code": "SITI-BUNDLE", "products": ["clip", "reframe", "voice", "pdf"] },
    { "code": "ANDI-ALL", "products": ["all"] }
  ]
}
```

- **Kode lama** (cuma teks tanpa `products`) tetap otomatis dianggap "buka semua" — tidak perlu diubah, tetap kompatibel.
- **Kode single product**: isi `"products"` dengan salah satu dari `"clip"`, `"reframe"`, `"voice"`, `"pdf"` — kode itu HANYA berfungsi di tools tersebut.
- **Kode bundle**: isi `"products"` dengan beberapa key sekaligus, atau cukup `["all"]` untuk buka semua tools.

### Cara menambah kode setelah ada penjualan
1. Buka gist `codes.json` kamu di `gist.github.com`, ketuk Edit
2. Tambahkan entri baru sesuai jenis pembelian (contoh di atas)
3. Simpan ("Update public gist")
4. Kirim kodenya ke pembeli lewat WhatsApp

## Deploy ke GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit: NOKTA Store"
git branch -M main
git remote add origin https://github.com/<username>/<nama-repo>.git
git push -u origin main
```
Lalu **Settings → Pages** → Source: branch `main`, folder `/ (root)` → Save.

## Penting: update juga auth-gate.js di tiap tools
Tools NOKTA yang sudah ada (Clip, Reframe, Voice, PDF Studio) perlu di-upload ulang dengan `auth-gate.js` versi terbaru yang mendukung sistem `products` ini — kalau belum, upload ulang file `auth-gate.js` masing-masing tools ke repo masing-masing.
