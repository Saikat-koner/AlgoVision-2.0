"""
AlgoVision 2.0 — Executive PDF Generator Suite
Converts Markdown Documentation & Reports to Publication-Grade PDFs using Headless Edge Engine.
"""

import os
import subprocess
import tempfile
import sys
from pathlib import Path
import markdown
import pymupdf

PROJECT_ROOT = Path(r"D:\e drive everything\ClaudeWorkspace\projects\algovision2")
PDF_OUTPUT_DIR = PROJECT_ROOT / "pdf_docs"
PDF_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(EDGE_PATH):
    EDGE_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

CSS_STYLESHEET = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

@page {
    size: A4 portrait;
    margin: 16mm 14mm 16mm 14mm;
    @bottom-center {
        content: "AlgoVision 2.0 • Capstone Major Project • LaunchED Global Internship";
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
    }
    @bottom-right {
        content: "Page " counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #475569;
        font-weight: 600;
    }
}

*, *::before, *::after {
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 10pt;
    line-height: 1.55;
    color: #1e293b;
    background: #ffffff;
    margin: 0;
    padding: 0;
}

/* Header Banner */
.doc-header {
    border-bottom: 2px solid #0284c7;
    padding-bottom: 12px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.doc-header-title {
    font-size: 18pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin: 0;
}

.doc-header-meta {
    font-size: 8.5pt;
    color: #64748b;
    font-weight: 500;
    text-align: right;
}

/* Headings */
h1 {
    font-size: 18pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin-top: 24px;
    margin-bottom: 12px;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 6px;
    page-break-after: avoid;
    break-after: avoid;
}

h2 {
    font-size: 13.5pt;
    font-weight: 700;
    color: #0369a1;
    letter-spacing: -0.01em;
    margin-top: 20px;
    margin-bottom: 10px;
    page-break-after: avoid;
    break-after: avoid;
}

h3 {
    font-size: 11pt;
    font-weight: 600;
    color: #1e293b;
    margin-top: 16px;
    margin-bottom: 6px;
    page-break-after: avoid;
    break-after: avoid;
}

h4 {
    font-size: 10pt;
    font-weight: 600;
    color: #475569;
    margin-top: 12px;
    margin-bottom: 4px;
    page-break-after: avoid;
    break-after: avoid;
}

p {
    margin-top: 0;
    margin-bottom: 10px;
    text-align: justify;
}

/* Blockquotes / Callout Boxes */
blockquote {
    margin: 12px 0;
    padding: 10px 14px;
    background: #f0f9ff;
    border-left: 4px solid #0284c7;
    border-radius: 0 6px 6px 0;
    color: #0c4a6e;
    font-size: 9.5pt;
    page-break-inside: avoid;
    break-inside: avoid;
}

blockquote p:last-child {
    margin-bottom: 0;
}

/* Tables */
table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 8.5pt;
    page-break-inside: avoid;
    break-inside: avoid;
}

th, td {
    padding: 6px 10px;
    text-align: left;
    border: 1px solid #cbd5e1;
}

th {
    background-color: #0f172a;
    color: #f8fafc;
    font-weight: 600;
    letter-spacing: 0.02em;
}

tr:nth-child(even) {
    background-color: #f8fafc;
}

/* Code Blocks & Inlines */
code {
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    font-size: 8.5pt;
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 1.5px 4.5px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
}

pre {
    background-color: #0f172a;
    color: #f8fafc;
    padding: 12px 14px;
    border-radius: 6px;
    overflow-x: auto;
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    font-size: 8pt;
    line-height: 1.45;
    margin: 12px 0;
    border: 1px solid #334155;
    page-break-inside: avoid;
    break-inside: avoid;
}

pre code {
    background-color: transparent;
    color: #f8fafc;
    padding: 0;
    border: none;
    font-size: 8pt;
}

/* Lists */
ul, ol {
    margin-top: 0;
    margin-bottom: 10px;
    padding-left: 20px;
}

li {
    margin-bottom: 4px;
}

/* Badges & Horizontal Rules */
hr {
    border: 0;
    height: 1px;
    background: #e2e8f0;
    margin: 18px 0;
}

.badge {
    display: inline-block;
    font-size: 7.5pt;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 12px;
    background-color: #e0f2fe;
    color: #0369a1;
    margin-right: 4px;
    margin-bottom: 4px;
}

