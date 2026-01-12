# QuerySimple: User Testing Walkthrough

This document provides a step-by-step guide for manual verification of the QuerySimple widget features. Use this walkthrough to ensure stability before major releases.

---

## 🛠️ Environment Setup
1. Ensure the Experience Builder server is running.
2. Open the application in a browser.
3. Open Developer Tools (F12) to monitor the `debugLogger` (filter by `[QUERYSIMPLE]`).

---

## 🧪 Phase 1: Basic Search & Input Validation
### 1.1 Empty String Prevention
- **Action**: Open the Query tab, select "KC Major".
- **Action**: Leave the input empty.
- **Expectation**: The "Apply" button is **disabled**.
- **Action**: Type a space.
- **Expectation**: The "Apply" button remains **disabled**.

### 1.2 Instant Validation
- **Action**: Type a single character (e.g., `1`).
- **Expectation**: The "Apply" button enables **instantly** (no need to click out of the box).
- **Action**: Clear the input.
- **Expectation**: The "Apply" button disables **instantly**.

### 1.3 SQL Sanitization (Single Quotes)
- **Action**: Type a value with a single quote (e.g., `O'Malley`).
- **Action**: Click Apply.
- **Expectation**: The query executes successfully (the single quote is escaped to `''` internally).

### 1.4 List-Based Query Exemption
- **Action**: Switch to the "Regional Trails" query.
- **Expectation**: The "Apply" button is **enabled by default** (even with an empty search box) because it is a list-based selector.

---

## 🔗 Phase 2: URL Parameter Handling
### 2.1 Auto-Open (Hash)
- **Action**: Append `#qsopen=true` to the URL and reload.
- **Expectation**: The QuerySimple widget opens automatically.

### 2.2 Deep Linking (ShortID)
- **Action**: Append `#major=222305` to the URL and reload.
- **Expectation**: The widget opens, switches to "KC Major", populates "222305", and **automatically triggers the search**.

### 2.3 Query String Support
- **Action**: Change the URL to use `?major=222305` instead of the hash.
- **Expectation**: The behavior is identical to the hash-based search.

---

## 📊 Phase 3: Results & Selection Modes
### 3.1 New Selection (Default)
- **Action**: Run a search for "KC Major" = `222305`. (121 results).
- **Action**: Run a search for "KC Major" = `222308`.
- **Expectation**: The previous 121 results are cleared, and the new results are displayed.

### 3.2 Add to Results
- **Action**: Change the Results Mode (dropdown at bottom) to "Add to Current Results".
- **Action**: Run a search for "KC Major" = `222305`.
- **Expectation**: The results from both searches are combined in the list.

### 3.3 Clear Results
- **Action**: Click the Trash Can icon in the Results tab.
- **Expectation**: All results are cleared, map highlights are removed, and the view returns to the Query tab.
- **Expectation**: Check console for `TypeError: Converting circular structure to JSON` (should be fixed).

---

## 🗺️ Phase 4: Map & Widget Interaction
### 4.1 Highlighting & Zooming
- **Action**: Click a result in the list.
- **Expectation**: The map zooms to and highlights the feature.

### 4.2 Identify Integration (Sticky State)
- **Action**: With results displayed, click a feature on the map to open the standard Identify popup.
- **Action**: Close the Identify popup.
- **Expectation**: QuerySimple should restore its highlight/selection if it was active.

### 4.3 Drawing Tool Compatibility
- **Action**: Open the `draw-advanced` widget.
- **Expectation**: The widget renders without the `TypeError: Cannot read properties of undefined (reading '1')` error.

---

## 📝 Phase 5: Logging & Debugging
- **Action**: Add `?debug=FORM,TASK` to the URL.
- **Action**: Interact with the form.
- **Expectation**: Detailed logs appear in the console for `input-typing`, `validation-check`, and `executeQuery`.

