from enum import Enum

from fastapi.exceptions import HTTPException


class ErrorName(Enum):
    DoesNotExist = "DoesNotExist"
    Forbidden = "Forbidden"
    Conflict = "Conflict"
    AlreadyExist = "AlreadyExist"
    BadRequest = "BadRequest"
    DocTypeNameAlreadyExist = "DocTypeNameAlreadyExist"
    FileTypeAlreadyUse = "FileTypeAlreadyUse"
    DocTypeIdNotFound = "DocTypeIdNotFound"
    TemplateIdNotFound = "TemplateIdNotFound"
    FileIdNotFound = "FileIdNotFound"
    RecognizedDataNotFound = "RecognizedDataNotFound"
    MinioPathDocsNotFound = "MinioPathDocsNotFound"
    ExportDataIsEmpty = "ExportDataIsEmpty"
    ExtractDataDoesNotExist = "ExtractDataDoesNotExist"


error_dict = {
    ErrorName.DoesNotExist: HTTPException(status_code=404, detail="Элемент не найден"),
    ErrorName.Forbidden: HTTPException(status_code=403, detail="Нет доступа"),
    ErrorName.Conflict: HTTPException(status_code=409, detail="Ошибка записи в БД"),
    ErrorName.AlreadyExist: HTTPException(status_code=409, detail="Объект с таким названием уже существует"),
    ErrorName.BadRequest: HTTPException(status_code=400),
    ErrorName.DocTypeNameAlreadyExist: HTTPException(status_code=409, detail="Тип документа с таким названием уже существует"),
    ErrorName.FileTypeAlreadyUse: HTTPException(status_code=409, detail="Файлы уже используются на другом документе"),
    ErrorName.DocTypeIdNotFound: HTTPException(status_code=404, detail="Тип документа не найден"),
    ErrorName.TemplateIdNotFound: HTTPException(status_code=404, detail="Шаблон не найден"),
    ErrorName.FileIdNotFound: HTTPException(status_code=404, detail="Файл не найден"),
    ErrorName.RecognizedDataNotFound: HTTPException(status_code=404, detail="Извлеченные данные документа не найдены"),
    ErrorName.MinioPathDocsNotFound: HTTPException(status_code=404, detail="Папка с извлеченными документами не найдена"),
    ErrorName.ExportDataIsEmpty: HTTPException(status_code=404, detail="Данные для экспорта пустые"),
    ErrorName.ExtractDataDoesNotExist: HTTPException(status_code=404, detail="Компиляция файлов для экспорта не закончилась"),
}