/* Avoid break utilities */
.no-break {
    page-break-inside: avoid;
    break-inside: avoid;
}

/* Checklists */
input[type="checkbox"] {
    margin-right: 6px;
}
"""

def markdown_to_pdf(md_file_path: Path, output_pdf_path: Path, title: str, subtitle: str = "LaunchED Global Capstone Major Project"):
    print(f"\n[+] Converting: {md_file_path.name} -> {output_pdf_path.name}")

    with open(md_file_path, "r", encoding="utf-8") as f:
        md_content = f.read()

    html_body = markdown.markdown(
        md_content,
        extensions=[
            'tables',
            'fenced_code',
            'nl2br',
            'sane_lists',
            'toc',
            'def_list'
        ]
    )

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{title}</title>
    <style>{CSS_STYLESHEET}</style>
</head>
<body>
    <div class="doc-header">
        <div>
            <div class="doc-header-title">{title}</div>
            <div style="font-size: 9pt; color: #0284c7; font-weight: 600; margin-top: 2px;">{subtitle}</div>
        </div>
        <div class="doc-header-meta">
            <div><strong>Date:</strong> October 2026</div>
            <div><strong>Standard:</strong> NASSCOM FutureSkills</div>
            <div><strong>Candidate:</strong> Saikat Koner</div>
        </div>
    </div>

    {html_body}
</body>
</html>"""

    with tempfile.NamedTemporaryFile("w", suffix=".html", encoding="utf-8", delete=False) as tmp_html:
        tmp_html.write(full_html)
        tmp_html_path = tmp_html.name

    try:
        cmd = [
            EDGE_PATH,
            "--headless",
            "--disable-gpu",
            "--allow-running-insecure-content",
            "--run-all-compositor-stages-before-draw",
            "--no-pdf-header-footer",
            f"--print-to-pdf={output_pdf_path.resolve()}",
            tmp_html_path
        ]

        res = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

        if output_pdf_path.exists():
            doc = pymupdf.open(str(output_pdf_path))
            pages = len(doc)
            size_kb = output_pdf_path.stat().st_size / 1024
            doc.close()
            print(f"    [SUCCESS] Generated: {output_pdf_path.name} ({pages} pages, {size_kb:.1f} KB)")
            return True
        else:
            print(f"    [ERROR] PDF file was not created. Error: {res.stderr}")
            return False
    finally:
        if os.path.exists(tmp_html_path):
            os.remove(tmp_html_path)

def generate_master_dossier():
    print(f"\n=======================================================")
    print(f"[+] Compiling Master Capstone Dossier PDF...")
    print(f"=======================================================")

    docs = [
        ("README.md", "Executive Overview & System Architecture"),
        ("ALGORITHMIC_OPTIMIZATION_REPORT.md", "Algorithmic Complexity & Theoretical Optimization Report"),
        ("PROJECT_DOCUMENTATION.md", "System Design & Technical API Reference Manual"),
        ("VIDEO_DEMO_SCRIPT.md", "Word-for-Word Video Demonstration Presentation Script"),
        ("LINKEDIN_AND_SUBMISSION_GUIDE.md", "Submission Package, LinkedIn Copy & Review Guidelines")
    ]

    combined_md = []
    combined_md.append("# AlgoVision 2.0 — Unified DSA Analytics & Optimization Platform\n")
    combined_md.append("## Complete Capstone Major Project Submission Dossier\n")
    combined_md.append("> **Internship Domain:** Data Structures & Algorithms / Full Stack Engineering  \n"
                    "> **Organization:** LaunchED Global (Mentorship Benchmarks: Amazon, Microsoft, TCS)  \n"
                    "> **Framework Alignment:** NASSCOM FutureSkills Framework  \n"
                    "> **Student Candidate:** Saikat Koner  \n"
                    "> **Submission Date:** October 2026\n\n---\n")

    for filename, section_title in docs:
        filepath = PROJECT_ROOT / filename
        if filepath.exists():
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            combined_md.append(f"\n\n---\n\n# {section_title}\n\n")
            combined_md.append(content)

    master_md_text = "\n".join(combined_md)
    master_pdf_path = PDF_OUTPUT_DIR / "AlgoVision_2.0_Master_Capstone_Dossier.pdf"

    html_body = markdown.markdown(
        master_md_text,
        extensions=[
            'tables',
            'fenced_code',
            'nl2br',
            'sane_lists',
            'toc',
            'def_list'
        ]
    )

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>AlgoVision 2.0 — Master Capstone Dossier</title>
    <style>{CSS_STYLESHEET}</style>
