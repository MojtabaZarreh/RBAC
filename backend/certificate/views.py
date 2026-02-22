from ninja import Router
from .models import Certificate
from ninja import Schema
from typing import Optional
from ninja.errors import HttpError
from datetime import datetime, date
from account.auth import APIKeyAuth

api = Router(tags=["Certificate"], auth=APIKeyAuth())

class CertificateSchemaIn(Schema):
    name: str
    issuer: str
    expiration_date: date
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CertificateSchemaOut(Schema):
    id: int
    name: str
    issuer: str
    expiration_date: date
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@api.get("/ssl", response=list[CertificateSchemaOut])
def certificate_list(request):
    certificates = Certificate.objects.all()
    return [CertificateSchemaOut.from_orm(cert) for cert in certificates]

@api.post("/ssl", response=CertificateSchemaOut)
def create_certificate(request, certificate: CertificateSchemaIn):
    cert = Certificate.objects.create(
        **certificate.dict(
            exclude_unset=True
        )
    )
    return CertificateSchemaOut.from_orm(cert)

@api.delete("/ssl/{certificate_id}")
def delete_certificate(request, certificate_id: int):
    try:
        cert = Certificate.objects.get(id=certificate_id)
        cert.delete()
        return {"success": True}
    except Certificate.DoesNotExist:
        raise HttpError(404, f"Certificate with id {certificate_id} not found.")

@api.put("/ssl/{certificate_id}", response=CertificateSchemaOut)
def update_certificate(request, certificate_id: int, certificate: CertificateSchemaIn):
    try:
        cert = Certificate.objects.get(id=certificate_id)
        for attr, value in certificate.dict(exclude_unset=True).items():
            setattr(cert, attr, value)
        cert.save()
        return cert
    except Certificate.DoesNotExist:
        raise HttpError(404, f"Certificate with id {certificate_id} not found.")
