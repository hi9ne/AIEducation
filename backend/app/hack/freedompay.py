import os
import requests
import hashlib
import json
import uuid
import random
import string
import logging
from urllib.parse import urlencode
import xml.etree.ElementTree as ET

FREEDOMPAY_MERCHANT_ID = os.getenv('FREEDOMPAY_MERCHANT_ID', '560638')
FREEDOMPAY_SECRET_KEY = os.getenv('FREEDOMPAY_SECRET_KEY', '134v1oCpQehbmqK8')
FREEDOMPAY_API_URL = os.getenv('FREEDOMPAY_API_URL', 'https://api.freedompay.kg/init_payment.php')


def process_freedompay_payment(amount, card_number, card_expiry, card_cvv, card_holder, user, plan, client_ip=None):
    # Протокол PayBox: pg_* параметры, подпись md5
    script_name = 'init_payment.php'
    salt = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
    order_id = f"{user.id}-{plan}"
    params = {
        'pg_merchant_id': FREEDOMPAY_MERCHANT_ID,
        'pg_order_id': order_id,
        'pg_amount': amount,
        'pg_description': f'Plan {plan}',
        'pg_currency': 'KGS',
        'pg_language': 'ru',
        'pg_salt': salt,
        'pg_testing_mode': '1',
    }
    if client_ip:
        params['pg_user_ip'] = client_ip
    # Подпись: md5(script;sorted_values;secret)
    keys = sorted(params.keys())
    values = [str(params[k]) for k in keys]
    sign_str = ';'.join([script_name] + values + [FREEDOMPAY_SECRET_KEY])
    params['pg_sig'] = hashlib.md5(sign_str.encode('utf-8')).hexdigest()
    try:
        response = requests.post(FREEDOMPAY_API_URL, data=params, timeout=30)
        raw = response.text
        try:
            root = ET.fromstring(raw)
            status_val = (root.findtext('pg_status') or root.findtext('status') or '').lower()
            if status_val in ('ok', 'success'):
                txn_id = root.findtext('pg_transaction_id') or root.findtext('transaction_id')
                return {'success': True, 'transaction_id': txn_id, 'raw': raw}
            error_code = root.findtext('pg_error_code') or root.findtext('error_code')
            error_desc = root.findtext('pg_error_description') or root.findtext('error_description') or raw
            return {'success': False, 'error': f'{error_code}: {error_desc}', 'raw': raw}
        except ET.ParseError:
            return {'success': False, 'error': f'FreedomPay response not parseable: {raw}'}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def generate_payment_link(order_id: str, amount: int, description: str) -> str:
    base_url = os.getenv('PAYMENT_SYSTEM_URL', 'https://api.freedompay.kg')
    merchant_id = os.getenv('FREEDOMPAY_MERCHANT_ID', FREEDOMPAY_MERCHANT_ID)
    secret_key = os.getenv('FREEDOMPAY_SECRET_KEY', FREEDOMPAY_SECRET_KEY)
    webhook_url = os.getenv('WEBHOOK_URL', 'https://example.com/freedompay-callback')

    script_name = 'init_payment.php'
    salt = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
    params = {
        'pg_merchant_id': merchant_id,
        'pg_order_id': order_id,
        'pg_amount': amount,
        'pg_description': description,
        'pg_salt': salt,
        'pg_success_url': f"{webhook_url}?status=success&order_id={order_id}",
        'pg_failure_url': f"{webhook_url}?status=fail&order_id={order_id}",
        'pg_result_url': webhook_url,
        'pg_language': 'ru'
    }
    keys = sorted(params.keys())
    values = [str(params[k]) for k in keys]
    sign_str = ';'.join([script_name] + values + [secret_key])
    params['pg_sig'] = hashlib.md5(sign_str.encode('utf-8')).hexdigest()

    payment_url = f"{base_url}/{script_name}?" + urlencode(params)
    logging.info(f"[PAYMENT] sign_str={sign_str}")
    logging.info(f"[PAYMENT] pg_sig={params['pg_sig']}")
    logging.info(f"[PAYMENT] payment_url={payment_url}")
    return payment_url 