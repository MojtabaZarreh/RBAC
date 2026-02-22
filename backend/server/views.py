from datetime import datetime, date
from typing import Optional
from ninja import Router, Schema
from .models import Server
from account.auth import APIKeyAuth

api = Router(tags=["Server"], auth=APIKeyAuth())
class ServerISchemaIn(Schema):
    name: str
    ip_address: str
    expiration_date: datetime
    location: Optional[str] = None
    description: Optional[str] = None
    
class ServerSchemaOut(Schema):
    id: int
    name: str
    ip_address: str
    location: Optional[str] = None
    description: Optional[str] = None
    expiration_date: datetime
    created_at: datetime

@api.get("/servers", response=list[ServerSchemaOut])
def server_list(request):
    return [ServerSchemaOut.from_orm(server) for server in Server.objects.all()]

@api.post("/servers", response=ServerSchemaOut)
def create_server(request, server: ServerISchemaIn):
    obj = Server.objects.create(
        **server.dict(
            exclude_unset=True
        )
    )
    return ServerSchemaOut.from_orm(obj)

@api.delete("/servers/{server_id}")
def delete_server(request, server_id: int):
    try:
        server = Server.objects.get(id=server_id)
        server.delete()
        return {"success": True}
    except Server.DoesNotExist:
        return {"error": f"Server with id {server_id} not found."}

@api.put("/servers/{server_id}", response=ServerSchemaOut)
def update_server(request, server_id: int, server: ServerISchemaIn):
    try:
        server_obj = Server.objects.get(id=server_id)
        for attr, value in server.dict(exclude_unset=True).items():
            setattr(server_obj, attr, value)
        server_obj.save()
        return ServerSchemaOut.from_orm(server_obj)
    except Server.DoesNotExist:
        return {"error": f"Server with id {server_id} not found."}