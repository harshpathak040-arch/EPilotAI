import io
from typing import Tuple

def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, int]:
    """
    Extracts text from PDF bytes using PyMuPDF (fitz).
    Returns (extracted_text, page_count).
    """
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_parts = []
        page_count = len(doc)
        for page in doc:
            text_parts.append(page.get_text())
        doc.close()
        full_text = "\n".join(text_parts).strip()
        return full_text, page_count
    except ImportError:
        # Fallback if PyMuPDF not compiled yet
        decoded = file_bytes.decode("latin1", errors="ignore")
        clean = " ".join([word for word in decoded.split() if word.isalnum()])
        return clean[:10000], 1
    except Exception as e:
        raise ValueError(f"Failed to extract PDF text: {str(e)}")
