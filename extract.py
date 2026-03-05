import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def extract_text_from_docx(file_path):
    try:
        document = zipfile.ZipFile(file_path)
        xml_content = document.read('word/document.xml')
        document.close()
        tree = ET.XML(xml_content)
        paragraphs = []
        for paragraph in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            texts = [node.text for node in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text]
            if texts:
                paragraphs.append(''.join(texts))
        return '\n'.join(paragraphs)
    except Exception as e:
        return str(e)

def extract_text_from_pptx(file_path):
    try:
        document = zipfile.ZipFile(file_path)
        text_runs = []
        for file in document.namelist():
            if file.startswith('ppt/slides/slide') and file.endswith('.xml'):
                xml_content = document.read(file)
                tree = ET.XML(xml_content)
                for node in tree.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t'):
                    if node.text:
                        text_runs.append(node.text)
                text_runs.append("\n--- SLIDE ---\n")
        document.close()
        return '\n'.join(text_runs)
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    file_path = sys.argv[1]
    out_path = sys.argv[2]
    if file_path.endswith('.docx'):
        text = extract_text_from_docx(file_path)
    elif file_path.endswith('.pptx'):
        text = extract_text_from_pptx(file_path)
    else:
        text = "Unsupported file type"
    
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"Extraction saved to {out_path}")
