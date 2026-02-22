from django.shortcuts import get_object_or_404
from ninja import Router
from django.http import JsonResponse
from django.contrib.contenttypes.models import ContentType
from .models import InfrastructureLink
from server.models import Server
from account.auth import APIKeyAuth
from account.permission import role_required

api = Router(tags=["Relation"], auth=APIKeyAuth())

@api.get("/infrastructure-graph/{server_id}")
@role_required('viewer')
def infrastructure_graph_data(request, server_id: int):
    target_server = get_object_or_404(Server, id=server_id)
    
    nodes = []
    edges = []
    visited_node_ids = set()
    
    color_map = {
        'server': '#D6EAF8', 'domain': '#D5F5E3', 'website': '#FADBD8',
        'certificate': '#FCF3CF', 'password': '#EBDEF0', 'financialrecord': '#E5E8E8',
    }

    def add_node(obj_id, ct, model_name):
        if obj_id not in visited_node_ids:
            obj = ct.get_object_for_this_type(id=obj_id.split('-')[1])
            nodes.append({
                'id': obj_id,
                'type': f"{model_name}Node",
                'data': {'label': str(obj)},
                'position': {'x': 0, 'y': 0},
                'style': {'background': color_map.get(model_name, '#eee'), 'borderRadius': '8px', 'padding': '10px'}
            })
            visited_node_ids.add(obj_id)

    server_ct = ContentType.objects.get_for_model(Server)
    root_id = f"server-{target_server.id}"
    add_node(root_id, server_ct, 'server')

    queue = [(server_ct, target_server.id)]
    processed_links = set()

    while queue:
        current_ct, current_id = queue.pop(0)
        
        links = InfrastructureLink.objects.filter(
            source_type=current_ct, source_id=current_id
        ) | InfrastructureLink.objects.filter(
            target_type=current_ct, target_id=current_id
        )

        for link in links:
            if link.id in processed_links:
                continue
            processed_links.add(link.id)

            s_id = f"{link.source_type.model}-{link.source_id}"
            t_id = f"{link.target_type.model}-{link.target_id}"

            add_node(s_id, link.source_type, link.source_type.model)
            add_node(t_id, link.target_type, link.target_type.model)

            edges.append({
                'id': f"e-{link.id}",
                'source': s_id,
                'target': t_id,
                'label': link.link_label,
                'animated': True,
            })

            next_node = (link.target_type, link.target_id) if s_id == f"{current_ct.model}-{current_id}" else (link.source_type, link.source_id)
            queue.append(next_node)

    return JsonResponse({'nodes': nodes, 'edges': edges})