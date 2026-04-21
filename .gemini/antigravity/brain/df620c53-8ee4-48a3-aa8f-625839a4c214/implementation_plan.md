# Bezpieczny Export PDF, Druk i Udostępnianie

Plan adresuje rozwiązanie wymagań dotyczących obsługi dokumentów: od poprawnego generowania plików PDF w pełni po stronie klienta (bez tworzenia śladów na serwerze i widocznych endpointów), przez poprawę integracji narzędzi drukowania, aż do zabezpieczenia akcji edycji udostępnionych dokumentów w trybie publicznym.

## User Review Required

> [!CAUTION]  
> Plany usuwają publicznie widoczny endpoint Next.js `/api/documents/[id]/pdf/route.ts` dla zapewnienia maksymalnej dyskrecji. Zostanie on zastąpiony bezpośrenim generowaniem po stronie klienta za pomocą nowoczesnej biblioteki `html2pdf.js`. Proszę o zatwierdzenie tych zmian w celu instalacji niezbędnych zależności (biblioteka kliencka).


## Proposed Changes

---

### Backend (Security & Akcje)
Rozwiązanie ukrytego problemu we współdzielonym linku (publiczna edycja powodowała błąd `Unauthorized`, jeśli odbiorca nie był zalogowany w systemie CRM).

#### [MODIFY] [documents.ts](file:///c:/Users/kapie/Documents/KPZsProductions/CRM/dev_crm/lib/actions/documents.ts)
- Utworzenie nowej bezpiecznej Server Action: `export async function updateSharedDocumentByToken(token: string, payload: any)`.
- Akcja znajdzie dokument za pomocą bezpiecznego klucza `shareToken` oraz zweryfikuje, czy `shareLevel` posiada status `"EDIT"`, zanim przepuści operację aktualizacji danych zawartości i zmiennych do bazy Prisma.
- Usunięcie fikcyjnej metody `exportDocumentToPdf`, gdyż cały proces przejdzie na Front-end.

#### [DELETE] `/app/api/documents/[id]/pdf/route.ts`
- Całkowite fizyczne usunięcie endpointu PDF, likwidując potencjalną publiczną ścieżkę generowania.

---

### Zależności (Client-Side PDF)
#### [MODIFY] Konfiguracja npm
- Instalacja biblioteki `html2pdf.js` pozwalającej na zaawansowany i w pełni cichy render obiektów DOM dokumentu do binarnego wariantu przeglądarkowego pliku `.pdf`. Przekłada się to na automatyczne otwarcie pobierania przeglądarki, po kliknięciu ikony Pobierz.

---

### Frontend (Generatory i UI)
Czyste przygotowanie UI drukarki/eksportera dla pożądanych celów.

#### [MODIFY] [WYSIWYGEditor.tsx](file:///c:/Users/kapie/Documents/KPZsProductions/CRM/dev_crm/app/components/documents/WYSIWYGEditor.tsx)
- Wdrożenie funkcji `downloadPDF()` ładującej powłokę DOM podglądu dokumentu do silnika `html2pdf.js` dla pełnego renderowania dokumentu "Pobierz PDF" z poziomu UI klienta.
- Optymalizacja klas druku CSS `@media print` upewniając się, że przy standardowym *Drukowaniu (Print)* lub natywnym *Save to PDF* układ pozostaje bez skaz: bez powłok, cieni modalnych czy obramowań bocznych nawigacji.

#### [MODIFY] [DocumentDetailClient.tsx](file:///c:/Users/kapie/Documents/KPZsProductions/CRM/dev_crm/app/dashboard/documents/[id]/DocumentDetailClient.tsx)
- Usunięcie handlerów zależnych od usuniętego już endpointu. Zamiast powiadamiać toast'em i próbować odpytywać API, interfejs przekaże wewnętrznemun edytorowi flagę/callback odpowiedzialną za eksport wewnętrzny.

#### [MODIFY] [app/shared/[token]/page.tsx](file:///c:/Users/kapie/Documents/KPZsProductions/CRM/dev_crm/app/shared/[token]/page.tsx)
- Podmiana zabezpieczenia z Server Action na wywołanie `updateSharedDocumentByToken(token, data)`. Osoby otrzymujące link od teraz z powodzeniem będą mogły zapisać uzupełnione przez siebie dane do systemu i wygenerować gotowy PDF (o ile dostaną w linku tryb "EDIT").

## Verification Plan

### Manual Verification
- Uruchom okno udostępniania i skopiuj nowy zewnętrzny udostępniony plik dla dowolnego leada z trybem EDIT.
- Spróbuj włączyć go w karcie Incognito i dokonać edycji zmiennej (nazwisko).
- Użyj przyciski "Save" na współdzielonym linku (oczekiwany zapis zmian na serwer), a następnie wciśnij nowo wprowadzany mechanizm "PDF Download" (oczekiwany natychmiastowy plik do pobrania, bez nowych przeładowań) i "Druku" (oczekiwany pusty obszar roboczy drukarki z zawartością A4).
