from ninja import Router
from .models import FinancialRecord
from ninja import Schema
from ninja import UploadedFile, Form, File
from typing import Optional, List
from datetime import datetime, date
from account.auth import APIKeyAuth
from django.core.files.storage import FileSystemStorage

api = Router(tags=["Financial"], auth=APIKeyAuth())

class FinancialRecordSchemaIn(Schema):
    subject: str
    record_date: str
    description: Optional[str] = None
    attachment: Optional[List[UploadedFile]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    

class FinancialRecordSchemaOut(Schema):
    id: int
    subject: str
    record_date: str
    description: Optional[str] = None
    attachment: Optional[List[str]] = None

@api.get("/financial-records", response=list[FinancialRecordSchemaOut])
def financial_record_list(request):
    records = FinancialRecord.objects.all()
    return [FinancialRecordSchemaOut.from_orm(record) for record in records]

@api.post("/financial-records", response=FinancialRecordSchemaOut)
def create_financial_record(
    request,
    subject: Form[str],
    record_date: Form[str],
    description: Form[str],
    files: Optional[List[UploadedFile]] = File(None)):
    
    file_urls = []
    if files:
        fs = FileSystemStorage(location='media/docs/', base_url='/media/docs/')
        for uploaded_file in files:
            filename = fs.save(uploaded_file.name, uploaded_file)
            file_urls.append(fs.url(filename))

    financial_record = FinancialRecord.objects.create(
        subject=subject,
        record_date=record_date,
        description=description,
        attachment=file_urls if file_urls else None
    )

    return FinancialRecordSchemaOut.from_orm(financial_record)
    
@api.delete("/financial-records/{record_id}")
def delete_financial_record(request, record_id: int):
    try:
        record = FinancialRecord.objects.get(id=record_id)
        record.delete()
        return {"success": True, "message": "Record deleted successfully."}
    except FinancialRecord.DoesNotExist:
        return {"success": False, "message": "Record not found."}

@api.put("/financial-records/{record_id}", response=FinancialRecordSchemaOut)
def update_financial_record(
    request,
    record_id: int,
    subject: Optional[str] = Form(None),
    record_date: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    files: Optional[List[UploadedFile]] = File(None)):
    
    try:
        record = FinancialRecord.objects.get(id=record_id)
        if subject is not None:
            record.subject = subject
        if record_date is not None:
            record.record_date = record_date
        if description is not None:
            record.description = description
        if files is not None:
            file_urls = []
            fs = FileSystemStorage(location='media/docs/', base_url='/media/docs/')
            for uploaded_file in files:
                filename = fs.save(uploaded_file.name, uploaded_file)
                file_urls.append(fs.url(filename))
            record.attachment = file_urls
        record.save()
        return FinancialRecordSchemaOut.from_orm(record)
    except FinancialRecord.DoesNotExist:
        return {"success": False, "message": "Record not found."}