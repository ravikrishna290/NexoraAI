import os
import subprocess
import re
import time

def markdown_to_html(md_text):
    lines = md_text.split('\n')
    output = []
    
    in_code_block = False
    code_block_lang = ''
    code_block_lines = []
    
    in_table = False
    table_lines = []
    
    in_list = False
    
    def flush_table():
        nonlocal in_table, table_lines
        if not table_lines:
            return ''
        html_table = ['<div class="table-container"><table>']
        for i, row in enumerate(table_lines):
            cells = [c.strip() for c in row.strip('|').split('|')]
            if i == 0:
                html_table.append('  <thead><tr>' + ''.join(f'<th>{c}</th>' for c in cells) + '</tr></thead><tbody>')
            elif i == 1 and '---' in row:
                continue # Skip markdown table delimiter row
            else:
                html_table.append('  <tr>' + ''.join(f'<td>{c}</td>' for c in cells) + '</tr>')
        html_table.append('</tbody></table></div>')
        in_table = False
        table_lines = []
        return '\n'.join(html_table)

    for line in lines:
        stripped = line.strip()
        
        # Handle Code / Mermaid Blocks
        if stripped.startswith('```'):
            if in_code_block:
                # Closing code block
                content = '\n'.join(code_block_lines)
                if code_block_lang == 'mermaid':
                    output.append(f'<div class="mermaid-box"><pre class="mermaid">\n{content}\n</pre></div>')
                else:
                    output.append(f'<pre><code>{content}</code></pre>')
                in_code_block = False
                code_block_lines = []
                code_block_lang = ''
            else:
                # Opening code block
                in_code_block = True
                code_block_lang = stripped[3:].strip().lower()
                code_block_lines = []
            continue
            
        if in_code_block:
            code_block_lines.append(line)
            continue
            
        # Handle Tables
        if stripped.startswith('|') and stripped.endswith('|'):
            if not in_table:
                in_table = True
                table_lines = []
            table_lines.append(stripped)
            continue
        else:
            if in_table:
                output.append(flush_table())
                
        # Handle Lists
        if stripped.startswith('- ') or stripped.startswith('* '):
            if not in_list:
                output.append('<ul>')
                in_list = True
            content = stripped[2:].strip()
            # Inline formatting
            content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', content)
            content = re.sub(r'`([^`]+)`', r'<code>\1</code>', content)
            output.append(f'  <li>{content}</li>')
            continue
        else:
            if in_list:
                output.append('</ul>')
                in_list = False

        # Handle Headings
        if stripped.startswith('# '):
            output.append(f'<h1>{stripped[2:]}</h1>')
            continue
        elif stripped.startswith('## '):
            output.append(f'<h2>{stripped[3:]}</h2>')
            continue
        elif stripped.startswith('### '):
            output.append(f'<h3>{stripped[4:]}</h3>')
            continue
            
        # Handle HR
        if stripped == '---':
            output.append('<hr/>')
            continue
            
        # Paragraphs & Inline formatting
        if stripped:
            line_formatted = stripped
            line_formatted = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', line_formatted)
            line_formatted = re.sub(r'`([^`]+)`', r'<code>\1</code>', line_formatted)
            line_formatted = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', line_formatted)
            output.append(f'<p>{line_formatted}</p>')
            
    if in_table:
        output.append(flush_table())
    if in_list:
        output.append('</ul>')
        
    return '\n'.join(output)

