# Codex Accounts Manager

Codex Accounts Manager to proste i potężne narzędzie z interfejsem graficznym (GUI), które służy do zarządzania wieloma kontami dla narzędzia Codex CLI. Pozwala na omijanie problemów z limitami zapytań (Rate Limits) poprzez błyskawiczne przeskakiwanie między różnymi, skonfigurowanymi kontami, używając odizolowanych środowisk dla autoryzacji (`CODEX_HOME`).

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
_Aplikacja przygotowana dla programistów szukających wygodniejszego workflow z narzędziami AI._
