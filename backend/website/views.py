import requests
import urllib3
from datetime import datetime
from typing import Optional
from ninja import Router, Schema
from .models import Website
from account.auth import APIKeyAuth
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

api = Router(tags=["Website"], auth=APIKeyAuth())

class WebsiteSchemaIn(Schema):
    url: str
    description: Optional[str] = None
    
class WebsiteSchemaOut(Schema):
    id: int
    url: str
    status: str
    description: Optional[str]
    last_checked: Optional[datetime]
    created_at: Optional[datetime]

class WebsiteStatusUpdateSchema(Schema):
    status: Optional[str] = None

def ping(host: str) -> tuple[str, str]:
    if not host.startswith("http://") and not host.startswith("https://"):
        host = "http://" + host
    try:
        response = requests.get(host, timeout=5, verify=False)
        status = "up" if response.status_code == 200 else "down"
        return host, status
    except requests.RequestException:
        return host, "down"

@api.get("/websites", response=list[WebsiteSchemaOut])
def website_list(request):
    websites = Website.objects.all()
    return [WebsiteSchemaOut.from_orm(website) for website in websites]

@api.post("/websites", response=WebsiteSchemaOut)
def create_website(request, data: WebsiteSchemaIn):
    host, status = ping(data.url)
    obj = Website.objects.create(url=host, description=data.description, status=status)
    return WebsiteSchemaOut.from_orm(obj)

@api.delete("/websites/{website_id}")
def delete_website(request, website_id: int):
    try:
        website = Website.objects.get(id=website_id)
        website.delete()
        return {"success": True}
    except Website.DoesNotExist:
        return {"error": f"Website with id {website_id} not found."}
    
@api.patch("/websites/{website_id}", response=WebsiteSchemaOut)
def update_website(request, website_id: int):
    try:
        website = Website.objects.get(id=website_id)
        host, status = ping(website.url)
        website.status = status
        website.last_checked = datetime.now()
        website.save()
        return WebsiteSchemaOut.from_orm(website)
    except Website.DoesNotExist:
        return {"error": f"Website with id {website_id} not found."}