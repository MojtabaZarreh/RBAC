from ninja import Router
from .models import Domain, DomainAction
from ninja import Schema, Field
from typing import Optional
from ninja.errors import HttpError
from datetime import datetime, date
from account.auth import APIKeyAuth
from account.permission import role_required

api = Router(tags=["Domain"], auth=APIKeyAuth())

class DomainSchemaIn(Schema):
    name: str
    register: str = Field(..., alias="register")    
    status: str
    expiration_date: date
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class DomainSchemaOut(Schema):
    id: int
    name: str
    register: str = Field(..., alias="register")    
    status: str
    expiration_date: date
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@api.get("/domains", response=list[DomainSchemaOut])
@role_required('viewer')
def domain_list(request):
    domains = Domain.objects.all()
    return [DomainSchemaOut.from_orm(domain) for domain in domains]

@api.post("/domains", response=DomainSchemaOut)
@role_required('viewer')
def create_domain(request, domain: DomainSchemaIn):
    domain_obj = Domain.objects.create(
        **domain.dict(
            exclude_unset=True
        )
    )
    return DomainSchemaOut.from_orm(domain_obj)

@api.delete("/domains/{domain_id}")
def delete_domain(request, domain_id: int):
    try:
        domain = Domain.objects.get(id=domain_id)
        domain.delete()
        return {"success": True}
    except Domain.DoesNotExist:
        raise HttpError(404, f"Domain with id {domain_id} not found.")

@api.put("/domains/{domain_id}", response=DomainSchemaOut)
def update_domain(request, domain_id: int, domain: DomainSchemaIn):
    try:
        domain_obj = Domain.objects.get(id=domain_id)
        for attr, value in domain.dict(exclude_unset=True).items():
            setattr(domain_obj, attr, value)
        domain_obj.save()
        return DomainSchemaOut.from_orm(domain_obj)
    except Domain.DoesNotExist:
        raise HttpError(404, f"Domain with id {domain_id} not found.")


class DomainActionSchemaIn(Schema):
    description: str
    created_at: Optional[datetime] = None

class DomainActionSchemaOut(Schema):
    id: int
    description: str
    created_at: Optional[datetime] = None
    
@api.get("/domains/{domain_id}/actions", response=list[DomainActionSchemaOut])
def domain_actions(request, domain_id: int):
    try:
        domain = Domain.objects.get(id=domain_id)
        actions = DomainAction.objects.filter(domain=domain)
        return [DomainActionSchemaOut.from_orm(action) for action in actions]
    except Domain.DoesNotExist:
        raise HttpError(404, f"Domain with id {domain_id} not found.")
    
@api.post("/domains/{domain_id}/actions", response=list[DomainActionSchemaOut])
def create_domain_action(request, domain_id: int, action: DomainActionSchemaIn):
    try:
        domain = Domain.objects.get(id=domain_id)
        domain_action = DomainAction.objects.create(
            domain=domain,
            description=action.description
        )
        return [DomainActionSchemaOut.from_orm(domain_action)]
    except Domain.DoesNotExist:
        raise HttpError(404, f"Domain with id {domain_id} not found.")