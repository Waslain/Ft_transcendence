from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Q, Max, OuterRef, Subquery
from django.contrib.auth import get_user_model

User = get_user_model()

# @login_required
# def chat_index(request):
#     user = request.user
    
#     # Find all users who the current user has communicated with
#     senders = User.objects.filter(by__user=user).distinct()
#     receivers = User.objects.filter(user__by=user).distinct()
#     conversation_partners = (senders | receivers).distinct()
    
#     # Get the latest message for each conversation
#     latest_messages = {}
#     for partner in conversation_partners:
#         latest_msg = Message.objects.filter(
#             (Q(user=user) & Q(by=partner)) | 
#             (Q(user=partner) & Q(by=user))
#         ).order_by('-timestamp').first()
        
#         if latest_msg:
#             latest_messages[partner.id] = latest_msg
    
#     # Get unread messages count (you could add a 'read' field to messages)
    
#     context = {
#         'conversation_partners': conversation_partners,
#         'latest_messages': latest_messages,
#     }
    
#     return render(request, 'chat/index.html', context)
@login_required
def chat_view(request, recipient_id):
    try:
        recipient = User.objects.get(id=recipient_id)
    except User.DoesNotExist:
        # Handle user not found
        return redirect('chat_index')
        
    return render(request, 'chat/room.html', {
        'recipient_id': recipient_id,
        'recipient_username': recipient.username,
        'user_id': request.user.id
    })