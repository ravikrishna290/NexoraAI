import os
import subprocess
import re

def markdown_to_html(md_text):
    # Basic Markdown parsing for executive PDF output
    html = md_text
    
    # Headers
    html = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    
    # Bold & Italic
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    
    # Inline Code
    html = re.sub(r'`([^`]+)`', r'<code>\1</code>', html)
    
    # Links
    html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', html)
    
    # Horizontal rules
    html = re.sub(r'^---$', r'<hr/>', html, flags=re.MULTILINE)
    
    # Lists
    lines = html.split('\n')
    in_list = False
    new_lines = []
    
    for line in lines:
        if line.strip().startswith('- '):
            if not in_list:
                new_lines.append('<ul>')
                in_list = True
            new_lines.append(f'  <li>{line.strip()[2:]}</li>')
        else:
            if in_list:
                new_lines.append('</ul>')
                in_list = False
            new_lines.append(line)
    if in_list:
        new_lines.append('</ul>')
        
    html = '\n'.join(new_lines)
    
    # Code blocks
    html = re.sub(r'```(.*?)\n(.*?)```', r'<pre><code>\2</code></pre>', html, flags=re.DOTALL)
    
    # Paragraphs (simple double newline)
    paragraphs = html.split('\n\n')
    processed_p = []
    for p in paragraphs:
        p_str = p.strip()
        if not p_str.startswith('<h') and not p_str.startswith('<ul') and not p_str.startswith('<pre') and not p_str.startswith('<hr') and not p_str.startswith('<table'):
            processed_p.append(f'<p>{p_str}</p>')
        else:
            processed_p.append(p_str)
            
    return '\n\n'.join(processed_p)

def build_full_html(body_html):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>NEXORA — Executive Hackathon Submission Documentation</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
    
    @page {{
        size: A4;
        margin: 20mm 15mm 20mm 15mm;
    }}
    
    body {{
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #0f172a;
        background-color: #ffffff;
        line-height: 1.6;
        font-size: 10.5pt;
    }}
    
    h1 {{
        color: #1e1b4b;
        font-size: 22pt;
        font-weight: 800;
        border-bottom: 3px solid #4f46e5;
        padding-bottom: 8px;
        margin-top: 0;
        margin-bottom: 16px;
        letter-spacing: -0.5px;
    }}
    
    h2 {{
        color: #312e81;
        font-size: 14pt;
        font-weight: 700;
        border-bottom: 1.5px solid #e0e7ff;
        padding-bottom: 4px;
        margin-top: 24px;
        margin-bottom: 12px;
    }}
    
    h3 {{
        color: #4338ca;
        font-size: 12pt;
        font-weight: 600;
        margin-top: 16px;
        margin-bottom: 8px;
    }}
    
    p {{
        margin-bottom: 10px;
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
        margin-bottom: 12px;
        padding-left: 20px;
    }}
    
    li {{
        margin-bottom: 4px;
    }}
    
    code {{
        font-family: 'JetBrains Mono', monospace;
        background-color: #f1f5f9;
        color: #0f172a;
        padding: 2px 5px;
        border-radius: 4px;
        font-size: 9pt;
        border: 1px solid #e2e8f0;
    }}
    
    pre {{
        background-color: #0f172a;
        color: #f8fafc;
        padding: 12px 16px;
        border-radius: 6px;
        overflow-x: auto;
        font-size: 9pt;
        line-height: 1.45;
        margin-top: 10px;
        margin-bottom: 14px;
    }}
    
    pre code {{
        background: none;
        color: #f8fafc;
        padding: 0;
        border: none;
    }}
    
    hr {{
        border: none;
        border-top: 1px solid #e2e8f0;
        margin: 20px 0;
    }}
    
    table {{
        width: 100%;
        border-collapse: collapse;
        margin: 14px 0;
        font-size: 9.5pt;
    }}
    
    th, td {{
        border: 1px solid #cbd5e1;
        padding: 8px 12px;
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
    
    .badge-box {{
        background-color: #e0e7ff;
        border-left: 4px solid #4f46e5;
        padding: 12px 16px;
        margin: 14px 0;
        border-radius: 0 6px 6px 0;
    }}
</style>
</head>
<body>
{body_html}
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
        f'--print-to-pdf={pdf_file}',
        html_file
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    print("Edge stdout:", res.stdout)
    print("Edge stderr:", res.stderr)
    
    if os.path.exists(pdf_file):
        size_kb = os.path.getsize(pdf_file) / 1024
        print(f"SUCCESS: Generated PDF at {pdf_file} ({size_kb:.1f} KB)")
    else:
        print("ERROR: PDF was not generated.")

if __name__ == '__main__':
    generate()
