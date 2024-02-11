import requests
from bs4 import BeautifulSoup
import torch
from transformers import PreTrainedTokenizerFast
import numpy as np
import psycopg2
from pgvector.psycopg2 import register_vector
import asyncio
import aiohttp
from tqdm.asyncio import tqdm_asyncio
import nest_asyncio
import uvicorn


def scrape_html(url):
    # Attempt to fetch the page's HTML content using the scraping bee API
    # response = requests.get(url)
    response = requests.get(
        url='https://app.scrapingbee.com/api/v1/',
        params={
            'api_key': 'U9048JRQFEVT5EP5HC2YX6ZHNTK3HGVOP2GGHKIGMJ73OXO6GQQFJ2MEV9HY3MPIYUPLO18WIX9WQIUD',
            'url': url,
            'wait': '3000', 
        },
        
    )
    html_content = response.text
    return html_content

async def fetch_html(session, url, api_key):
    params = {
        'api_key': api_key,
        'url': url,
        'wait': '3000',
    }
    async with session.get('https://app.scrapingbee.com/api/v1/', params=params) as response:
        return await response.text()

async def scrape_html(urls, api_key):
    connector = aiohttp.TCPConnector(limit_per_host=5)  # Max of 5 concurrent connections to the same endpoint
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = []
        for url in urls:
            task = asyncio.create_task(fetch_html(session, url, api_key))
            tasks.append(task)

        html_contents = []
        for f in tqdm_asyncio.as_completed(tasks):
            result = await f
            html_contents.append(result)
        return html_contents

urls = ['https://www.instagram.com' for _ in range(10)]  # Example: replace with your actual URLs
api_key = 'U9048JRQFEVT5EP5HC2YX6ZHNTK3HGVOP2GGHKIGMJ73OXO6GQQFJ2MEV9HY3MPIYUPLO18WIX9WQIUD'

# htmls = asyncio.run(scrape_html(urls, api_key))

def html_to_text(html_content):
    # Parse the HTML content with Beautiful Soup
    soup = BeautifulSoup(html_content, 'html.parser')
    # Extract and print all text content from the HTML
    text_content = soup.get_text(separator=' ', strip=True)
    return text_content


def text_to_chunks(text_content, chunk_size):
    # Split the text content into chunks of a specific size
    chunks = [text_content[i:i+chunk_size] for i in range(0, len(text_content), chunk_size)]
    return chunks
# insta_chunks = text_to_chunks(html_to_text(htmls[0]), 100)
# insta_chunks

# use the opensearch amazon model to create sparse embeddings of documents etc.
model_path = 'opensearch-neural-sparse-encoding-v1.pt'
model = torch.jit.load(model_path)
model.to('cuda')
tokenizer_file = 'tokenizer.json'
tokenizer = PreTrainedTokenizerFast(tokenizer_file=tokenizer_file)

def chunks_to_sparse(descs):
    batches = []
    for i in range(0, len(descs), 50):
        batch = descs[i:i+50]
        batches.append(batch)
    np_vecs = []
    for batch in batches:
        t = tokenizer(batch, return_tensors='pt', padding='max_length', truncation=True, max_length=64)
        t.to('cuda')
        with torch.no_grad():
            vecs = model(t)['output']
        batch_np_vecs = vecs.cpu().detach().numpy()
        np_vecs.extend([vec for vec in batch_np_vecs])
    rfs = []
    for vec in np_vecs:
        indices = np.argwhere(vec > 0).flatten()
        tokens = tokenizer.convert_ids_to_tokens(indices)
        values = vec[indices]
        rfs.append(dict(zip(tokens, values)))
    return np_vecs, rfs
svecs = chunks_to_sparse(['oscar is a loyal farmer', 'jeremy is a hard working accountant'])
print(svecs[0][0].shape)


# DB
# we need to persist to pg and query pg
# Connect to your postgres DB
conn = psycopg2.connect(
    host="localhost",
    port="5442",
    database="dbname",
    user="user",
    password="password"
)
# Open a cursor to perform database operations
cur = conn.cursor()
# Execute a query
cur.execute("SELECT version();")
# Retrieve query result
version = cur.fetchone()
print("Connected to:", version)
# register vector type
register_vector(conn)

