import os
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from openai import OpenAI


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def chat(request):
    """
    Simple AI chat proxy. Expects JSON: { messages: [{role, content}], model?, temperature?, max_tokens? }
    Returns: { role: 'assistant', content: string }
    """
    # In production require auth; in DEBUG allow anonymous for easier testing
    if not request.user.is_authenticated and not settings.DEBUG:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    api_key = os.getenv('OPENAI_API_KEY') or os.getenv('OPENAI_API_KEY_SECRET') or settings.OPENAI_API_KEY

    try:
        # If no API key, return a demo response to validate the UI flow
        if not api_key:
            data = request.data or {}
            messages = data.get('messages', [])
            last_user = ''
            for m in reversed(messages):
                if m.get('role') == 'user':
                    last_user = m.get('content', '')
                    break
            demo = f"DEMO: я получил ваше сообщение: '{last_user}'. Настройте OPENAI_API_KEY в .env, чтобы включить реальные ответы."
            return Response({'role': 'assistant', 'content': demo})

        client = OpenAI(api_key=api_key)
        data = request.data or {}
        messages = data.get('messages', [])
        if not isinstance(messages, list) or not messages:
            return Response({'error': 'messages is required and must be a non-empty list'}, status=status.HTTP_400_BAD_REQUEST)

        # Keep only the last N messages to cap cost
        max_messages = int(data.get('max_history', 20))
        msgs = messages[-max_messages:]

        # Normalize roles/content
        formatted = []
        for m in msgs:
            role = m.get('role', 'user')
            if role not in ('user', 'assistant', 'system'):
                role = 'user'
            content = m.get('content', '')
            formatted.append({'role': role, 'content': content})

        model = data.get('model', 'gpt-4o-mini')
        temperature = float(data.get('temperature', 0.6))
        max_tokens = int(data.get('max_tokens', 300))

        completion = client.chat.completions.create(
            model=model,
            messages=formatted,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        content = completion.choices[0].message.content
        return Response({'role': 'assistant', 'content': content})
    except Exception as e:
        print(f"AI Chat error: {e}")
        return Response({'error': 'AI service error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
