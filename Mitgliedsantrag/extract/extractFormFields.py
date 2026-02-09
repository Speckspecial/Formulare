import json5
from PyPDF2 import PdfReader

def extract_form_fields(pdf_path: str) -> dict:
    """
    Extrahiert Formularfelder aus einer PDF und gibt sie als Dictionary zurück.
    """
    reader = PdfReader(pdf_path)

    # PyPDF2 speichert Formularfelder in reader.get_fields()
    fields = reader.get_fields()

    result = {}

    if fields:
        for field_name, field in fields.items():
            entry = {
                "name": field_name,
                "type": field.get("/FT", "Unknown"),
                "value": field.get("/V"),
                "options": field.get("/Opt"),
                "flags": field.get("/Ff"),
            }
            result[field_name] = entry

    return result


def write_json5(data: dict, output_path: str):
    """
    Schreibt ein Dictionary als JSON5-Datei.
    """
    with open(output_path, "w", encoding="utf-8") as f:
        json5.dump(data, f, indent=4, ensure_ascii=False)


if __name__ == "__main__":
    pdf_path = "Mitgliedsantrag\main.pdf"
    output_path = "Mitgliedsantrag\extract\main.json"

    fields = extract_form_fields(pdf_path)
    write_json5(fields, output_path)

    print(f"Extrahierte {len(fields)} Formularfelder in {output_path} gespeichert.")
