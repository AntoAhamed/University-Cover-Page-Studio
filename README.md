# University Cover Page Studio

A production-ready, flexible single-page web application designed for university students to customize, live-preview in real-time, and download vector-quality assignment cover pages as single-page A4 PDFs.

Built specifically to replicate the exact blueprint of **Jagannath University** (`Assignment Cover.pdf`) with support for any university, department, or program.

---

## ✨ Features & Recent Upgrades

- **Exact Visual Blueprint Replication**:
  - Replicates the exact layout, font hierarchy, and positions from `Assignment Cover.pdf`.
  - Official vector crest replica of Jagannath University featuring the Rutherford atom model, cogwheel/gear, open academic book, and Bengali ribbon banner (*"জগন্নাথ বিশ্ববিদ্যালয়"*).
  - Pre-filled with updated default student and course details:
    - University: *Jagannath University*
    - Department: *Department of Management Studies*
    - Program: *MBA (Professional) Program*
    - Course details: *Course Name*, *Course Code*, *Assignment On*
    - Submitted To: *Name*, *Designation*, *Department*
    - **Submitted By**:
      - Name: **Jems Bond**
      - Student ID: **M25080202569**
      - Section: **F**
      - Batch: **18th**
    - Date of Submission: *Date of Submission: [Customizable]*

- **Partial Text / Rich-Text Inline Formatting**:
  - Format specific words within a single field independently (e.g. in "Date of Submission", keeping "Date of" normal while making "Submission:" bold or colored).
  - Inline `contenteditable` mode with a floating quick-formatting toolbar (*Bold*, *Italic*, *Underline*, *Superscript*, *Color*, *Clear Format*).
  - Word tag wrapping tool in the left inspector panel for rapid `<b>`, `<i>`, `<u>`, and `<sup>` markup.

- **Confirmation Modal for "Reset to Default"**:
  - Clicking "Reset Layout" or "Reset to Default Template" displays an in-app confirmation modal dialog:
    *"Are you sure you want to reset all customized fields and layouts back to default?"*
  - Includes clear "OK" and "Cancel" actions (with `Escape` and `Enter` keyboard support).

- **Clean Framing & Page Background UI**:
  - Redesigned "Framing & Page" controls with no overlapping inputs.
  - Aligned color pickers with hex inputs and quick academic swatches.
  - Paper finish presets (*Pure White*, *Warm Cream*, *Ivory Document*) and custom color picker.
  - Background texture grains (*Smooth*, *Linen*, *Dots*, *Parchment*).
  - Academic borders (*Single Solid*, *Double Line*, *Classic Inset Frame*) with dual slider/number controls for thickness and margins.

- **Full-Page Print Preview (Zero Cutoff)**:
  - Custom `@media print` CSS block that fits the A4 page at exact `210mm × 297mm` with zero body margins.
  - Hides the left control panel, navigation bar, guides, and toolbars during printing.

- **Bulletproof PDF & PNG Export Engine**:
  - Pre-rasterizes all inline SVGs and external images into high-resolution PNG Data URLs prior to capture, eliminating canvas-tainting `SecurityError` bugs across all modern browsers.
  - Generates single-page vector-quality A4 PDFs using `jsPDF` + `html2canvas` at 3.5x DPI scaling.
  - Strictly prevents blank second-page overflows.
  - One-click high-res PNG download.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation & Development
```bash
# Install dependencies
npm install

# Start Vite local development server
npm run dev
```

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```
