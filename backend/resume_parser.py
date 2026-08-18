import os
import fitz
import docx2txt
import traceback

def extract_text_from_pdf(file_path):
    """
    Extract text from a PDF using PyMuPDF.
    """
    try:
        text=''
        with fitz.open(file_path) as doc:
            for page in doc:
                text += page.get_text()
        return text.strip()
    except Exception as e:
        print("[ERROR] Failed to extract PDF text:",e)
        traceback.print_exc()

def extract_text_from_docx(file_path):
    """
    Extract text from a DOCX file  using docx2txt.
    """
    try:
        text = docx2txt.process(file_path)
        return text.strip()
    except Exception as e:
        print("[ERROR] Failed to extract DOCX text",e)
        traceback.print_exc()
        return ""

def extract_resume_text(file_path):
    """
    Detect file type and extract text accordingly.
    Support .pdf and .docx
    """
    extension = os.path.splitext(file_path)[1].lower()

    if extension == '.pdf':
        return extract_text_from_pdf(file_path)
    elif extension == '.docx':
        return extract_text_from_docx(file_path)
    else:
        print("[ERROR] Unsupported file type:",extension)
        return ""
