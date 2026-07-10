# Codex Accounts Manager 🌍 (English & Polish)

[English Version](#english) | [Wersja Polska](#polski)

---

<a name="english"></a>
# 🇬🇧 English

**Codex Accounts Manager** is a simple yet powerful GUI tool designed to manage multiple Codex CLI accounts. It helps you seamlessly bypass rate limits by instantly switching between configured accounts using isolated authentication environments (`CODEX_HOME`).

## Features
- 🔄 **Auto-Refresh & Live Status** - Automatically checks account limits and calculates the exact cooldown time.
- ⚡ **Global Login (Use in CMD)** - With one click, switch your currently active account and use it across all terminals on your system.
- 🔔 **Notifications & Sounds** - The app plays a sound and sends a Windows notification as soon as any blocked account becomes available.
- 隔離 **Account Isolation** - Each connected account lives in its own secure folder, preventing session conflicts.

## Requirements
- Installed [Node.js](https://nodejs.org) environment.
- Codex CLI application installed.

## Installation
1. Download or clone this repository to any location (e.g., Desktop).
2. Open your terminal (CMD) inside the folder and run:
   ```bash
   npm install
   ```

## Quick Start
The tool is optimized for maximum convenience. Simply double-click the **`Uruchom_Menedzer.bat`** file. 
This will automatically start the background server and open the web dashboard at `http://localhost:3000` in your default browser.

## Step-by-Step Guide
1. Open the GUI and click **"Add Account"** in the top right corner.
2. Enter a recognizable name (e.g., "Work Account" or an email address).
3. The app will create a dedicated folder and launch `codex login` in the background. Follow the link in your terminal/browser to complete the authentication.
4. Repeat this to gather all your accounts in one place.
5. When your main account hits a rate limit, open the GUI, find an account labeled **Active**, and click **"Zaloguj w CMD"** (Login in CMD). This smoothly replaces the authentication token for your entire computer!

## Security
No credentials or auth files are included in the public code. Everything is stored 100% locally on your drive inside the hidden `.codex_data` folder and the `accounts.json` file.

---

<a name="polski"></a>
# 🇵🇱 Polski

**Codex Accounts Manager** to proste i potężne narzędzie z interfejsem graficznym (GUI), które służy do zarządzania wieloma kontami dla narzędzia Codex CLI. Pozwala na omijanie problemów z limitami zapytań (Rate Limits) poprzez błyskawiczne przeskakiwanie między różnymi, skonfigurowanymi kontami, używając odizolowanych środowisk dla autoryzacji (`CODEX_HOME`).

## Funkcje
- 🔄 **Auto-odświeżanie i podgląd na żywo** - automatycznie sprawdza limity Twoich kont i wylicza czas odnowienia kredytów (wyświetla polską datę resetu).
- ⚡ **Globalne logowanie (Użyj w CMD)** - za pomocą jednego kliknięcia możesz zmienić obecnie aktywne konto i używać go we wszystkich terminalach w systemie.
- 🔔 **Powiadomienia i dźwięki** - aplikacja "piknie" i wyśle Ci powiadomienie do systemu Windows, gdy tylko limit na którymkolwiek zablokowanym koncie zresetuje się do zera.
- 隔離 **Wielokrotna izolacja** - każde podłączone konto żyje we własnym, bezpiecznym folderze autoryzacyjnym, dzięki czemu sesje nie nadpisują się nawzajem.

## Wymagania
- Zainstalowane środowisko [Node.js](https://nodejs.org) (do działania serwera pod GUI).
- Aplikacja Codex (wersja terminalowa / CLI).

## Instalacja
1. Pobierz plik i wypakuj archiwum w dowolnym miejscu (np. na Pulpicie).
2. Otwórz terminal (CMD) wewnątrz wypakowanego folderu i wpisz poniższą komendę, aby zainstalować wymagane pakiety:
   ```bash
   npm install
   ```

## Uruchamianie (Ekspresowe)
Narzędzie zostało zoptymalizowane pod kątem maksymalnej wygody. 
Wystarczy, że dwukrotnie klikniesz plik **`Uruchom_Menedzer.bat`**. 
To polecenie automatycznie uruchomi serwer w tle i po 2 sekundach otworzy w Twojej domyślnej przeglądarce gotowy panel pod adresem: `http://localhost:3000`.

## Jak korzystać (Krok po kroku)
1. Po wejściu w GUI kliknij w prawym górnym rogu przycisk **"Add Account"**.
2. Wpisz nazwę dla konta (np. "Konto Służbowe" lub podaj adres e-mail, by łatwo je rozpoznać).
3. Aplikacja utworzy specjalny folder oraz uruchomi w tle proces `codex login`. Kliknij wyświetlony w terminalu/przeglądarce link autoryzacyjny, aby zalogować się w przeglądarce i ukończyć proces.
4. Powtarzaj ten proces, by zebrać wszystkie swoje konta w jednym miejscu.
5. Kiedy podczas pracy główne konto dostanie blokadę na limity - wejdź do GUI, znajdź konto, które wciąż ma status **Active**, i naciśnij pod nim przycisk **"Zaloguj w CMD"**. To płynnie podmieni autoryzację dla całego Twojego komputera!

## Bezpieczeństwo
Żadne dane logowania ani pliki autoryzacyjne nie są dołączone do kodu publicznego. Wszystko przechowywane jest w 100% lokalnie na Twoim dysku w folderze, w którym wypakowałeś program (konta pojawią się w ukrytym katalogu `.codex_data` oraz w pliku `accounts.json`).

---
_Built for developers looking for a smoother workflow with AI tools. / Aplikacja przygotowana dla programistów szukających wygodniejszego workflow z narzędziami AI._
