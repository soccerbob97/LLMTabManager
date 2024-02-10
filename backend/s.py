#  Install the Python Requests library:
# `pip install requests`
import requests

def send_request():
    response = requests.get(
        url='https://app.scrapingbee.com/api/v1/',
        params={
            'api_key': 'U9048JRQFEVT5EP5HC2YX6ZHNTK3HGVOP2GGHKIGMJ73OXO6GQQFJ2MEV9HY3MPIYUPLO18WIX9WQIUD',
            'url': 'https://www.instagram.com', 
            'wait_for': 'body', 
        },
        
    )
    print('Response HTTP Status Code: ', response.status_code)
    print('Response HTTP Response Body: ', response.content)
send_request()