def test():
    conn.commit()
    cur = conn.cursor()
    cur.execute('CREATE TABLE IF NOT EXISTS test (id serial PRIMARY KEY, url text, embedding svector(30522));')
    cur.executemany('INSERT INTO test (url, embedding) VALUES (%s, %s)', [('o', svecs[0][0]), ('j', svecs[0][1])])
    qsvec = chunks_to_sparse('watching the computer screen')[0][0]
    # N.B. <-> is euclidean which we don't want. fields returns j for euclidean and o for inner product.
    # N.B. the documentation says to multiply by -1 but this is not necessary.
    cur.execute('SELECT url, embedding FROM test ORDER BY (embedding <#> %s) LIMIT 1', (qsvec,))
    print(cur.fetchone())

def create_tables():
    conn.commit()
    cur = conn.cursor()
    cur.execute('CREATE TABLE IF NOT EXISTS tabs (id serial PRIMARY KEY, url text, title text, image bytea, status text, last_visited timestamp, screenshot bytea, username varchar(255));')
    cur.execute('CREATE TABLE IF NOT EXISTS chunks (id serial PRIMARY KEY, url text, text text, embedding svector);')
    conn.commit()


def ingest_urls(user, urls):
    htmls = asyncio.run(scrape_html(urls, api_key))
    texts = [html_to_text(html) for html in htmls]
    tabs = [{'url': url, 'text': text, 'chunks': text_to_chunks(text, 100)} for url, text in zip(urls, texts)]
    chunks = [{'url': tab['url'], 'text': chunk} for tab in tabs for chunk in tab['chunks']]
    npvecs, svecs = chunks_to_sparse([chunk['text'] for chunk in chunks])
    chunks = [{**chunk, 'embedding': npvec} for chunk, npvec in zip(chunks, npvecs)]
    # start new transaction
    conn.commit()
    cur = conn.cursor()
    # insert into tabs
    cur.executemany('INSERT INTO tabs (url, username) VALUES (%s, %s)', [(tab['url'],user) for tab in tabs])
    # insert into chunks
    cur.executemany('INSERT INTO chunks (url, text, embedding) VALUES (%s, %s, %s)', [(chunk['url'], chunk['text'], chunk['embedding']) for chunk in chunks])
    cur.close()
    conn.commit()

urls = ['https://www.instagram.com', 'https://www.facebook.com']
# ingest_urls(urls)



def update_url_status(user, open_urls, bkmk_urls, hist_urls):
    cur = conn.cursor()
    cur.executemany('UPDATE tabs SET status = %s WHERE url = %s AND username = %s', [('open', url, user) for url in open_urls])
    cur.executemany('UPDATE tabs SET status = %s WHERE url = %s AND username = %s', [('bkmk', url, user) for url in bkmk_urls])
    cur.executemany('UPDATE tabs SET status = %s WHERE url = %s AND username = %s', [('hist', url, user) for url in hist_urls])
    cur.close()
    conn.commit()
update_url_status('oscar', ['https://www.instagram.com'], ['https://www.facebook.com'], [])



query = '''
WITH ranked_chunks AS (
  SELECT tabs.*, chunks.text, (chunks.embedding <#> %s) as ip,
         ROW_NUMBER() OVER(PARTITION BY tabs.id ORDER BY (chunks.embedding <#> %s) ASC) as rank
  FROM tabs
  JOIN chunks ON tabs.url = chunks.url
  WHERE tabs.username = %s
)
SELECT id, url, text
FROM ranked_chunks
WHERE rank = 1
ORDER BY ip LIMIT %s;
'''
def query_similar_tabs(user, query_prefix, k):
    conn.commit()
    cur = conn.cursor()
    qsvec = chunks_to_sparse(query_prefix)[0][0]
    cur.execute(query, (qsvec, qsvec, user, k))
    results = cur.fetchall()
    conn.commit()
    return results

from fastapi import FastAPI

app = FastAPI()


# ingest urls takes a list of urls (strings)
@app.post("/ingest_urls")
async def post_ingest_urls(urls: list[str], user: str):
    ingest_urls(user, urls)
    return {"status": "success"}

# update_url_status takes a list of open, bkmk, hist urls
@app.post("/update_url_status")
async def post_update_url_status(user: str, open_urls: list[str], bkmk_urls: list[str], hist_urls: list[str]):
    update_url_status(user, open_urls, bkmk_urls, hist_urls)
    return {"status": "success"}

# query similar tabs takes a query prefix and returns k similar tabs
@app.get("/query_similar_tabs")
async def get_query_similar_tabs(user: str, query_prefix: str, k: int = 5):
    return query_similar_tabs(user, query_prefix, k)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add CORS middleware to allow any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

def serve():
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")