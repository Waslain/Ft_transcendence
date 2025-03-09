from django.shortcuts import render

# Create your views here.
def index_view(req):
    return render(req, 'index.html');

def get_page_content(request, page_name):
    """API view to get page content dynamically"""
    from django.http import JsonResponse
    
    # Map page names to their templates/content
    page_mappings = {
        'dashboard': {'html': render_to_string('pages/dashboard.html'), 'js_init': 'initDashboardPage'},
        'profile': {'html': render_to_string('pages/profile.html'), 'js_init': 'initProfilePage'},
        'game': {'html': render_to_string('pages/game.html'), 'js_init': 'initGamePage'},
        # Add more pages as needed
    }
    
    if page_name in page_mappings:
        return JsonResponse(page_mappings[page_name])
    else:
        return JsonResponse({'error': 'Page not found'}, status=404)