def build_full_html(body_html):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>NEXORA — Executive Hackathon Submission Documentation</title>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
    
    @page {{
        size: A4;
        margin: 15mm 12mm 15mm 12mm;
    }}
    
    body {{
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #0f172a;
        background-color: #ffffff;
        line-height: 1.5;
        font-size: 10pt;
    }}
    
    h1 {{
        color: #1e1b4b;
        font-size: 20pt;
        font-weight: 800;
        border-bottom: 3px solid #4f46e5;
        padding-bottom: 6px;
        margin-top: 0;
        margin-bottom: 14px;
        letter-spacing: -0.5px;
    }}
    
    h2 {{
        color: #312e81;
        font-size: 13pt;
        font-weight: 700;
        border-bottom: 1.5px solid #e0e7ff;
        padding-bottom: 4px;
        margin-top: 20px;
        margin-bottom: 10px;
        page-break-after: avoid;
    }}
    
    h3 {{
        color: #4338ca;
        font-size: 11pt;
        font-weight: 600;
        margin-top: 14px;
        margin-bottom: 6px;
        page-break-after: avoid;
    }}
    
    p {{
        margin-bottom: 8px;
    }}
    
    strong {{
        color: #1e1b4b;
    }}
    
    a {{
        color: #4f46e5;
        text-decoration: none;
        font-weight: 600;
    }}
    
    ul {{
        margin-top: 4px;
        margin-bottom: 10px;
        padding-left: 18px;
    }}
    
    li {{
        margin-bottom: 3px;
    }}
    
    code {{
        font-family: 'JetBrains Mono', monospace;
        background-color: #f1f5f9;
        color: #0f172a;
        padding: 2px 5px;
        border-radius: 4px;
        font-size: 8.5pt;
        border: 1px solid #e2e8f0;
    }}
    
    pre {{
        background-color: #0f172a;
        color: #f8fafc;
        padding: 10px 14px;
        border-radius: 6px;
        overflow-x: auto;
        font-size: 8.5pt;
        line-height: 1.4;
        margin-top: 8px;
        margin-bottom: 12px;
        page-break-inside: avoid;
    }}
    
    pre code {{
        background: none;
        color: #f8fafc;
        padding: 0;
        border: none;
    }}
    
    .mermaid-box {{
        background-color: #fafafa;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;
        margin: 16px 0;
        text-align: center;
        page-break-inside: avoid;
    }}
    
    .mermaid {{
        display: block;
        margin: 0 auto;
    }}
    
    hr {{
        border: none;
        border-top: 1px solid #e2e8f0;
        margin: 16px 0;
    }}
    
    .table-container {{
        margin: 12px 0;
        overflow-x: auto;
        page-break-inside: avoid;
    }}
    
    table {{
        width: 100%;
        border-collapse: collapse;
        font-size: 9pt;
    }}
    
    th, td {{
        border: 1px solid #cbd5e1;
        padding: 7px 10px;
        text-align: left;
    }}
    
    th {{
        background-color: #4f46e5;
        color: #ffffff;
        font-weight: 600;
    }}
    
    tr:nth-child(even) {{
        background-color: #f8fafc;
    }}
</style>
</head>
<body>
{body_html}

<script>
    document.addEventListener("DOMContentLoaded", function() {{
        mermaid.initialize({{
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            flowchart: {{ useMaxWidth: false, htmlLabels: true }}
        }});
    }});
</script>
</body>
</html>
"""

def generate():
    md_file = r'd:\Nexora AI\SUBMISSION_DOCUMENTATION.md'
    html_file = r'd:\Nexora AI\SUBMISSION_DOCUMENTATION.html'
    pdf_file = r'd:\Nexora AI\SUBMISSION_DOCUMENTATION.pdf'
    
    with open(md_file, 'r', encoding='utf-8') as f:
        md_text = f.read()
        
    body_html = markdown_to_html(md_text)
    full_html = build_full_html(body_html)
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(full_html)
        
    print("HTML written to:", html_file)
    
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    if not os.path.exists(edge_path):
        edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
        
    cmd = [
        edge_path,
        '--headless',
        '--disable-gpu',
        '--no-pdf-header-footer',
        '--run-all-compositor-stages-before-draw',
        '--virtual-time-budget=10000',
        f'--print-to-pdf={pdf_file}',
        html_file
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    print("Edge output:", res.stdout, res.stderr)
    
    if os.path.exists(pdf_file):
        size_kb = os.path.getsize(pdf_file) / 1024
        print(f"SUCCESS: Generated PDF at {pdf_file} ({size_kb:.1f} KB)")
    else:
        print("ERROR: PDF was not generated.")

if __name__ == '__main__':
    generate()
