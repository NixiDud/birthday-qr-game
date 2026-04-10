# Birthday QR App Starter

Šī ir pirmā darba versija tavam projektam.

## Kas jau strādā
- sākuma ekrāns ar vārda ievadi
- slepenā koda piešķiršana
- dashboard ar badge blokiem
- kameras / QR scan lapa
- testēšanas režīms, ja lokāli kamera nestrādā
- QR1, QR3, QR4, QR5 pamatplūsma
- aizsardzība pret viena un tā paša QR atkārtotu pabeigšanu vienā sesijā

## Kas vēl nav līdz galam gatavs
- īstā Supabase datubāze
- admin panelis ar reāliem datiem
- QR2 ar slepenā koda loģiku
- QR6 burtu spēle
- īstā laika summēšana ar bonusiem

## 1. solis — atvēršana VS Code

Atver termināli projekta mapē un palaid:

```bash
npm install
npm run dev
```

Atver pārlūkā:

```bash
http://localhost:3000
```

## Ja kamera lokāli nestrādā
Tas ir normāli. Dažreiz kamera labāk strādā uz deploy vai HTTPS vidē.
Tāpēc scan lapā ir testēšanas pogas ar `QR1` līdz `QR6`.

## Nākamais solis
Pēc šī mēs ejam uz Supabase:
1. izveido tabulas
2. ieliec slepeno kodu bibliotēku
3. pārejam no mock datiem uz īsto DB
