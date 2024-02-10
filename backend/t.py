import psycopg2

def test_db_connection():
    try:
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

        # Close cursor and connection
        cur.close()
        conn.close()

    except Exception as e:
        print("Unable to connect to the database")
        print(e)

def url_to_text_lists(url):
    pass

if __name__ == "__main__":
    test_db_connection()

