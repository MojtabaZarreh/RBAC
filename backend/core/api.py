from ninja import NinjaAPI
from account.views import api as account_router
from domain.views import api as domain_router
from certificate.views import api as ssl_router
from financial.views import api as financial_router
from password.views import api as password_router
from server.views import api as server_router
from website.views import api as website_router
from relation.views import api as relation_router

api = NinjaAPI(title="Full Project API")

api.add_router("/", account_router)
api.add_router("/", domain_router)
api.add_router("/", ssl_router)
api.add_router("/", financial_router)
api.add_router("/", password_router)
api.add_router("/", server_router)
api.add_router("/", website_router)
api.add_router("/", relation_router) 