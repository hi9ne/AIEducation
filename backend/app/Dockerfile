FROM python:3.12
WORKDIR /app
COPY . .
RUN pip install --upgrade pip && pip install -r requirements.txt
CMD ["gunicorn", "app.wsgi:application", "--bind", "0.0.0.0:8080"]
