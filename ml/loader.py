from langchain_community.document_loaders import PyPDFium2Loader
import os
import subprocess


# def libreoffice_convert_doc2pdf(dir_path: str, file_path: str):
#     """
#     The libreoffice_convert_doc2pdf function converts a file to PDF using LibreOffice.
#         Args:
#             dir_path (str): The directory path where the file is located.
#             file_path (str): The name of the file to be converted,
#                              including its extension.

#     :param dir_path: Specify the directory where the file is located
#     :param file_path: Specify the path of the file to be converted
#     :return: The name of the pdf file
#     """
#     args = [
#         "libreoffice7.6",
#         "--headless",
#         "--convert-to",
#         "pdf",
#         "--outdir",
#         dir_path,
#         file_path,
#     ]
#     subprocess.run(
#         args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=15, check=False
#     )
#     pdf_path = ".".join(file_path.split(".")[0:-1]) + ".pdf"
#     return pdf_path


# def convert_doc2pdf(file):
#     """
#     The convert_doc2pdf function converts a text file to PDF.

#     :param file: Any: Pass the file object to this function
#     :return: A string with the path to the converted file
#     """

#     pdf_path = None
#     temp_dir = "temp"
#     os.makedirs(temp_dir, exist_ok=True)
#     if isinstance(file, str):
#         file_path = file
#     else:
#         file_path = f"{temp_dir}/temp.docx"
#         with open(file_path, "wb") as f:
#             f.write(file.read())
#     try:
#         pdf_path = libreoffice_convert_doc2pdf(
#             dir_path=os.path.dirname(file_path), file_path=file_path
#         )
#     except Exception as convertor_err:  # pylint: disable=broad-exception-caught:
#         print(convertor_err)
#     finally:
#         if not isinstance(file, str):
#             os.remove(file_path)

#     return pdf_path


def get_doc_text(file):
    loader = PyPDFium2Loader(file)
    some_text = []
    for page in loader.lazy_load():
        some_text.append(page)

    text = ''
    for item in some_text:
        text += item.page_content
    text = text.replace('\ufffe', "").replace('\r\n', " ")
    return text
