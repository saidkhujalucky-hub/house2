# MarketPlace — frontend (NestJS backendni o‘zgartirmaydi)

Bu **alohida, dependenciesiz HTML / CSS / JavaScript frontend**. Dizayn: qora-binafsha, villa hero banneri, kategoriya kartalari, e’lonlar katalogi, uy tafsilotlari, login, register, profil va ADMIN kategoriyalari.

## 1. Ishga tushirish

1. **Eski NestJS backendni** odatdagidek alohida ishga tushiring. PostgreSQL va `.env` ni backend uchun odatdagidek sozlang.
2. `frontend/config.js` ichidagi `apiBaseUrl` sizning NestJS API manzilingizga teng bo‘lsin, masalan `http://localhost:3000`.
3. Windowsda **`start.bat`** ni ikki marta bosing yoki frontend papkasida terminal orqali ishga tushiring:

   ```bash
   npm start
   ```

   Keyin `http://localhost:5500` ni oching. VS Code Live Server yoki `python -m http.server 5500` ham ishlaydi. Faylni `file://` orqali ikki marta bosib emas, HTTP server bilan ochish kerak, chunki ES Modules ishlatilgan.

**npm install kerak emas.** Frontendning ishlashi uchun Node.js mavjud bo‘lsa, `npm start` yetarli; qo‘shimcha paket o‘rnatilmaydi.

## 2. GitHub Pages yoki Cloudflare Pages

`frontend` ichidagi `index.html`, `app.js`, `api.js`, `config.js`, `styles.css` va `assets/` ni saytning public root papkasiga qo‘ying. GitHub Pages uchun `main / (root)` yoki `/docs` ga ko‘chirib qo‘ying; Cloudflare Pages uchun build command bo‘sh, output directory esa sayt fayllari turgan papka bo‘ladi. Sahifalar `#/...` orqali ishlaydi, shuning uchun routing konfiguratsiyasi kerak emas.

**Muhim:** Frontend HTTPS manzilda bo‘lsa, unga ulangan backend ham HTTPS orqali ochiq bo‘lishi kerak. `localhost:3000` internetdagi foydalanuvchilar uchun ishlamaydi. Backendni alohida deploy qiling yoki mavjud ochiq HTTPS API URLini `config.js` ga yozing.

## 3. Mavjud backend bilan real ishlaydigan qismlar

| UI | API |
|---|---|
| Ro‘yxatdan o‘tish | `POST /auth/register` (`fullName`, `email`, `password`, ixtiyoriy `phone`) |
| Tizimga kirish | `POST /auth/login` (`email`, `password`) → `accessToken`, `user` |
| Profilni ko‘rish | `GET /users/me` (Bearer token) |
| Profilni tahrirlash | `PATCH /users/me` (`fullName`, `phone`) |
| Kategoriyalar | `GET /categories` |
| ADMIN kategoriya qo‘shishi | `POST /categories` (`name`, `slug`) |
| ADMIN kategoriya tahrirlashi | `PATCH /categories/:id` |
| ADMIN kategoriya o‘chirishi | `DELETE /categories/:id` |

JWT **sessionStorage** da saqlanadi (tab yopilganda o‘chadi). Foydalanuvchi ro‘yxatdan o‘tgach login qiladi; backend ro‘yxatdan o‘tishda JWT qaytarmaydi.

### Hozir faqat demo bo‘lgan qismlar

- Uy-joy e’lonlari va filtrlar: 8 ta frontendga qo‘shilgan misol. `GET/POST /properties` endpointlari yo‘q, shuning uchun serverdan haqiqiy e’lon olinmaydi yoki yozilmaydi.
- Sevimlilar: faqat **localStorage**, serverda sinxronlanmaydi.
- Sotuvchiga xabar: frontend xabar beradi, lekin backendga jo‘natmaydi (`Inquiry` API yo‘q).
- Admin kategoriya sahifasida foydalanuvchilar statistikasi va e’lonlar soni o‘ylab topilmagan.
- Rasmlar dizayn namunasi sifatida berilgan; real e’lonlar fotosi emas.

### Muhim mavjud backend cheklovi

Asl NestJS kodida `categories.controller.ts` ichida `@Param('id') id: number` yozilgan, lekin `ParseIntPipe` yo‘q. Shuning uchun `PATCH`/`DELETE /categories/:id` Prisma bilan raqam turi bo‘yicha xato berishi mumkin. **Bu paket backendni tuzatmaydi yoki o‘zgartirmaydi**; frontend faqat backend xatosini ko‘rsatadi.

## 4. Papkalar

```text
frontend/
  index.html          # asosiy kirish
  styles.css          # to‘liq responsive dizayn
  app.js              # sahifalar, qidiruv, navigatsiya va demo katalog
  api.js              # real backend bilan fetch yordamida bog‘lanish
  config.js           # faqat API URL sozlamasi
  assets/             # lokal rasm va SVG belgisi
  package.json        # npm start, dependency yo‘q
  server.mjs           # Node.js lokal statik server (faqat frontend)
  start.bat            # Windows uchun bir bosishda ishga tushirish
  README.md
```

**Backendga birorta ham o‘zgartirish kiritilmagan.**


## Premium va yangi workflow

Frontendga e’lon joylash, foto yuklash, sevimlilarni serverda saqlash, xabar yuborish va sotuvchining kelgan xabarlari uchun API integratsiyasi qo‘shilgan. Ular NestJS backendidagi yangi /properties va /favorites endpointlari ishga tushganda haqiqiy ishlaydi. GitHub Pages o‘zi backend vazifasini bajarmaydi. 3D sahifa va barcha mavjud login/kategoriya imkoniyatlari saqlangan.