</head>
<body>
    <div class="doc-header">
        <div>
            <div class="doc-header-title">AlgoVision 2.0 • Master Dossier</div>
            <div style="font-size: 9pt; color: #0284c7; font-weight: 600; margin-top: 2px;">Comprehensive Capstone Project & Evaluation Portfolio</div>
        </div>
        <div class="doc-header-meta">
            <div><strong>Candidate:</strong> Saikat Koner</div>
            <div><strong>Evaluator:</strong> LaunchED Global & NASSCOM</div>
            <div><strong>Evaluation:</strong> Concept 25% | Code 25% | Relevance 25% | Reflection 25%</div>
        </div>
    </div>

    {html_body}
</body>
</html>"""

    with tempfile.NamedTemporaryFile("w", suffix=".html", encoding="utf-8", delete=False) as tmp_html:
        tmp_html.write(full_html)
        tmp_html_path = tmp_html.name

    try:
        cmd = [
            EDGE_PATH,
            "--headless",
            "--disable-gpu",
            "--allow-running-insecure-content",
            "--run-all-compositor-stages-before-draw",
            "--no-pdf-header-footer",
            f"--print-to-pdf={master_pdf_path.resolve()}",
            tmp_html_path
        ]

        subprocess.run(cmd, capture_output=True, text=True, timeout=90)

        if master_pdf_path.exists():
            doc = pymupdf.open(str(master_pdf_path))
            pages = len(doc)
            size_kb = master_pdf_path.stat().st_size / 1024
            doc.close()
            print(f"    [SUCCESS] Master Dossier Created: {master_pdf_path.name} ({pages} pages, {size_kb:.1f} KB)")
            return True
    finally:
        if os.path.exists(tmp_html_path):
            os.remove(tmp_html_path)

def main():
    print("=================================================================")
    print("  AlgoVision 2.0 — High-Fidelity PDF Generation Suite")
    print("=================================================================")

    tasks = [
        ("README.md", "AlgoVision_2.0_README.pdf", "AlgoVision 2.0 — Executive Summary & Architecture", "System Architecture & Quick Start Guide"),
        ("ALGORITHMIC_OPTIMIZATION_REPORT.md", "AlgoVision_2.0_Algorithmic_Optimization_Report.pdf", "AlgoVision 2.0 — Algorithmic Optimization Report", "Big-O Proofs, CPU Cache Locality & NASSCOM Benchmarks"),
        ("PROJECT_DOCUMENTATION.md", "AlgoVision_2.0_Project_Documentation.pdf", "AlgoVision 2.0 — Technical Documentation", "Class Specifications, Data Structures & API Contracts"),
        ("VIDEO_DEMO_SCRIPT.md", "AlgoVision_2.0_Video_Demonstration_Script.pdf", "AlgoVision 2.0 — Video Demonstration Script", "Word-for-Word 5-10 Min Presentation & Walkthrough Guide"),
        ("LINKEDIN_AND_SUBMISSION_GUIDE.md", "AlgoVision_2.0_LinkedIn_And_Submission_Guide.pdf", "AlgoVision 2.0 — Submission & LinkedIn Kit", "Step-by-Step LaunchED Submission, Post Copy & Review Draft")
    ]

    success_count = 0
    for src_md, out_pdf, title, subtitle in tasks:
        src_path = PROJECT_ROOT / src_md
        out_path = PDF_OUTPUT_DIR / out_pdf
        if src_path.exists():
            if markdown_to_pdf(src_path, out_path, title, subtitle):
                success_count += 1
        else:
            print(f"[!] Warning: File {src_path} does not exist.")

    generate_master_dossier()
    print("\n=================================================================")
    print(f"  All PDF Deliverables Successfully Compiled in:\n  {PDF_OUTPUT_DIR}")
    print("=================================================================")

if __name__ == "__main__":
    main()
