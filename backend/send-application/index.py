import json
import os
import smtplib
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication


def handler(event: dict, context) -> dict:
    """Принимает заявку на измерения с сайта и отправляет её на почту лаборатории со схемой объекта во вложении"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    body = json.loads(event.get('body', '{}'))

    company = body.get('company', '')
    contact_person = body.get('contactPerson', '')
    inn = body.get('inn', '')
    phone = body.get('phone', '')
    email = body.get('email', '')
    object_address = body.get('objectAddress', '')
    factors = body.get('factors', [])
    message = body.get('message', '')
    scheme_file_name = body.get('schemeFileName', '')
    scheme_file_base64 = body.get('schemeFileBase64', '')

    if not company or not contact_person or not email or not object_address:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Заполните обязательные поля'})
        }

    smtp_login = os.environ['SMTP_LOGIN']
    smtp_password = os.environ['SMTP_PASSWORD']
    recipient = 'oooclei@mail.ru'

    factors_text = ', '.join(factors) if factors else 'не указаны'

    html_content = f"""
    <h2>Новая заявка на проведение измерений</h2>
    <p><b>Организация / ФИО заказчика:</b> {company}</p>
    <p><b>Контактное лицо:</b> {contact_person}</p>
    <p><b>ИНН:</b> {inn or '-'}</p>
    <p><b>Телефон:</b> {phone or '-'}</p>
    <p><b>Email:</b> {email}</p>
    <p><b>Адрес объекта измерений:</b> {object_address}</p>
    <p><b>Исследуемые показатели:</b> {factors_text}</p>
    <p><b>Дополнительные сведения:</b> {message or '-'}</p>
    """

    msg = MIMEMultipart()
    msg['From'] = smtp_login
    msg['To'] = recipient
    msg['Subject'] = f'Заявка на измерения — {company}'
    msg.attach(MIMEText(html_content, 'html', 'utf-8'))

    if scheme_file_base64 and scheme_file_name:
        file_data = base64.b64decode(scheme_file_base64)
        attachment = MIMEApplication(file_data)
        attachment.add_header('Content-Disposition', 'attachment', filename=scheme_file_name)
        msg.attach(attachment)

    with smtplib.SMTP_SSL('smtp.mail.ru', 465) as server:
        server.login(smtp_login, smtp_password)
        server.sendmail(smtp_login, recipient, msg.as_string())

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True})
    }
